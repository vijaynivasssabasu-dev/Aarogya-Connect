# MedCare AI — Production Deployment Guide

This guide walks through deploying the frontend to Vercel, the backend to Render, and the database to MongoDB Atlas.

---

## 1. Database: MongoDB Atlas

1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and select **Build a Database** (Shared/M0 Free Tier).
3. Choose your provider (AWS/GCP) and region, then create the cluster.
4. Under **Database Access**, create a database user (keep password secure).
5. Under **Network Access**, click **Add IP Address** and add `0.0.0.0/0` (allows connections from Render backend dynos).
6. Go to your cluster, click **Connect** -> **Drivers** -> Node.js, and copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/medcare`
   - Swap `<username>` and `<password>` with the database user credentials.

---

## 2. Backend: Render

1. Log in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following details:
   - **Name**: `medcare-backend`
   - **Environment**: `Node`
   - **Region**: Select closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Go to **Advanced** -> **Add Environment Variables**:
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `PORT`: `5000` (Render binds this port automatically)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (Your Vercel URL - can update this after Vercel deployment)
   - `JWT_SECRET`: (Random secure string)
   - `TWILIO_ACCOUNT_SID`: (Optional - from Twilio console)
   - `TWILIO_AUTH_TOKEN`: (Optional - from Twilio console)
   - `TWILIO_PHONE_NUMBER`: (Optional)
   - `SERVER_BASE_URL`: (Your Render web service URL)
   - `ANTHROPIC_API_KEY`: (Optional - for AI Health Assistant & IVR)
   - `RAZORPAY_KEY_ID`: (Optional - for payment processing)
   - `RAZORPAY_KEY_SECRET`: (Optional)
6. Click **Create Web Service**.

---

## 3. Frontend: Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following details:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Under **Environment Variables**:
   - Add `VITE_API_URL` pointing to your Render backend: `https://medcare-backend.onrender.com/api`
6. Click **Deploy**.
7. Once deployed, copy the production URL (e.g. `https://medcare-frontend.vercel.app`) and add it as `FRONTEND_URL` in your Render backend settings so CORS allows requests.
