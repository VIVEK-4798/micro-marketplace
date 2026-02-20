# Vercel Deployment Fix Guide

## Issue
Getting 404 NOT_FOUND error when visiting your deployed Vercel site.

## Root Causes
1. ❌ Environment variables not set in Vercel dashboard
2. ❌ Root directory not configured correctly
3. ❌ Build command is wrong
4. ❌ Output directory is wrong

---

## FIX - In Vercel Dashboard

### Step 1: Open Your Project Settings
1. Go to [vercel.com](https://vercel.com)
2. Click on your project
3. Click "Settings" tab

### Step 2: Verify Root Directory
- Look for "Root Directory" setting
- Should be: `web` ✅
- If blank or wrong, change to `web`

### Step 3: Verify Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables
Click "Environment Variables" and add:

**For Development/Testing:**
```
VITE_API_URL = (leave empty to use relative /api)
```

**For Production (once backend is deployed):**
```
VITE_API_URL = https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with your actual Render backend domain.

### Step 5: Redeploy
- Click "Deployments" tab
- Click the three dots on the latest deployment
- Click "Redeploy"
- Wait for build to complete

---

## Additional Fixes Applied

### ✅ Files Updated:

1. **web/.env** - Changed to correct Vite variable name
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **backend/.env** - Removed React variable, added NODE_ENV
   ```
   PORT=5000
   MONGO_URI=...
   JWT_SECRET=...
   NODE_ENV=development
   ```

3. **vercel.json** - Created for proper build config
   - Specifies Vite framework
   - Sets output directory
   - Documents environment variables

4. **web/.npmrc** - Added to prevent dependency issues
   - Allows legacy peer dependencies

---

## Local Testing Before Redeployment

Make sure everything works locally first:

```bash
# Terminal 1: Backend
cd backend
npm run seed
npm run dev
# Should say: Server running on port 5000

# Terminal 2: Frontend
cd web
npm run dev
# Should say: ➜  Local: http://localhost:5173
```

Visit `http://localhost:5173` and test:
- ✅ Can you see the home page?
- ✅ Can you register?
- ✅ Can you login?
- ✅ Can you add products to favorites?
- ✅ No console errors about API?

---

## Vercel Dashboard Checklist

When you redeploy, verify:

- ✅ **Root Directory**: `web`
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Install Command**: `npm install`
- ✅ **Environment Variables**: VITE_API_URL set
- ✅ **Framework**: Vite (should be auto-detected)
- ✅ **Node Version**: 18.x or 20.x (Vercel default)

---

## If Still Getting 404

### Check Build Logs
1. Go to "Deployments"
2. Click the failed deployment
3. Click "Build Logs"
4. Look for error messages
5. Common issues:
   - Missing dependencies (check `npm install` errors)
   - Build export errors (check `npm run build` output)
   - File not found (check relative paths)

### Rebuild from Git
If all settings look correct:
1. Make a small change to any file
2. Commit: `git add . && git commit -m "fix: rebuild" && git push`
3. Vercel will auto-deploy
4. Check if new build succeeds

### Manual Full Redeploy
1. Click "Deployments"
2. Find your main branch deployment
3. Click "..."
4. Select "Redeploy"
5. Wait 2-3 minutes for build

---

## Production Environment Variables

Once both services are deployed:

**Vercel Dashboard - Environment Variables:**
```
VITE_API_URL = https://your-backend.onrender.com/api
```

**Render Dashboard - Environment Variables:**
```
CORS Origin = https://your-frontend.vercel.app
```

Then update `backend/server.js` CORS section with Vercel URL:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app'  // Add this
  ],
  credentials: true,
}));
```

Push to github → Render auto-redeploys with new CORS settings.

---

## Test Production Deployment

Once redeployed:
1. Visit your Vercel frontend URL
2. Try to register (should work without errors)
3. Try to login (should work without errors)
4. Try to add to favorites (should work without 401 errors)
5. Open DevTools → Network tab
6. Look for any failed API requests
7. If any 401s, check `VITE_API_URL` is correct

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| 404 page not found | SPA routing not configured | Make sure Vercel uses Vite framework |
| 401 Unauthorized | Wrong API URL | Check VITE_API_URL in Vercel env vars |
| Build failed | Wrong build command | Should be `npm run build` in web folder |
| Missing modules | Dependencies not installed | Check `npm install` in build logs |
| 503 Bad Gateway | Backend down | Make sure Render backend is running |

---

## Summary

✅ **Done Locally:**
- Fixed `.env` files with correct variable names
- Created `vercel.json` for Vercel config
- Created `.npmrc` for dependency fixing

🎯 **Next Steps:**
1. Go to Vercel dashboard
2. Update settings (root dir, build command, env vars)
3. Redeploy
4. Test the deployed site
5. If successful, celebrate! 🎉

**Status: Ready for Vercel redeployment** ✅
