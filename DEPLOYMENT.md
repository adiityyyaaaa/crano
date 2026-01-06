# Deployment Guide for crano.site

Complete guide to deploy your EdTech marketplace with **Frontend on Vercel** and **Backend on Render**.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed to a repository
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] MongoDB Atlas database (or other MongoDB hosting)
- [ ] Razorpay account with API credentials
- [ ] Gemini API key
- [ ] Access to crano.site DNS settings

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `crano---edtech-tutor-marketplace`

### Step 2: Configure Service

**Basic Settings:**
- **Name**: `crano-backend` (or your preferred name)
- **Region**: `Singapore` (or closest to your users)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run server:build`
- **Start Command**: `node dist/server.js`

**Instance Type:**
- Select **Free** tier to start

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default port |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `GEMINI_API_KEY` | `your_key_here` | From Google AI Studio |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Your Razorpay Live Key ID |
| `RAZORPAY_KEY_SECRET` | `your_secret` | Your Razorpay Live Secret |
| `JWT_SECRET` | `strong_random_string` | Generate a secure random string |

> [!IMPORTANT]
> Use **production/live credentials** for Razorpay, not test keys!

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://crano-backend.onrender.com` (or similar)

### Step 5: Test Backend

Visit your backend URL + `/api/health`:
```
https://crano-backend.onrender.com/api/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T...",
  "environment": "production"
}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Update Environment Variables

1. Open `.env.production` in your project
2. Replace `YOUR_RENDER_BACKEND_URL` with your actual Render URL:
   ```
   VITE_API_URL=https://crano-backend.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_here
   ```
3. Commit and push this change to GitHub

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### Step 3: Configure Project

**Framework Preset:** Vite (auto-detected)

**Build Settings:**
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://crano-backend.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_your_live_key_here` |

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. You'll get a temporary URL like: `https://crano-edtech.vercel.app`

### Step 6: Test Frontend

1. Visit your Vercel URL
2. Test basic functionality:
   - Homepage loads
   - Navigation works
   - Can view teachers

---

## 🌐 Part 3: Configure Custom Domain (crano.site)

### Option A: Point Everything to Vercel (Recommended)

This approach uses Vercel for the main domain and subdomain for API.

#### 1. Add Domain to Vercel

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add `crano.site`
3. Add `www.crano.site`
4. Vercel will provide DNS records

#### 2. Configure DNS at Your Registrar

Go to your domain registrar (where you bought crano.site) and add:

**For Root Domain (crano.site):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www Subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**For API Subdomain (Backend):**
- Type: `CNAME`
- Name: `api`
- Value: `crano-backend.onrender.com`

#### 3. Update Backend CORS

The backend is already configured to allow `https://crano.site` and `https://www.crano.site` ✅

#### 4. Update Frontend API URL

Update environment variable in Vercel:
- Go to **Settings** → **Environment Variables**
- Change `VITE_API_URL` to: `https://api.crano.site`
- Redeploy the project

### Option B: Separate Domains

If you want different domains for frontend and backend, configure DNS separately for each service.

---

## ✅ Part 4: Post-Deployment Verification

### Backend Health Check
```bash
curl https://api.crano.site/api/health
```

### Frontend Checks
- [ ] Visit `https://crano.site` - Homepage loads
- [ ] Visit `https://www.crano.site` - Redirects or loads correctly
- [ ] Check browser console for errors
- [ ] Verify API calls work (Network tab)

### Feature Testing
- [ ] **Authentication**: Sign up and login work
- [ ] **Browse Teachers**: Teacher listings load
- [ ] **Booking**: Can view teacher profiles and availability
- [ ] **Payment**: Razorpay integration works (test with small amount)
- [ ] **Chat**: Real-time chat functionality works

---

## 🔧 Troubleshooting

### CORS Errors
**Problem**: Browser shows CORS policy errors

**Solution**: 
1. Verify backend CORS allows your frontend domain
2. Check `server.ts` has correct domains in `corsOptions`
3. Redeploy backend after changes

### API Connection Failed
**Problem**: Frontend can't reach backend

**Solution**:
1. Verify `VITE_API_URL` in Vercel environment variables
2. Test backend health endpoint directly
3. Check Render logs for errors

### Environment Variables Not Working
**Problem**: Features broken in production but work locally

**Solution**:
1. Verify all environment variables are set in both Vercel and Render
2. Redeploy after adding variables
3. Check for typos in variable names

### Render Free Tier Sleep
**Problem**: Backend slow on first request

**Solution**:
- Free tier services sleep after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Consider upgrading to paid tier for production

---

## 📊 Monitoring & Maintenance

### Vercel
- **Logs**: Dashboard → Your Project → Deployments → View Logs
- **Analytics**: Dashboard → Your Project → Analytics
- **Domains**: Check SSL certificate status

### Render
- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Events**: Monitor deployment events

---

## 🔐 Security Checklist

- [ ] All environment variables use production credentials
- [ ] JWT_SECRET is a strong random string (not "anystring")
- [ ] Razorpay uses LIVE keys (not test keys)
- [ ] MongoDB connection uses authentication
- [ ] HTTPS is enabled on both frontend and backend
- [ ] CORS only allows your domains

---

## 📝 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://crano.site` | Main website |
| Backend API | `https://api.crano.site` | API endpoints |
| Vercel Dashboard | `https://vercel.com/dashboard` | Frontend management |
| Render Dashboard | `https://dashboard.render.com` | Backend management |

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **DNS Propagation Check**: https://dnschecker.org

---

**🎉 Congratulations!** Your EdTech marketplace is now live on crano.site!
