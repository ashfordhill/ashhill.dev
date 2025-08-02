# Simple Cloudflare Pages Deployment

## What You Need:
- ✅ Your GitHub repository (already have this)
- ✅ A Cloudflare account (free)
- ✅ 5 minutes of setup time

## Step-by-Step Deployment:

### 1. Commit Your Current Changes
```bash
git add .
git commit -m "Configure for Cloudflare Pages deployment"
git push origin main
```

### 2. Connect to Cloudflare Pages
1. **Go to**: https://dash.cloudflare.com/pages
2. **Click**: "Create a project"
3. **Click**: "Connect to Git"
4. **Authorize**: Cloudflare to access your GitHub (OAuth - no API tokens!)
5. **Select**: Your `ashhill.dev` repository

### 3. Configure Build Settings
- **Project name**: `ashhill-portfolio`
- **Production branch**: `main`
- **Framework preset**: `Next.js (Static HTML Export)`
- **Build command**: `cd ash-portfolio && npm install && npm run build`
- **Build output directory**: `ash-portfolio/out`
- **Root directory**: (leave empty)

### 4. Deploy!
- **Click**: "Save and Deploy"
- **Wait**: ~2-3 minutes for first build
- **Get**: Your live URL (something like `ashhill-portfolio.pages.dev`)

## That's It! 🎉

### What Happens Automatically:
- ✅ **Every push to `main`** → Automatic deployment
- ✅ **Every Pull Request** → Preview deployment with unique URL
- ✅ **Build failures** → Email notifications
- ✅ **Custom domain** → Can be added later in Pages settings

### No API Tokens Required!
The direct connection uses OAuth, so no complex API setup needed.

### If You Want a Custom Domain Later:
1. Go to your Pages project settings
2. Add your custom domain
3. Update your DNS records as instructed
4. Get free SSL certificate automatically

## Troubleshooting:
If the build fails, check the build logs in Cloudflare Pages dashboard. Common issues:
- Node.js version (should auto-detect 18)
- Build command path (make sure `cd ash-portfolio` is correct)
- Dependencies (Cloudflare will run `npm install` automatically)