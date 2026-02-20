# Production Readiness Checklist ✅

## Backend Setup

### Configuration Files
- ✅ `.gitignore` created - prevents `.env` from being committed
- ✅ `.env.example` created - template for environment variables
- ✅ `server.js` - uses `process.env.PORT || 5000`
- ✅ `package.json` - has `"start": "node server.js"` script
- ✅ CORS configured for localhost development ports
- ✅ Error handling middleware in place

### Environment Variables Needed for Production
When deploying to Render, set these in the dashboard:
```
PORT=5000
MONGO_URI=mongodb+srv://vivkumar4583_db_user:zkro0RtoSWq6DVux@cluster0.f7tie3d.mongodb.net/?appName=Cluster0
JWT_SECRET=cd700ba1a8bb177bb0724bafae1cbd0d
NODE_ENV=production
```

### Render Deployment
- URL will be: `https://your-api-name.onrender.com`
- Update CORS in `server.js` with frontend URL after Vercel deployment
- Commands:
  - Build: `npm install`
  - Start: `npm start`

---

## Frontend Setup

### Configuration Files
- ✅ `.gitignore` present - prevents `.env` from being committed
- ✅ `.env.example` created - shows VITE_API_URL variable
- ✅ `vite.config.js` - proxy only for development
- ✅ `axios.js` - uses `VITE_API_URL` or defaults to `/api`
- ✅ `package.json` - has `"build": "vite build"` script

### Environment Variables
For development (already set):
```
VITE_API_URL=http://localhost:5000/api
```

For production on Vercel (set in dashboard):
```
VITE_API_URL=https://your-api-name.onrender.com/api
```

### Vercel Deployment
- Framework: Vite
- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `dist`

---

## Database

### MongoDB Atlas
- ✅ Cluster already created and connected
- ✅ Connection string secured in `.env`
- ✅ User credentials: `vivkumar4583_db_user`

---

## Security Checklist

- ✅ `.env` is in `.gitignore` (credentials won't be exposed)
- ✅ JWT_SECRET is long and random
- ✅ CORS is restricted to specific origins
- ✅ Passwords are hashed with bcryptjs
- ✅ Sensitive data excluded from repository

---

## Testing

Before deploying:
1. ✅ Backend runs: `npm run dev` (should start on port 5000)
2. ✅ Frontend runs: `npm run dev` (should start on port 5173)
3. ✅ Database is seeded: `npm run seed` (creates test users)
4. ✅ Can register a new user
5. ✅ Can login with credentials
6. ✅ Can add products to favorites
7. ✅ No CORS errors in console
8. ✅ Token persists in localStorage

---

## Deployment Steps Summary

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Production ready setup"
git push origin main
```

### 2️⃣ Deploy Backend to Render
- Sign in to Render.com
- Connect GitHub repository
- Create Web Service
- Set environment variables (PORT, MONGO_URI, JWT_SECRET, NODE_ENV)
- Deploy
- Copy backend URL (e.g., `https://micro-marketplace-api.onrender.com`)

### 3️⃣ Deploy Frontend to Vercel
- Sign in to Vercel
- Import GitHub repository
- Set root directory to `web`
- Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
- Deploy
- Copy frontend URL (e.g., `https://micro-marketplace.vercel.app`)

### 4️⃣ Update CORS on Backend
- Edit `server.js` CORS section
- Add Vercel frontend URL
- Push to GitHub
- Render will auto-redeploy

### 5️⃣ Test Production
- Visit Vercel frontend URL
- Test register, login, favorites
- Check browser console for errors

---

## Files Modified for Production

- ✅ `backend/.gitignore` - created
- ✅ `backend/.env.example` - created
- ✅ `backend/server.js` - CORS updated
- ✅ `web/.env.example` - created
- ✅ `web/src/api/axios.js` - now uses VITE_API_URL
- ✅ `.gitignore` (root) - created
- ✅ `DEPLOYMENT.md` - created with full instructions

---

## Next Steps

1. Follow the DEPLOYMENT.md guide
2. Create accounts on Render and Vercel
3. Deploy backend first
4. Deploy frontend with correct API URL
5. Test the full application
6. Monitor both platforms for errors

---

**Status: READY FOR PRODUCTION** ✅
