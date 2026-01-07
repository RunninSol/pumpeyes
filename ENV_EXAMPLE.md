# Environment Variables Example

Copy this to `.env.local` and fill in your values:

```env
# Dune Analytics API
DUNE_API_KEY=your_dune_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Primary Solana RPC - SVS (Solana Vibe Station)
# 250 RPS / 250 TPS
SOLANA_RPC_URL=https://your-svs-rpc-endpoint.com
SOLANA_RPC_RPS_LIMIT=250

# Secondary Solana RPC - Corvus (FASTER)
# 800 RPS / 150 TPS
SOLANA_RPC_URL_2=https://your-corvus-rpc-endpoint.com
SOLANA_RPC_URL_2_GRPC=grpc://your-corvus-grpc-endpoint.com:443
SOLANA_RPC_URL_2_WS=wss://your-corvus-websocket-endpoint.com
SOLANA_RPC_RPS_LIMIT_2=800
```

## RPC Configuration

| Variable | Description |
|----------|-------------|
| `SOLANA_RPC_URL` | Primary RPC endpoint (SVS) - HTTP |
| `SOLANA_RPC_RPS_LIMIT` | RPS limit for primary RPC (250 for SVS) |
| `SOLANA_RPC_URL_2` | Secondary RPC endpoint (Corvus) - HTTP |
| `SOLANA_RPC_URL_2_GRPC` | gRPC endpoint for Corvus (optional, for future use) |
| `SOLANA_RPC_URL_2_WS` | WebSocket endpoint for Corvus (optional, for future use) |
| `SOLANA_RPC_RPS_LIMIT_2` | RPS limit for secondary RPC (800 for Corvus) |

## RPS Unit Consumption

Per the Corvus docs, `getAccountInfo` costs **2 RPS units** per call.

Each token requires 3 `getAccountInfo` calls = **6 RPS units per token**

| RPC | RPS Limit | Tokens/sec | Tokens/hour |
|-----|-----------|------------|-------------|
| SVS | 250 | ~41 | ~150,000 |
| Corvus | 800 | ~133 | ~480,000 |
| **Combined** | 1050 | **~174** | **~626,400** |

For 39,770 tokens: **~4 minutes total!**

