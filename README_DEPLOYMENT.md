# Vercel Deployment Guide

## Quick Fix for DEPLOYMENT_NOT_FOUND Error

### Problem
Your React app is in a `web` subdirectory, but Vercel is trying to deploy from the root directory by default.

### Solution
The `vercel.json` file has been created to configure Vercel to:
- Build from the `web` directory
- Install dependencies in `web`
- Output the build to `web/build`
- Handle React Router routing correctly

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. **Important**: In project settings:
   - **Root Directory**: Leave as root (`.`)
   - **Build Command**: `cd web && npm run build`
   - **Output Directory**: `web/build`
   - **Install Command**: `cd web && npm install`
5. Deploy!

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project root
cd d:\servy\servy-admin

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

### Option 3: Use vercel.json (Already Created)
The `vercel.json` file in the root should automatically configure everything. Just deploy normally.

## Environment Variables (If Needed Later)
If you need environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `REACT_APP_API_URL` (for your backend API)
   - Any other `REACT_APP_*` variables

## Troubleshooting

### If deployment still fails:
1. Check that `web/package.json` exists and has a `build` script
2. Verify Node.js version (Vercel uses Node 18.x by default)
3. Check build logs in Vercel dashboard for specific errors

### If routes don't work:
The `rewrites` rule in `vercel.json` handles React Router's client-side routing.

