import { NextResponse } from 'next/server'
import { searchTokens } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '100')
    
    if (!query.trim()) {
      return NextResponse.json({ 
        success: true, 
        tokens: [],
        message: 'No search query provided'
      })
    }

    const tokens = await searchTokens(query, limit)
    
    return NextResponse.json({ 
      success: true, 
      tokens,
      count: tokens.length
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search tokens' },
      { status: 500 }
    )
  }
}

