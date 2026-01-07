const { Connection, PublicKey } = require('@solana/web3.js');

const RPC_ENDPOINT = 'http://ultra.rpc.solanavibestation.com/?api_key=fa7bd76a24ff1cacb198f12c5b6a422e';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

async function testToken(mintAddress) {
  console.log(`\n🔍 Testing token: ${mintAddress}\n`);
  
  try {
    const mintPubkey = new PublicKey(mintAddress);
    
    // Test 1: Get parsed account info
    console.log('📋 Test 1: getParsedAccountInfo');
    const accountInfo = await connection.getParsedAccountInfo(mintPubkey);
    console.log('Account exists:', !!accountInfo.value);
    
    if (accountInfo.value) {
      const data = accountInfo.value.data;
      console.log('Data type:', typeof data);
      console.log('Has parsed:', 'parsed' in data);
      
      if ('parsed' in data) {
        console.log('Parsed type:', data.parsed.type);
        console.log('Parsed info keys:', Object.keys(data.parsed.info));
        console.log('Has extensions:', !!data.parsed.info.extensions);
        
        if (data.parsed.info.extensions) {
          console.log('Extensions:', JSON.stringify(data.parsed.info.extensions, null, 2));
        }
      }
    }
    
    // Test 2: Get account info (raw)
    console.log('\n📋 Test 2: getAccountInfo (raw)');
    const rawAccountInfo = await connection.getAccountInfo(mintPubkey);
    console.log('Raw account exists:', !!rawAccountInfo);
    console.log('Owner:', rawAccountInfo?.owner.toBase58());
    console.log('Data length:', rawAccountInfo?.data.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test the specific token
testToken('4LVFZvWEdXUf21rVj5r64pKUA5K6DZ5qtCTZdv8Epump');

