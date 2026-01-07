import { NextResponse } from 'next/server'

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiKey = process.env.DUNE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'DUNE_API_KEY not set' }, { status: 500 })
    }

    const queryId = 4900797
    
    const response = await fetch(
      `https://api.dune.com/api/v1/query/${queryId}/results?limit=10`,
      {
        headers: {
          'x-dune-api-key': apiKey,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({
        error: `Dune API error: ${response.status}`,
        statusText: response.statusText,
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      fullResponse: data,
      rowCount: data.result?.rows?.length || 0,
      firstRow: data.result?.rows?.[0] || null,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

