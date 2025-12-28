# 🚀 Deployment Guide: EduChain Project

This guide will help you deploy your EduChain project using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

1. **GitHub Account** (for both Vercel and Railway)
2. **Railway Account** (railway.app)
3. **Vercel Account** (vercel.com)
4. **Git repository** of your project

---

## 🚂 Step 1: Deploy Backend on Railway

### 1.1 Setup Railway Project

1. **Sign up/Login** to [Railway](https://railway.app)
2. **Create New Project** → **Deploy from GitHub repo**
3. **Connect your GitHub** repository
4. **Select your repository** (document-system)

### 1.2 Configure Database

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway will create a MySQL instance with connection details

### 1.3 Set Environment Variables

In Railway dashboard → **Variables** tab, add:

```bash
# Database (Railway provides these automatically when you add MySQL)
DATABASE_URL=mysql://username:password@host:port/railway
DATABASE_USERNAME=root
DATABASE_PASSWORD=auto-generated-password

# Application
PORT=8080
FRONTEND_URL=https://your-app.vercel.app
RECAPTCHA_SECRET_KEY=6LfCdjksAAAAANEpz3dMfIcRUWZGBP71ywCpeSOj
FILE_UPLOAD_DIR=/tmp/uploads

# Blockchain (update when needed)
BLOCKCHAIN_RPC_URL=http://localhost:7545
BLOCKCHAIN_CONTRACT_ADDRESS=
BLOCKCHAIN_PRIVATE_KEY=
```

### 1.4 Deploy

1. Railway auto-detects Spring Boot
2. **Deploy** will start automatically
3. **Copy the Railway URL** (e.g., `https://your-app.railway.app`)

---

## ⚡ Step 2: Deploy Frontend on Vercel

### 2.1 Setup Vercel Project

1. **Sign up/Login** to [Vercel](https://vercel.com)
2. **Import Git Repository**
3. **Select your repository** (document-system)
4. **Configure Project Settings**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.2 Set Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**:

```bash
REACT_APP_API_URL = https://your-railway-app.railway.app/api
```

### 2.3 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your React app
3. **Copy the Vercel URL** (e.g., `https://your-app.vercel.app`)

---

## 🔗 Step 3: Connect Frontend & Backend

### 3.1 Update Railway Environment

Go back to **Railway** → **Variables** and update:

```bash
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

### 3.2 Update reCAPTCHA Domains

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. **Edit your site settings**
3. **Add domains**:
   - `your-app.vercel.app` (frontend)
   - `your-app.railway.app` (backend - if needed)

### 3.3 Redeploy

1. **Railway**: Auto-redeploys with new environment variables
2. **Vercel**: Auto-redeploys on git pushes

---

## ✅ Step 4: Verification

### Test Your Deployed Application

1. **Visit your Vercel URL**
2. **Test login/registration** (reCAPTCHA should work)
3. **Test document upload/download**
4. **Check browser console** for any API errors

### Common Issues & Solutions

#### CORS Errors
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check that Railway backend is running

#### reCAPTCHA Errors  
- Verify domains are added to Google reCAPTCHA admin
- Check site key in frontend and secret key in Railway

#### Database Errors
- Ensure Railway MySQL is connected and environment variables are set
- Check Railway logs for database connection issues

---

## 📝 Quick Deployment Commands

### For Future Updates

**Frontend (commit and push to trigger Vercel deploy)**:
```bash
cd frontend
git add .
git commit -m "Frontend update"
git push origin main
```

**Backend (commit and push to trigger Railway deploy)**:
```bash
git add .
git commit -m "Backend update"  
git push origin main
```

---

## 🔧 Environment Variables Summary

### Railway (Backend)
```
DATABASE_URL=mysql://...
DATABASE_USERNAME=root
DATABASE_PASSWORD=...
PORT=8080
FRONTEND_URL=https://your-app.vercel.app
RECAPTCHA_SECRET_KEY=6LfCdjksAAAAANEpz3dMfIcRUWZGBP71ywCpeSOj
FILE_UPLOAD_DIR=/tmp/uploads
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-railway-app.railway.app/api
```

---

## 🆘 Support Links

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs  
- **Spring Boot on Railway**: https://docs.railway.app/guides/java
- **React on Vercel**: https://vercel.com/guides/deploying-react-with-vercel

---

**Your deployment URLs**:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

Update these in your environment variables once deployed!