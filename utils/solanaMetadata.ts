import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchMetadata, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { Connection, PublicKey } from '@solana/web3.js';

// Quiet mode - suppress verbose logging
const QUIET = process.env.QUIET === '1' || process.env.QUIET === 'true';
const log = (...args: any[]) => { if (!QUIET) console.log(...args); };
const warn = (...args: any[]) => { if (!QUIET) console.warn(...args); };

// Use Solana mainnet RPC
// Support multiple RPC endpoints for parallel workers
// Connection is created lazily to allow WORKER_ID to be set before use
let _connection: Connection | null = null;
let _rpcEndpoint: string | null = null;

function getRPCEndpoint(): string {
  if (_rpcEndpoint) return _rpcEndpoint;
  
  const workerId = process.env.WORKER_ID;
  if (workerId === '2' && process.env.SOLANA_RPC_URL_2) {
    _rpcEndpoint = process.env.SOLANA_RPC_URL_2;
  } else {
    _rpcEndpoint = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
  if (!QUIET) log(`🔗 Using RPC endpoint: ${_rpcEndpoint}`);
  return _rpcEndpoint;
}

function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(getRPCEndpoint(), 'confirmed');
  }
  return _connection;
}

/**
 * Retry wrapper with exponential backoff + jitter (as recommended by Corvus RPC)
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelayMs - Base delay in ms (default: 100)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 429 rate limit error
      const is429 = error?.message?.includes('429') || 
                    error?.message?.includes('Too Many Requests') ||
                    error?.message?.includes('rate limit');
      
      if (attempt < maxRetries && is429) {
        // Exponential backoff with jitter: base * 2^attempt + random jitter
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 100;
        log(`  ⏳ Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (attempt < maxRetries) {
        // Non-429 error, shorter retry
        const delay = baseDelayMs + Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image: string | null;
  twitter?: string;
  website?: string;
  telegram?: string;
  showName?: boolean;
  createdOn?: string;
}

/**
 * Converts IPFS URI to HTTP gateway URL
 * @param uri - The URI (could be ipfs://, https://ipfs.io, or regular http)
 * @returns HTTP-accessible URL
 */
function normalizeIPFSUri(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return uri;
}

/**
 * Extracts social links from metadata JSON
 * Pump.fun tokens store social links in various places in the JSON
 * @param json - The metadata JSON object
 * @returns Object with extracted social links
 */
function extractSocialLinksFromJSON(json: any): {
  twitter?: string;
  website?: string;
  telegram?: string;
} {
  const socialLinks: { twitter?: string; website?: string; telegram?: string } = {};
  
  // Twitter/X - check multiple possible locations
  socialLinks.twitter = 
    json.twitter || 
    json.extensions?.twitter || 
    json.socials?.twitter ||
    json.links?.twitter ||
    json.social?.twitter ||
    undefined;
  
  // Website - check multiple possible locations
  socialLinks.website = 
    json.website || 
    json.extensions?.website || 
    json.socials?.website ||
    json.links?.website ||
    json.external_url ||
    undefined;
  
  // Telegram - check multiple possible locations
  socialLinks.telegram = 
    json.telegram || 
    json.extensions?.telegram ||
    json.socials?.telegram ||
    json.links?.telegram ||
    json.social?.telegram ||
    undefined;
  
  log(`  🔗 Extracted social links from JSON:`, socialLinks);
  
  return socialLinks;
}

/**
 * Fetches token metadata from Token-2022 extensions (pump.fun uses this)
 * @param mintAddress - The token mint address
 * @returns Token metadata extracted from Token-2022 extensions
 */
