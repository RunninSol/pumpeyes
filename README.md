# 👁️ EYES - Pump.fun Token Explorer

A modern, high-performance token explorer for Pump.fun tokens on Solana. Built with Next.js 14, featuring advanced filtering, real-time search, and comprehensive token metadata.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Features

### 🔍 Advanced Search & Filtering
- **Real-time Search**: Search by token name, symbol, or address across entire database
- **Date Range Filter**: Filter tokens by launch date with intuitive date picker
- **Market Cap Filter**: Filter by ATH market cap with preset options
- **Social Links Filter**: Filter tokens with Twitter, Website, or Telegram
- **Server-side Processing**: All filters query the database directly for instant results

### 🎨 Modern UI/UX
- **Dark Theme**: Sleek dark design with orange/red accents
- **Responsive Grid**: 1-4 columns based on screen size
- **Infinite Scroll**: Smooth pagination loading 1000 tokens at a time
- **Token Cards**: Beautiful cards with PFP, metadata, and social links
- **Favorites System**: Save favorite tokens with localStorage persistence

### 🚀 Performance
- **48,154 Tokens**: Fully enriched with metadata
- **Fast Queries**: Optimized database queries with indexes
- **Lazy Loading**: Images and data loaded on demand
- **Optimized Bundle**: 93.5 kB first load JS

### 🔗 Integrations
- **DEXScreener**: Direct links to token trading pairs
- **Axiom**: Quick access to Axiom trading interface
- **Social Links**: One-click access to Twitter, Website, Telegram
- **Copy Address**: Easy clipboard copy with visual feedback

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- **Metadata**: [Metaplex](https://www.metaplex.com/)
- **Data Source**: [Dune Analytics](https://dune.com/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Dune Analytics API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RunninSol/pumpeyes.git
   cd pumpeyes
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: For syncing new tokens
   DUNE_API_KEY=your_dune_api_key
   SOLANA_RPC_URL=your_rpc_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📦 Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Run Database Schema

Execute the SQL in `database/schema.sql` in your Supabase SQL editor.

### 3. Import Token Data

The database comes pre-populated with 48,154 enriched tokens. If you need to sync new data:

```bash
npm run sync-dune
npm run enrich
npm run upload
```

## 🚂 Deploy to Railway

### Quick Deploy (5 minutes)

1. **Push to GitHub** (already done! ✅)

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `RunninSol/pumpeyes`
   - Railway auto-detects Next.js

3. **Add Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Generate Domain**
   - Settings → Domains → Generate Domain
   - Your app is live! 🎉

📖 **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Project Structure

```
pumpeyes/
├── app/
│   ├── api/              # API routes
│   │   ├── tokens/       # Token data endpoints
│   │   ├── search/       # Search endpoint
│   │   └── health/       # Health check
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── TokenCard.tsx     # Individual token card
│   ├── TokenGrid.tsx     # Token grid with infinite scroll
│   ├── SearchBar.tsx     # Search input
│   ├── SearchSidebar.tsx # Filters sidebar
│   └── DateRangePicker.tsx # Date range selector
├── lib/
│   ├── database.ts       # Database queries
│   ├── supabase.ts       # Supabase client
│   └── favorites.ts      # Favorites management
├── types/
│   └── token.ts          # TypeScript types
├── database/
│   └── schema.sql        # Database schema
└── utils/
    └── solanaMetadata.ts # Metadata fetching
```

## 🎯 Features in Detail

### Token Cards
Each token card displays:
- **Profile Image**: Token logo/PFP
- **Name & Symbol**: Token identifier
- **Launch Date**: When the token was created
- **ATH Market Cap**: All-time high market cap
- **24h High**: Highest market cap in last 24 hours
- **Category**: Token category (if available)
- **Social Links**: Twitter, Website, Telegram
- **Quick Actions**: DEX, Axiom, Copy address
- **Favorite**: Star to save to favorites

### Filtering System
- **Date Range**: Select from presets or custom dates
- **Market Cap**: Filter by maximum ATH
- **Social Presence**: Show only tokens with specific social links
- **Favorites**: Dedicated tab for saved tokens
- **Search**: Full-text search across name, symbol, address

### Performance Optimizations
- Server-side filtering and search
- Infinite scroll pagination
- Image lazy loading
- Optimized database indexes
- Static page pre-rendering
- SWC minification

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

See [ENV_EXAMPLE.md](./ENV_EXAMPLE.md) for all available environment variables.

## 📊 Database Stats

- **Total Tokens**: 48,154
- **Enriched**: 48,152 (99.996%)
- **With Images**: ~95%
- **With Social Links**: ~40%
- **With Descriptions**: ~30%

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Pump.fun](https://pump.fun) - Token data source
- [Dune Analytics](https://dune.com) - Data aggregation
- [Supabase](https://supabase.com) - Database hosting
- [Railway](https://railway.app) - Deployment platform
- [Solana](https://solana.com) - Blockchain platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/RunninSol/pumpeyes/issues)
- **Deployment Help**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start**: See [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md)

---

Built with ❤️ for the Solana community

**Live Demo**: Coming soon on Railway! 🚂
