import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface TokenRow {
  address: string;
  launch_date: string;
  name: string | null;
  symbol: string | null;
  description: string | null;
  image_uri: string | null;
  ath: number | null;
  ath_last24hrs: number | null;
  category: string | null;
  metadata_json: {
    twitter?: string;
    website?: string;
    telegram?: string;
    showName?: boolean;
    createdOn?: string;
    [key: string]: any;
  } | null;
  created_at?: string;
  updated_at?: string;
}