async function getToken2022Metadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    
    // Get parsed account info - this will show Token-2022 extensions
    const accountInfo = await withRetry(() => getConnection().getParsedAccountInfo(mintPubkey));
    
    if (!accountInfo.value) {
      warn(`No account found for ${mintAddress}`);
      return null;
    }
    
    const data = accountInfo.value.data;
    
    // Check if it's a parsed token account
    if (typeof data === 'object' && 'parsed' in data && data.parsed.type === 'mint') {
      const extensions = data.parsed.info.extensions;
      
      if (extensions) {
        // Look for tokenMetadata extension
        const metadataExtension = extensions.find((ext: any) => ext.extension === 'tokenMetadata');
        
        if (metadataExtension && metadataExtension.state) {
          const state = metadataExtension.state;
          const name = state.name || 'Unknown';
          const symbol = state.symbol || 'UNKNOWN';
          const uri = state.uri || '';
          
          log(`Found Token-2022 metadata for ${mintAddress}: ${name} (${symbol}) - URI: ${uri}`);
          
          // Fetch the JSON from the URI
          if (uri) {
            try {
              const normalizedUri = normalizeIPFSUri(uri);
              const response = await fetch(normalizedUri, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(10000),
              });
              
              if (response.ok) {
                const json = await response.json();
                
                log(`  📄 Fetched JSON metadata:`, JSON.stringify(json, null, 2));
                
                // Extract social links from the JSON
                const socialLinks = extractSocialLinksFromJSON(json);
                
                return {
                  name: name,
                  symbol: symbol,
                  description: json.description || undefined,
                  image: json.image || null,
                  twitter: socialLinks.twitter || undefined,
                  website: socialLinks.website || undefined,
                  telegram: socialLinks.telegram || undefined,
                  showName: json.showName || undefined,
                  createdOn: json.createdOn || undefined,
                };
              }
            } catch (fetchError) {
              warn(`Failed to fetch URI ${uri}:`, fetchError);
            }
          }
          
          // Return at least the on-chain data
          return {
            name: name,
            symbol: symbol,
            image: null,
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch Token-2022 metadata for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Fetches token metadata directly from RPC by reading the token account
 * @param mintAddress - The token mint address
 * @returns Token metadata extracted from on-chain data
 */
async function getMetadataFromRPC(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    // First try Token-2022 (pump.fun uses this)
    const token2022Metadata = await getToken2022Metadata(mintAddress);
    if (token2022Metadata) {
      return token2022Metadata;
    }
    
    const mintPubkey = new PublicKey(mintAddress);
    
    // Try Metaplex metadata
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Fetch the account info
    const accountInfo = await withRetry(() => getConnection().getAccountInfo(metadataPDA));
    
    if (!accountInfo) {
      warn(`No metadata found for ${mintAddress}`);
      return null;
    }

    // Parse the metadata account data
    const data = accountInfo.data;
    
    // Metadata account structure (simplified):
    // 0-1: key (1 byte)
    // 1-33: update authority (32 bytes)
    // 33-65: mint (32 bytes)
    // 65-69: name length (4 bytes)
    // 69-69+name_len: name
    // After name: symbol length (4 bytes)
    // After symbol_len: symbol
    // After symbol: uri length (4 bytes)
    // After uri_len: uri
    
    let offset = 1 + 32 + 32; // Skip key, update authority, and mint
    
    // Read name
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const nameBytes = data.slice(offset, offset + nameLength);
    const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
    offset += nameLength;
    
    // Read symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbolBytes = data.slice(offset, offset + symbolLength);
    const symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
    offset += symbolLength;
    
    // Read URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uriBytes = data.slice(offset, offset + uriLength);
    const uri = uriBytes.toString('utf8').replace(/\0/g, '').trim();
    
    log(`Found metadata for ${mintAddress}: ${name} (${symbol}) - URI: ${uri}`);
    
    // Now fetch the JSON from the URI
    if (uri) {
      try {
        const normalizedUri = normalizeIPFSUri(uri);
        const response = await fetch(normalizedUri, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000),
        });
        
        if (response.ok) {
          const json = await response.json();
          
          log(`  📄 Fetched JSON metadata:`, JSON.stringify(json, null, 2));
          
          // Extract social links from the JSON
          const socialLinks = extractSocialLinksFromJSON(json);
          
          return {
            name: name || json.name || 'Unknown',
            symbol: symbol || json.symbol || 'UNKNOWN',
            image: json.image || null,
            twitter: socialLinks.twitter,
            website: socialLinks.website,
            telegram: socialLinks.telegram,
          };
        }
      } catch (fetchError) {
        warn(`Failed to fetch URI ${uri}:`, fetchError);
      }
    }
    
    // Return at least the on-chain data
    return {
      name: name || 'Unknown',
      symbol: symbol || 'UNKNOWN',
      image: null,
    };
    
  } catch (error) {
    console.error(`Failed to fetch RPC metadata for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Fetches token metadata from Solana blockchain using Metaplex standards
 * Falls back to pump.fun API if Metaplex metadata doesn't exist
 * @param mintAddress - The token mint address
 * @returns Token metadata including name, symbol, image, and social links
 */
export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const umi = createUmi(getRPCEndpoint());
    const mint = publicKey(mintAddress);
    
    // 1. Find the Metadata Account Address (PDA) using Metaplex standards
    const metadataPda = findMetadataPda(umi, { mint });

    // 2. Fetch the on-chain account data
    const metadataAccount = await fetchMetadata(umi, metadataPda);

    // 3. The URI inside the account points to the off-chain JSON (usually Arweave or IPFS)
    const uri = metadataAccount.uri;

    if (!uri) {
      warn(`No URI found for token ${mintAddress}, trying direct RPC`);
      return await getMetadataFromRPC(mintAddress);
    }

    // 4. Fetch the actual JSON metadata
    const normalizedUri = normalizeIPFSUri(uri);
    const response = await fetch(normalizedUri, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      warn(`Failed to fetch metadata JSON for ${mintAddress}: ${response.status}, trying direct RPC`);
      return await getMetadataFromRPC(mintAddress);
    }

    const json = await response.json();

    log(`  📄 Fetched JSON metadata:`, JSON.stringify(json, null, 2));

    // Extract social links from the JSON
    const socialLinks = extractSocialLinksFromJSON(json);

    return {
      name: json.name || metadataAccount.name || 'Unknown',
      symbol: json.symbol || metadataAccount.symbol || 'UNKNOWN',
      description: json.description || undefined,
      image: json.image || null,
      twitter: socialLinks.twitter,
      website: socialLinks.website,
      telegram: socialLinks.telegram,
      showName: json.showName || undefined,
      createdOn: json.createdOn || undefined,
    };
  } catch (error) {
    // If Metaplex fails (e.g., AccountNotFoundError), try direct RPC fetch
    warn(`Metaplex fetch failed for ${mintAddress}, trying direct RPC`);
    return await getMetadataFromRPC(mintAddress);
  }
}

/**
 * Main entry point - tries Token-2022 FIRST, then Metaplex SDK, then manual RPC parsing
 */
export async function getTokenMetadataDirectRPC(mintAddress: string): Promise<TokenMetadata | null> {
  log(`\n🔍 Processing token: ${mintAddress}`);
  
  // Try Token-2022 FIRST (direct RPC) - 1 RPC call
  try {
    log(`  ⚡ Trying Token-2022 direct RPC...`);
    const token2022Result = await getToken2022Metadata(mintAddress);
    if (token2022Result) {
      log(`  ✅ SUCCESS via Token-2022: ${token2022Result.name} (${token2022Result.symbol})`);
      return token2022Result;
    }
  } catch (error) {
    log(`  ⚠️  Token-2022 failed, trying Metaplex SDK...`);
  }
  
  // Try Metaplex SDK - 1 RPC call
  try {
    log(`  ⚡ Trying Metaplex SDK...`);
    const metaplexResult = await getTokenMetadata(mintAddress);
    if (metaplexResult) {
      log(`  ✅ SUCCESS via Metaplex SDK: ${metaplexResult.name} (${metaplexResult.symbol})`);
      return metaplexResult;
    }
  } catch (error) {
    log(`  ⚠️  Metaplex SDK failed, trying manual RPC parsing...`);
  }
  
  // Try manual RPC parsing as final fallback - 1 RPC call
  try {
    log(`  ⚡ Trying manual RPC parsing...`);
    const manualResult = await getMetadataFromRPC(mintAddress);
    if (manualResult) {
      log(`  ✅ SUCCESS via manual RPC: ${manualResult.name} (${manualResult.symbol})`);
      return manualResult;
    }
  } catch (error) {
    log(`  ❌ Manual RPC also failed`);
  }
  
  log(`  ❌ FAILED: No metadata found for ${mintAddress}`);
  return null;
}

/**
 * Batch fetch metadata for multiple tokens with rate limiting
 * @param mintAddresses - Array of token mint addresses
 * @param delayMs - Delay between requests in milliseconds (default: 200ms)
 * @returns Array of token metadata (null for failed fetches)
 */
export async function batchGetTokenMetadata(
  mintAddresses: string[],
  delayMs: number = 200
): Promise<(TokenMetadata | null)[]> {
  const results: (TokenMetadata | null)[] = [];
  
  for (let i = 0; i < mintAddresses.length; i++) {
    const metadata = await getTokenMetadata(mintAddresses[i]);
    results.push(metadata);
    
    // Add delay between requests to avoid rate limiting
    if (i < mintAddresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    // Log progress every 10 tokens
    if ((i + 1) % 10 === 0) {
      log(`Fetched metadata for ${i + 1}/${mintAddresses.length} tokens`);
    }
  }
  
  return results;
}

