# Environment Setup

Create a `.env.local` file in the root directory with the following:

```
# Dune Analytics API
DUNE_API_KEY=your_dune_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana RPC (Optional - defaults to public RPC)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Setup Instructions

### 1. Dune Analytics API Key
1. Go to https://dune.com/settings/api
2. Generate or copy your API key
3. Paste it in the `.env.local` file as `DUNE_API_KEY`

### 2. Supabase Database Setup
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Once the project is ready, go to Project Settings > API
4. Copy the "Project URL" and paste it as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Go to the SQL Editor in your Supabase dashboard
7. Copy the contents of `database/schema.sql` and run it to create the tables

### 3. Solana RPC (Optional)
For better performance and rate limits, consider using a premium RPC provider:
- **Helius**: https://helius.dev
- **Quicknode**: https://quicknode.com
- **Alchemy**: https://alchemy.com

Update `SOLANA_RPC_URL` with your premium RPC endpoint.

### 4. Verify Setup
Run the development server:
```bash
pnpm dev
```

Test the Dune sync endpoint:
```bash
curl http://localhost:3000/api/sync-dune
```

Note: `.env.local` is already in `.gitignore` so your API keys will not be committed to version control.

