import { NextResponse } from 'next/server'
import { getTokenMetadataDirectRPC } from '@/utils/solanaMetadata'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')
    const limit = limitParam ? parseInt(limitParam, 10) : 100
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0

    console.log('\n========================================')
    console.log(`🚀 STARTING METADATA ENRICHMENT (Offset: ${offset}, Limit: ${limit})`)
    console.log('========================================')

    // Get tokens in order by launch_date (oldest first) - process ALL tokens
    const { data: tokensToEnrich, error: fetchError } = await supabase
      .from('tokens')
      .select('address, launch_date, symbol')
      .order('launch_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      throw fetchError
    }

    if (!tokensToEnrich || tokensToEnrich.length === 0) {
      console.log('✅ No tokens need enrichment')
      return NextResponse.json({
        success: true,
        message: 'No tokens need metadata enrichment',
        tokensProcessed: 0,
      })
    }

    console.log(`📊 Found ${tokensToEnrich.length} tokens to enrich\n`)

    let successCount = 0
    let failCount = 0

    // Fetch metadata for each token
    for (let i = 0; i < tokensToEnrich.length; i++) {
      const token = tokensToEnrich[i]
      
      console.log(`\n[${i + 1}/${tokensToEnrich.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      
      try {
        const metadata = await getTokenMetadataDirectRPC(token.address)
        
        if (metadata) {
          // Update the token with metadata
          const { error: updateError } = await supabase
            .from('tokens')
            .update({
              name: metadata.name,
              symbol: metadata.symbol,
              description: metadata.description,
              image_uri: metadata.image,
              metadata_json: {
                twitter: metadata.twitter,
                website: metadata.website,
                telegram: metadata.telegram,
                showName: metadata.showName,
                createdOn: metadata.createdOn,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('address', token.address)

          if (updateError) {
            console.error(`  ❌ Database update failed:`, updateError.message)
            failCount++
          } else {
            console.log(`  💾 Saved to database successfully`)
            successCount++
          }
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`  ❌ Error:`, error instanceof Error ? error.message : 'Unknown error')
        failCount++
      }

      // Rate limiting: 4ms delay between requests (250 req/sec)
      // High performance rate for premium RPC
      await new Promise(resolve => setTimeout(resolve, 4))
    }

    console.log('\n========================================')
    console.log(`✅ BATCH COMPLETE`)
    console.log(`   Offset: ${offset}`)
    console.log(`   Processed: ${tokensToEnrich.length}`)
    console.log(`   Success: ${successCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log('========================================\n')

    return NextResponse.json({
      success: true,
      message: 'Metadata enrichment completed',
      tokensProcessed: tokensToEnrich.length,
      successCount,
      failCount,
      offset,
      nextOffset: offset + tokensToEnrich.length,
    })
  } catch (error) {
    console.error('Error in metadata enrichment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to enrich metadata', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

