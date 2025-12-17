# Deployment Guide - Vercel

This guide walks you through deploying the Displacement Readiness Dashboard to Vercel and configuring environment variables.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Your Mapbox access token ready

## Step 1: Push Your Code to Git

If you haven't already, push your code to a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

### Option A: During Project Setup (Recommended)

When importing your project, you'll see an **"Environment Variables"** section:

1. Click **"Add Environment Variable"**
2. Add the following:
   - **Key:** `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value:** Your Mapbox token (starts with `pk.eyJ...`)
   - **Environments:** Select all (Production, Preview, Development)
3. Click **"Deploy"**

### Option B: After Project Setup

If you've already deployed:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Enter:
   - **Key:** `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value:** Your Mapbox token
   - **Environments:** Select all (Production, Preview, Development)
5. Click **"Save"**
6. **Important:** Redeploy your project for changes to take effect:
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Select **"Redeploy"**

## Step 4: Verify Deployment

1. After deployment completes, visit your Vercel URL
2. Open browser DevTools (F12) → Console tab
3. Look for the "Mapbox token check" log message
4. The map should load correctly

## Step 5: Environment-Specific Variables (Optional)

You can set different values for different environments:

- **Production:** Your production Mapbox token
- **Preview:** Same or a test token
- **Development:** Your local development token

To set environment-specific values:
1. In Environment Variables settings
2. When adding/editing a variable, select specific environments
3. Add the variable multiple times with different values for each environment

## Troubleshooting

### Map Still Not Loading After Deployment

1. **Check Environment Variable:**
   - Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set in Vercel
   - Ensure it's enabled for the correct environment (Production/Preview)

2. **Redeploy:**
   - Environment variables are only loaded at build time
   - After adding/changing variables, you must redeploy

3. **Check Browser Console:**
   - Look for "Mapbox token check" log
   - Check for any Mapbox-related errors

4. **Verify Token Format:**
   - Mapbox tokens start with `pk.eyJ...`
   - Ensure no extra spaces or quotes in Vercel settings

### Build Errors

If you see build errors related to Mapbox:

1. Ensure `mapbox-gl` is in `package.json` dependencies (it should be)
2. Check that your Node.js version is compatible (Vercel auto-detects this)
3. Review build logs in Vercel dashboard for specific errors

## Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're public by design)
- ✅ Mapbox public tokens are meant to be used in client-side code
- ❌ Never commit `.env.local` to Git (already in `.gitignore`)
- ❌ Never use secret tokens in `NEXT_PUBLIC_*` variables

## Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure automatic deployments from your main branch
3. Set up preview deployments for pull requests
4. Monitor your Mapbox usage in the Mapbox dashboard

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Mapbox Account Dashboard](https://account.mapbox.com/)
