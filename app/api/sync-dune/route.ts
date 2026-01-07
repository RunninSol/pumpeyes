import { NextResponse } from 'next/server'
import { batchUpsertTokens, getExistingTokenAddresses } from '@/lib/database'
import { TokenRow } from '@/lib/supabase'

// Force dynamic rendering - don't pre-render during build
// This prevents accidental data overwrites during deployment
export const dynamic = 'force-dynamic'

interface DuneTokenRow {
  token?: string; // HTML link with address
  symbol?: string; // HTML link with symbol
  graduated_date?: string;
  ath?: number;
  ath_last24hrs?: number;
  category?: string;
  [key: string]: any;
}

// Extract address from HTML link like: <a href="...">ADDRESS</a>
function extractAddress(html: string): string | null {
  if (!html) return null;
  const match = html.match(/>([A-Za-z0-9]{30,50})</);
  return match ? match[1] : null;
}

// Extract symbol from HTML link
function extractSymbol(html: string): string | null {
  if (!html) return null;
  const match = html.match(/>([^<]+)</);
  return match ? match[1] : null;
}

export async function GET() {
  try {
    const apiKey = process.env.DUNE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'DUNE_API_KEY environment variable is not set' },
        { status: 500 }
      )
    }

    console.log('Starting Dune sync process...')
    
    // Query ID 4900797 as specified in PRD
    const queryId = 4900797
    const limit = 1000
    let offset = 0
    let allRows: DuneTokenRow[] = []
    let hasMore = true
    
    // Fetch all rows with pagination
    while (hasMore) {
      console.log(`Fetching rows ${offset} to ${offset + limit}...`)
      
      const response = await fetch(
        `https://api.dune.com/api/v1/query/${queryId}/results?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'x-dune-api-key': apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Dune API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const rows = data.result?.rows as DuneTokenRow[] || []
      
      if (rows.length === 0) {
        hasMore = false
      } else {
        allRows.push(...rows)
        offset += limit
        
        console.log(`Fetched ${allRows.length} rows so far...`)
        
        // Check if we've reached the total
        const totalRows = data.result?.metadata?.total_row_count
        if (totalRows && offset >= totalRows) {
          hasMore = false
        }
      }
    }
    
    const rows = allRows
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tokens found in Dune query result',
        tokensProcessed: 0,
      })
    }

    console.log(`Found ${rows.length} tokens from Dune`)

    // Helper function to sanitize strings (remove null characters)
    const sanitize = (str: string | null): string | null => {
      if (!str) return null;
      return str.replace(/\u0000/g, '');
    };

    // Extract token data from Dune results
    const duneTokens = rows.map(row => {
      // Extract address and symbol from HTML links
      const address = extractAddress(row.token || '');
      const symbol = extractSymbol(row.symbol || '');
      const launchDate = row.graduated_date || new Date().toISOString();
      const category = row.category || null;
      const ath = row.ath || null;
      const athLast24hrs = row.ath_last24hrs || null;
      
      return {
        address: sanitize(address || '') || '',
        symbol: sanitize(symbol),
        launchDate: launchDate.toString(),
        category: sanitize(category),
        ath,
        athLast24hrs,
      };
    }).filter(token => token.address); // Filter out any tokens without addresses

    console.log(`Extracted ${duneTokens.length} valid token addresses`)

    // Check which tokens already exist in the database
    let existingAddresses: string[] = []
    try {
      existingAddresses = await getExistingTokenAddresses(
        duneTokens.map(t => t.address)
      );
      console.log(`${existingAddresses.length} tokens already in database`)
    } catch (error) {
      console.error('Error checking existing tokens, assuming none exist:', error)
      existingAddresses = []
    }

    // Filter to only new tokens
    const newTokens = duneTokens.filter(
      token => !existingAddresses.includes(token.address)
    );

    console.log(`Processing ${newTokens.length} new tokens`)

    if (newTokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All tokens are already in the database',
        tokensProcessed: 0,
        totalTokens: duneTokens.length,
      })
    }

    // Insert tokens with Dune data (symbol from Dune, metadata from Solana comes later)
    const tokensToInsert: Omit<TokenRow, 'created_at' | 'updated_at'>[] = newTokens.map(token => ({
      address: token.address,
      launch_date: token.launchDate,
      name: null, // Will be filled by metadata enrichment
      symbol: token.symbol, // From Dune
      description: null, // Will be filled by metadata enrichment
      image_uri: null, // Will be filled by metadata enrichment
      ath: token.ath,
      ath_last24hrs: token.athLast24hrs,
      category: token.category,
      metadata_json: null,
    }))

    // Batch insert all tokens immediately
    console.log(`Inserting ${tokensToInsert.length} tokens into database (without metadata)`)
    await batchUpsertTokens(tokensToInsert);

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      tokensProcessed: tokensToInsert.length,
      totalTokens: duneTokens.length,
      newTokens: tokensToInsert.length,
      existingTokens: existingAddresses.length,
    })
  } catch (error) {
    console.error('Error in sync-dune:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync Dune data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

