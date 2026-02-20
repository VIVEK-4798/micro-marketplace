# Deployment Guide

## Overview
This project is set up for deployment on:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Vercel (React/Vite)
- **Database**: MongoDB Atlas (already set up)

---

## BACKEND DEPLOYMENT (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 2: Create a New Web Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure:
   - **Name**: `micro-marketplace-api` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`

### Step 3: Set Environment Variables on Render
In the "Environment" section, add:
```
PORT=5000
MONGO_URI=mongodb+srv://vivkumar4583_db_user:zkro0RtoSWq6DVux@cluster0.f7tie3d.mongodb.net/?appName=Cluster0
JWT_SECRET=cd700ba1a8bb177bb0724bafae1cbd0d
NODE_ENV=production
```

### Step 4: Deploy
- Click "Deploy Web Service"
- Wait for the deployment to complete
- Your backend URL will be something like: `https://micro-marketplace-api.onrender.com`

### Step 5: Add CORS for Frontend
Once you have your **Vercel frontend URL**, go back to Render and:
1. Update the `server.js` CORS section with your Vercel URL:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app'  // Add your Vercel URL here
  ],
  credentials: true,
}));
```
2. Push to GitHub
3. Render will automatically redeploy

---

## FRONTEND DEPLOYMENT (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables
Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```
Replace `your-backend-url` with your actual Render backend URL

### Step 4: Deploy
- Click "Deploy"
- Your frontend URL will be something like: `https://micro-marketplace.vercel.app`

### Step 5: Update Backend CORS
Go back to your Render environment variables and add your Vercel URL to CORS.

---

## IMPORTANT CHECKLIST

### Backend (.env not committed)
- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` exists with placeholder values
- ✅ `package.json` has `"start": "node server.js"`
- ✅ `server.js` uses `process.env.PORT || 5000`
- ✅ CORS configured with both localhost and production URLs
- ✅ All environment variables are set on Render

### Frontend (.env not committed)
- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` exists
- ✅ `axios.js` uses `VITE_API_URL` for production
- ✅ `vite.config.js` proxy only works in dev
- ✅ All environment variables are set on Vercel

---

## After Deployment

### Test the Connection
1. Go to your Vercel frontend URL
2. Register a new account
3. Login
4. Try adding a product to favorites
5. Check the browser DevTools for any 401 or CORS errors

### Troubleshooting

**CORS Error?**
- Check Render environment for CORS configuration
- Make sure Vercel URL is in the allowed origins
- Restart the Render service

**401 Unauthorized?**
- Check JWT_SECRET matches on both frontend and backend
- Clear browser cache and localStorage
- Check token in localStorage (DevTools → Application → Local Storage)

**Backend API not found?**
- Check VITE_API_URL on Vercel is correct
- Make sure backend is running on Render
- Check network tab in DevTools

---

## Local Testing Before Deployment

Before pushing to production, test locally:

```bash
# Backend
cd backend
npm run seed    # Populate test data
npm run dev     # Should run on http://localhost:5000

# Frontend (new terminal)
cd web
npm run dev     # Should run on http://localhost:5173
```

Then visit `http://localhost:5173` and test the full flow.
