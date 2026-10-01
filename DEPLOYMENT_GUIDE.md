# Aura SaaS Free Deployment & Hosting Guide (Render + Vercel + Supabase)

This guide provides the exact step-by-step instructions and copy-paste values for deploying Aura for free using **Render** (Backend), **Vercel** (Frontend), and **Supabase** (Auth & Database).

---

## 🎯 Which One to Deploy First?

### **Deploy the Backend on Render FIRST.**
**Why?** 
When you deploy the backend on Render, Render assigns you a free, secure HTTPS URL (for example: `https://aura-backend.onrender.com`). 
You need this URL to configure `REACT_APP_API_BASE_URL` in Vercel so the frontend knows where to send chat messages and assessment queries.

---

## Step 1: Deploy Backend to Render (Free Python Web Service)

1. Push your repository to GitHub (ensure `.env` files are not committed — our `.gitignore` already protects them!).
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
3. Select your GitHub repository `Aura`.
4. Configure the service settings:
   - **Name**: `aura-backend` (or any name you prefer)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free** ($0/month)

5. Click **Advanced** -> **Add Environment Variable** and copy-paste the exact values below:

### 📋 Copy-Paste for Render Environment Variables

| Key | Value |
|---|---|
| `HOST` | `0.0.0.0` |
| `PORT` | `10000` |
| `CORS_ORIGINS` | `*` *(or your Vercel URL once deployed)* |
| `SUPABASE_URL` | `https://rgxbnijcczkwjoizenzn.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_Ad8Q_NMvNKD-x9VK5GMZVA_FuKkjEyi` |
| `GROQ_API_KEYS` | `<your-groq-api-keys-comma-separated>` |
| `GEMINI_API_KEYS` | `<your-gemini-api-keys-comma-separated>` |
| `RATE_LIMIT_RPM` | `10` |
| `RATE_LIMIT_RPD` | `1000` |

6. Click **Create Web Service**. 
7. Once deployed, copy your Render Web Service URL (e.g. `https://aura-backend.onrender.com`).

---

## Step 2: Deploy Frontend to Vercel (Free Next-Gen React Hosting)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `Aura` GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: Create React App
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install --legacy-peer-deps`

5. Expand the **Environment Variables** section and paste the following exact values:

### 📋 Copy-Paste for Vercel Environment Variables

| Key | Value |
|---|---|
| `REACT_APP_USE_MOCKS` | `false` |
| `REACT_APP_API_BASE_URL` | `https://your-render-backend-url.onrender.com` *(Paste the URL from Step 1)* |
| `REACT_APP_ENABLE_GOOGLE_LOGIN` | `false` |
| `REACT_APP_STT_MODE` | `browser` |
| `REACT_APP_SUPABASE_URL` | `https://rgxbnijcczkwjoizenzn.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `sb_publishable_Ad8Q_NMvNKD-x9VK5GMZVA_FuKkjEyi` |

6. Click **Deploy**. Vercel will build the frontend and provide your production URL (e.g., `https://aura-app.vercel.app`).
7. **Enable Vercel Analytics**:
   - In your Vercel project dashboard, go to the **Analytics** tab.
   - Click **Enable Analytics**. (Our codebase already has `@vercel/analytics` installed and mounted in `index.tsx`, so traffic and visitor performance data will appear immediately!).

---

## Step 3: Configure Supabase Redirect URLs

To allow users to log in securely from your live Vercel domain:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/rgxbnijcczkwjoizenzn).
2. Go to **Authentication** -> **URL Configuration**.
3. In **Site URL**, enter your Vercel domain:
   ```
   https://aura-app.vercel.app
   ```
4. In **Redirect URLs**, add:
   ```
   https://aura-app.vercel.app/**
   http://localhost:3000/**
   ```
5. Click **Save**.

---

## Step 4 (Optional): Update Render CORS for Maximum Security

Once your Vercel frontend is live:
1. In the Render Dashboard, go to your `aura-backend` service -> **Environment**.
2. Update `CORS_ORIGINS` to:
   ```
   https://aura-app.vercel.app,http://localhost:3000
   ```
3. Click **Save Changes** (Render will automatically re-deploy in ~30 seconds).

---

## 🎉 You're Live!
Your Aura SaaS app is now running in full production on zero-cost infrastructure:
- Frontend CDN on Vercel with free SSL & real-time analytics.
- FastAPI backend on Render with rate-limiting and circular Gemini/Groq key rotation.
- Secure authentication & database on Supabase.
