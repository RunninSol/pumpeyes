// Test the actual metadata fetching function
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { fetchMetadata, findMetadataPda } = require('@metaplex-foundation/mpl-token-metadata');
const { publicKey } = require('@metaplex-foundation/umi');

const RPC_ENDPOINT = 'http://ultra.rpc.solanavibestation.com/?api_key=fa7bd76a24ff1cacb198f12c5b6a422e';

async function testMetadataFetch(mintAddress) {
  console.log(`\n🔍 Testing metadata fetch for: ${mintAddress}\n`);
  
  try {
    const umi = createUmi(RPC_ENDPOINT);
    const mint = publicKey(mintAddress);
    
    console.log('Step 1: Finding metadata PDA...');
    const metadataPda = findMetadataPda(umi, { mint });
    console.log('Metadata PDA:', metadataPda);
    
    console.log('\nStep 2: Fetching metadata account...');
    const metadataAccount = await fetchMetadata(umi, metadataPda);
    console.log('Metadata account found!');
    console.log('Name:', metadataAccount.name);
    console.log('Symbol:', metadataAccount.symbol);
    console.log('URI:', metadataAccount.uri);
    
    console.log('\nStep 3: Fetching JSON from URI...');
    const uri = metadataAccount.uri;
    
    if (!uri) {
      console.log('❌ No URI found');
      return;
    }
    
    const response = await fetch(uri, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ Failed to fetch URI');
      return;
    }
    
    const json = await response.json();
    console.log('\nStep 4: JSON metadata:');
    console.log(JSON.stringify(json, null, 2));
    
    console.log('\n✅ SUCCESS!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Error type:', error.constructor.name);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
  }
}

testMetadataFetch('4LVFZvWEdXUf21rVj5r64pKUA5K6DZ5qtCTZdv8Epump');

