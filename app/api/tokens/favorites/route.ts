import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Token } from '@/types/token'

export async function POST(req: NextRequest) {
  try {
    const { addresses } = await req.json()

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ success: true, tokens: [] })
    }

    // Fetch tokens by addresses
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .in('address', addresses)
      .order('launch_date', { ascending: false })

    if (error) {
      console.error('Supabase error fetching favorites:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Transform to Token type
    const tokens: Token[] = (data || []).map(row => ({
      id: 0,
      address: row.address,
      name: row.name || 'Unknown',
      symbol: row.symbol || 'UNKNOWN',
      description: row.description || undefined,
      launchDate: new Date(row.launch_date),
      image: row.image_uri || '',
      ath: row.ath || undefined,
      ath_last24hrs: row.ath_last24hrs || undefined,
      category: row.category || undefined,
      twitter: row.metadata_json?.twitter,
      website: row.metadata_json?.website,
      telegram: row.metadata_json?.telegram,
    }))

    return NextResponse.json({ success: true, tokens })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

