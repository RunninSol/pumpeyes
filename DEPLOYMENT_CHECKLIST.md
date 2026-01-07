# 🚀 Railway Deployment Checklist

## Pre-Deployment

- [ ] **Supabase database is populated** with 48,154 tokens
- [ ] **All enrichment is complete** (names, images, social links)
- [ ] **Environment variables ready** (Supabase URL and keys)
- [ ] **Code tested locally** (`npm run dev` works)
- [ ] **Build succeeds locally** (`npm run build` works)

## GitHub Setup

- [ ] **Initialize Git** (if not already):
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [ ] **Create GitHub repository**
  - Go to github.com/new
  - Create a new repository (public or private)

- [ ] **Push to GitHub**:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git branch -M main
  git push -u origin main
  ```

## Railway Deployment

- [ ] **Sign up/Login to Railway**
  - Visit [railway.app](https://railway.app)
  - Sign in with GitHub

- [ ] **Create New Project**
  - Click "New Project"
  - Select "Deploy from GitHub repo"
  - Choose your repository
  - Railway auto-detects Next.js

- [ ] **Add Environment Variables**
  - Go to project → "Variables" tab
  - Add these required variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SOLANA_RPC_URL` (optional)
    - `SOLANA_RPC_RPS_LIMIT` (optional)

- [ ] **Wait for Build**
  - Monitor build logs
  - Should take 2-5 minutes
  - Look for "Build successful" message

- [ ] **Generate Domain**
  - Go to "Settings" → "Domains"
  - Click "Generate Domain"
  - Note your URL: `your-app.up.railway.app`

## Post-Deployment Testing

- [ ] **Visit your Railway URL**
- [ ] **Check homepage loads** with token grid
- [ ] **Test search functionality** (search for a token name)
- [ ] **Test filters**:
  - [ ] Date range filter
  - [ ] Market cap filter
  - [ ] Social links filter (Twitter/Website/Telegram)
- [ ] **Test favorites**:
  - [ ] Add token to favorites
  - [ ] Switch to Favorites tab
  - [ ] Remove from favorites
- [ ] **Test token cards**:
  - [ ] Images load correctly
  - [ ] Social links work
  - [ ] DEX button opens DEXScreener
  - [ ] AXM button opens Axiom
  - [ ] Copy address works
- [ ] **Test infinite scroll** (scroll down to load more tokens)
- [ ] **Test on mobile** (responsive design)

## Monitoring

- [ ] **Check Railway logs** for any errors
- [ ] **Monitor memory usage** in Railway dashboard
- [ ] **Set up alerts** (optional) in Railway settings

## Optional: Custom Domain

- [ ] **Purchase domain** (if desired)
- [ ] **Add custom domain** in Railway → Settings → Domains
- [ ] **Configure DNS** with your domain provider
- [ ] **Wait for SSL certificate** (automatic)

## Troubleshooting

### If build fails:
1. Check Railway build logs for specific error
2. Verify `package.json` has all dependencies
3. Try building locally: `npm run build`
4. Check Node.js version compatibility

### If app loads but no data:
1. Verify Supabase environment variables are correct
2. Check Supabase project is not paused
3. Test Supabase connection in Railway logs
4. Verify RLS policies allow public read access

### If images don't load:
1. Check `next.config.js` has `remotePatterns` configured
2. Verify image URLs in database are valid
3. Check browser console for CORS errors

## Success Criteria

✅ App is live and accessible via Railway URL  
✅ All 48k+ tokens are visible  
✅ Search and filters work correctly  
✅ Images and social links display properly  
✅ No errors in Railway logs  
✅ Page loads in under 3 seconds  

## Next Steps

- [ ] Share your Railway URL
- [ ] Consider upgrading to Railway Pro for production
- [ ] Set up monitoring and analytics
- [ ] Plan for future updates and features

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push updates to Railway (auto-deploys)
git add .
git commit -m "Update description"
git push origin main
```

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Estimated Time to Deploy**: 10-15 minutes  
**Difficulty**: Easy 🟢

