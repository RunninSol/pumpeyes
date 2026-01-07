# Railway Quick Start

## 🚀 Deploy in 5 Minutes

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect Next.js and start building

### 3. Add Environment Variables

In Railway dashboard → **Variables** tab, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_RPS_LIMIT=250
```

**Get Supabase credentials:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

### 4. Generate Domain

- Railway dashboard → **Settings** → **Domains**
- Click **"Generate Domain"**
- Your app will be live at: `your-app.up.railway.app`

### 5. Done! 🎉

Visit your Railway domain to see your app live.

---

## Troubleshooting

**Build fails?**
- Check build logs in Railway dashboard
- Ensure all env variables are set

**Database not connecting?**
- Verify Supabase credentials are correct
- Check Supabase project is active (not paused)

**Need help?**
- See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Railway Discord: https://discord.gg/railway

