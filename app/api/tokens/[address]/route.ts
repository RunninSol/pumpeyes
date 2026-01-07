import { NextResponse } from 'next/server'
import { getTokenByAddress } from '@/lib/database'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      )
    }

    const token = await getTokenByAddress(address)

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('Error fetching token:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch token', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

