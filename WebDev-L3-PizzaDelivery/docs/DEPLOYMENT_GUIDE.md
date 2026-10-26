# Oasis Pizza — Production Deployment Guide

This guide details deploying the full-stack Oasis Pizza application to production targets:
- **Frontend**: Vercel
- **Backend API**: Render
- **Database**: MongoDB Atlas

---

## 1. Database Deployment: MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user (e.g. `oasis_admin`) with read/write privileges.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or Render's IP addresses.
4. Click **Connect** → **Drivers** → Node.js and copy the connection string:
   ```
   mongodb+srv://oasis_admin:<password>@cluster0.abcde.mongodb.net/oasis_pizza?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment: Render

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Root Directory**: `WebDev-L3-PizzaDelivery/server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<A strong random string, at least 32 characters>`
   - `CLIENT_URL`: `https://your-oasis-pizza.vercel.app`
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `...`
   - `ADMIN_ALERT_EMAIL`: `admin@oasispizza.com`
   - `INVENTORY_CRON_SCHEDULE`: `0 * * * *`
6. Click **Deploy Web Service**.
7. Run the seed script once via Render Shell or remote connection:
   ```bash
   npm run seed
   ```

---

## 3. Frontend Deployment: Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Select your repository.
3. In Project Settings:
   - **Root Directory**: `WebDev-L3-PizzaDelivery/client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
5. Click **Deploy**.
6. When deployment finishes, copy the Vercel URL and update the `CLIENT_URL` variable in your Render backend settings.
