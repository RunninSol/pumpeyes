import { NextResponse } from 'next/server'
import { getAllTokens, searchTokens, TokenFilters } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    const limit = limitParam ? parseInt(limitParam, 10) : 1000
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0

    // Parse filters from query params
    const filters: TokenFilters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minMarketCap: searchParams.get('minMarketCap') ? parseFloat(searchParams.get('minMarketCap')!) : undefined,
      maxMarketCap: searchParams.get('maxMarketCap') ? parseFloat(searchParams.get('maxMarketCap')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'launch_date_desc',
      hasTwitter: searchParams.get('hasTwitter') === 'true',
      hasWebsite: searchParams.get('hasWebsite') === 'true',
      hasTelegram: searchParams.get('hasTelegram') === 'true',
      hasImage: searchParams.get('hasImage') === 'true',
      hasDescription: searchParams.get('hasDescription') === 'true',
    }

    let tokens;

    if (query) {
      // Search tokens by name, symbol, or address
      tokens = await searchTokens(query, limit)
    } else {
      // Get all tokens with pagination and filters
      tokens = await getAllTokens(limit, offset, filters)
    }

    return NextResponse.json({
      success: true,
      tokens,
      count: tokens.length,
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tokens', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

