import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get distinct categories from the database
    const { data, error } = await supabase
      .from('tokens')
      .select('category')
      .not('category', 'is', null)
      .order('category')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Extract unique categories
    const categories = [...new Set(data?.map(row => row.category).filter(Boolean))]
    
    return NextResponse.json({ success: true, categories })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

