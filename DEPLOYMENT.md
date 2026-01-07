# Railway Deployment Guide

This guide will help you deploy the EYES token explorer to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account
2. Your Supabase database already populated with token data
3. Environment variables ready

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Railway:

### Required Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana RPC (for any future metadata fetching)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_RPS_LIMIT=250

# Optional: Dune Analytics (if you plan to sync more data)
DUNE_API_KEY=your_dune_api_key
```

### Getting Your Supabase Credentials:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" (this is `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the "anon public" key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Create a new project on Railway:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Next.js and configure the build

3. **Add Environment Variables:**
   - In your Railway project, go to "Variables"
   - Add all the environment variables listed above
   - Click "Deploy" to redeploy with the new variables

### Option B: Deploy with Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   railway init
   railway up
   ```

4. **Add environment variables:**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   # ... add other variables
   ```

## Step 3: Configure Domain (Optional)

1. In your Railway project, go to "Settings"
2. Under "Domains", click "Generate Domain" for a free Railway subdomain
3. Or add your custom domain

## Step 4: Verify Deployment

1. Visit your Railway-generated URL
2. Check that tokens are loading
3. Test filters and search functionality
4. Verify that images and social links are working

## Build Configuration

Railway automatically detects Next.js projects. The build process:

1. **Install dependencies:** `npm install`
2. **Build:** `npm run build`
3. **Start:** `npm run start`

## Files Excluded from Deployment

The following are excluded via `.railwayignore`:
- `data/` folder (local SQLite database)
- `scripts/` folder (enrichment scripts)
- `.env.local` (local environment variables)

## Troubleshooting

### Build Fails

- Check Railway build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working

- Make sure variable names are exact (case-sensitive)
- Redeploy after adding/changing variables
- Check that `NEXT_PUBLIC_` prefix is used for client-side variables

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check that Supabase project is not paused
- Ensure Row Level Security (RLS) policies allow public read access

### Images Not Loading

- Check that `image_uri` fields in database are valid URLs
- Verify CORS settings if images are from external sources
- Check browser console for specific errors

## Monitoring

- Railway provides automatic logging and metrics
- View logs in the Railway dashboard under "Deployments"
- Monitor memory and CPU usage in the "Metrics" tab

## Scaling

Railway automatically scales based on usage. For high traffic:

1. Consider upgrading to Railway Pro plan
2. Optimize database queries with indexes
3. Implement caching for frequently accessed data

## Cost Estimation

- **Hobby Plan (Free):**
  - $5 free credit per month
  - Good for testing and low traffic
  
- **Pro Plan ($20/month):**
  - $20 credit included
  - Pay for what you use beyond that
  - Better for production apps

## Updates and Redeployment

Railway automatically redeploys when you push to your connected GitHub branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Or manually trigger a deployment in the Railway dashboard.

## Security Notes

1. **Never commit `.env.local` to Git**
2. **Use Railway's environment variables** for all secrets
3. **Enable Supabase RLS** for production
4. **Regularly rotate API keys**

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Supabase Docs: https://supabase.com/docs

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Domain configured (optional)
- [ ] App tested and working
- [ ] Monitoring set up

