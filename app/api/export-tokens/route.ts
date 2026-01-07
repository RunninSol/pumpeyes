import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET() {
  try {
    console.log('📥 Fetching all tokens from Supabase...');
    
    let allTokens: any[] = [];
    let offset = 0;
    const BATCH_SIZE = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('launch_date', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      allTokens = allTokens.concat(data);
      console.log(`   Fetched ${allTokens.length} tokens so far...`);

      if (data.length < BATCH_SIZE) {
        break;
      }

      offset += BATCH_SIZE;
    }

    console.log(`✅ Total tokens fetched: ${allTokens.length}`);

    return NextResponse.json({
      success: true,
      tokens: allTokens,
      count: allTokens.length,
    });
  } catch (error) {
    console.error('Error exporting tokens:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export tokens', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

