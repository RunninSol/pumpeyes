import { supabase, TokenRow } from './supabase';
import { Token } from '@/types/token';

/**
 * Upserts a token into the database
 * @param token - Token data to insert or update
 */
export async function upsertToken(token: Omit<TokenRow, 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tokens')
    .upsert(
      {
        ...token,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'address',
      }
    )
    .select();

  if (error) {
    console.error('Error upserting token:', error);
    throw error;
  }

  return data;
}

/**
 * Batch upsert multiple tokens
 * @param tokens - Array of token data to insert or update
 */
export async function batchUpsertTokens(tokens: Omit<TokenRow, 'created_at' | 'updated_at'>[]) {
  // Supabase has limits on batch size, so split into chunks
  const chunkSize = 1000;
  const results = [];

  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    const tokensWithTimestamp = chunk.map(token => ({
      ...token,
      updated_at: new Date().toISOString(),
    }));

    console.log(`Inserting batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(tokens.length / chunkSize)} (${chunk.length} tokens)...`);

    const { data, error } = await supabase
      .from('tokens')
      .upsert(tokensWithTimestamp, {
        onConflict: 'address',
      })
      .select();

    if (error) {
      console.error('Error batch upserting tokens:', error);
      throw error;
    }

    results.push(...(data || []));
  }

  return results;
}

export interface TokenFilters {
  dateFrom?: string;
  dateTo?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  category?: string;
  sortBy?: string;
  hasTwitter?: boolean;
  hasWebsite?: boolean;
  hasTelegram?: boolean;
  hasImage?: boolean;
  hasDescription?: boolean;
}

/**
 * Fetches all tokens from the database with filters and sorting
 * @param limit - Maximum number of tokens to fetch
 * @param offset - Number of tokens to skip (for pagination)
 * @param filters - Optional filters to apply
 */
export async function getAllTokens(limit: number = 1000, offset: number = 0, filters?: TokenFilters): Promise<Token[]> {
  let query = supabase
    .from('tokens')
    .select('*');

  // Apply date filters
  if (filters?.dateFrom) {
    query = query.gte('launch_date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('launch_date', filters.dateTo);
  }

  // Apply market cap range filter
  if (filters?.minMarketCap) {
    query = query.gte('ath', filters.minMarketCap);
  }
  if (filters?.maxMarketCap) {
    query = query.lte('ath', filters.maxMarketCap);
  }

  // Apply category filter
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  // Apply social link filters
  if (filters?.hasTwitter) {
    query = query.not('metadata_json->twitter', 'is', null);
  }
  if (filters?.hasWebsite) {
    query = query.not('metadata_json->website', 'is', null);
  }
  if (filters?.hasTelegram) {
    query = query.not('metadata_json->telegram', 'is', null);
  }

  // Apply content filters
  if (filters?.hasImage) {
    query = query.not('image_uri', 'is', null).neq('image_uri', '');
  }
  if (filters?.hasDescription) {
    query = query.not('description', 'is', null).neq('description', '');
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'launch_date_desc';
  switch (sortBy) {
    case 'launch_date_asc':
      query = query.order('launch_date', { ascending: true });
      break;
    case 'ath_desc':
      query = query.order('ath', { ascending: false, nullsFirst: false });
      break;
    case 'ath_asc':
      query = query.order('ath', { ascending: true, nullsFirst: false });
      break;
    case 'ath_24h_desc':
      query = query.order('ath_last24hrs', { ascending: false, nullsFirst: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true, nullsFirst: false });
      break;
    case 'name_desc':
      query = query.order('name', { ascending: false, nullsFirst: false });
      break;
    case 'launch_date_desc':
    default:
      query = query.order('launch_date', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }

  // Transform database rows to Token type
  return (data || []).map(row => transformTokenRow(row));
}

/**
 * Searches tokens by name or address
 * @param query - Search query string
 * @param limit - Maximum number of results
 */
export async function searchTokens(query: string, limit: number = 100): Promise<Token[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .or(`name.ilike.%${query}%,symbol.ilike.%${query}%,address.ilike.%${query}%`)
    .order('launch_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching tokens:', error);
    throw error;
  }

  return (data || []).map(row => transformTokenRow(row));
}

/**
 * Gets a single token by address
 * @param address - Token mint address
 */
export async function getTokenByAddress(address: string): Promise<Token | null> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('address', address)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching token:', error);
    throw error;
  }

  return data ? transformTokenRow(data) : null;
}

/**
 * Gets token addresses that are already in the database
 * @param addresses - Array of token addresses to check
 */
export async function getExistingTokenAddresses(addresses: string[]): Promise<string[]> {
  // If no addresses, return empty array
  if (addresses.length === 0) {
    return [];
  }

  // Supabase has a limit on array size in queries, so batch them
  const batchSize = 100;
  const existingAddresses: string[] = [];

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('tokens')
      .select('address')
      .in('address', batch);

    if (error) {
      console.error('Error checking existing tokens:', error);
      throw error;
    }

    existingAddresses.push(...(data || []).map(row => row.address));
  }

  return existingAddresses;
}

/**
 * Transforms a database row to a Token object
 */
function transformTokenRow(row: TokenRow): Token {
  return {
    id: 0, // We'll use address as the primary identifier
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
  };
}

