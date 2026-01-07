# Pump.fun Token Explorer

A high-performance dashboard for discovering and exploring Pump.fun tokens, powered by Dune Analytics and Solana blockchain data.

## Features

- 🎨 Dark mode UI with clean, snappy design
- 🔍 Advanced search and filtering capabilities
- 📊 Token cards displaying metadata (PFP, social links, launch date)
- 🔄 Real-time data sync from Dune Analytics
- ⚡ Optimized for performance with virtualization support

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Dune Analytics API key
- Supabase account (free tier works)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:
```bash
DUNE_API_KEY=your_dune_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

3. Set up the database:

- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and run the contents of `database/schema.sql`
- If you already have the table, run `database/add_market_cap_fields.sql` to add the new columns

4. Run the development server:
```bash
pnpm dev
```

5. Sync data from Dune Analytics:
```bash
# Step 1: Fast sync from Dune (writes addresses to database)
curl http://localhost:3000/api/sync-dune

# Step 2: Enrich with metadata (fetches from Solana blockchain)
curl http://localhost:3000/api/enrich-metadata?limit=50
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── sync-dune/      # Dune API integration & metadata enrichment
│   │   └── tokens/         # Token data API endpoints
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with 25/75 split
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── SearchSidebar.tsx   # Left sidebar with advanced filters
│   ├── SearchBar.tsx       # Top search bar
│   ├── TokenGrid.tsx       # Token grid container with data fetching
│   └── TokenCard.tsx       # Individual token card component
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   └── database.ts         # Database operations & queries
├── utils/
│   └── solanaMetadata.ts   # Solana blockchain metadata fetcher
├── database/
│   └── schema.sql          # PostgreSQL database schema
└── ...
```

## Development Roadmap

- [x] Phase 1: Setup & Dune Connection
- [x] Phase 2: RPC Metadata Fetcher (Solana integration)
- [x] Phase 3: Database Integration (Supabase)
- [x] Phase 4: Frontend Data Integration
- [ ] Phase 5: Virtualization for large datasets

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Source:** Dune Analytics API
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Solana Web3.js + Metaplex Token Metadata

## API Endpoints

### `/api/sync-dune` (GET)
Syncs token data from Dune Analytics to database (fast, no metadata).

**Response:**
```json
{
  "success": true,
  "tokensProcessed": 25,
  "totalTokens": 100,
  "newTokens": 25,
  "existingTokens": 75
}
```

### `/api/enrich-metadata` (GET)
Fetches on-chain metadata for tokens that don't have it yet.

**Query Parameters:**
- `limit`: Maximum number of tokens to enrich (default: 50)

**Response:**
```json
{
  "success": true,
  "tokensProcessed": 50,
  "successCount": 45,
  "failCount": 5
}
```

### `/api/tokens` (GET)
Fetches all tokens from the database.

**Query Parameters:**
- `q`: Search query (filters by name, symbol, or address)
- `limit`: Maximum number of results (default: 1000)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "tokens": [...],
  "count": 100
}
```

### `/api/tokens/[address]` (GET)
Fetches a single token by its mint address.

## Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variable setup guide
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed technical documentation
- [howto.md](./howto.md) - Original PRD and requirements

## License

MIT

