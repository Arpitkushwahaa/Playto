# Deploying Community Feed Backend to Render

## Prerequisites
- GitHub repository (already done ✅)
- Render account (free): https://render.com

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `community-feed-db`
   - **Database**: `community_feed`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Instance Type**: **Free**
4. Click **"Create Database"**
5. **Copy the "Internal Database URL"** - you'll need this!

### 2. Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Arpitkushwahaa/Playto`
3. Configure:

   **Basic Settings:**
   - **Name**: `community-feed-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn community_feed.wsgi:application`
   - **Instance Type**: **Free**

### 3. Add Environment Variables

In the **Environment** section, add these variables:

```
SECRET_KEY=your-super-secret-key-change-this-to-random-string
DEBUG=False
ALLOWED_HOSTS=community-feed-api.onrender.com
DATABASE_URL=[Paste the Internal Database URL from step 1]
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
RENDER_EXTERNAL_HOSTNAME=community-feed-api.onrender.com
PYTHON_VERSION=3.11.0
```

**Important:**
- Replace `community-feed-api.onrender.com` with your actual Render URL
- Replace the DATABASE_URL with the one from your PostgreSQL database
- Generate a strong SECRET_KEY (use: https://djecrety.ir/)

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Run migrations
   - Start the server
3. Wait 5-10 minutes for first deployment
4. Your API will be live at: `https://community-feed-api.onrender.com`

### 5. Test Your Deployment

Visit these URLs:
- API Root: `https://community-feed-api.onrender.com/api/`
- Posts: `https://community-feed-api.onrender.com/api/posts/`
- Leaderboard: `https://community-feed-api.onrender.com/api/leaderboard/top-users/`

### 6. Update Frontend

Update `frontend/src/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://community-feed-api.onrender.com/api';
```

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Ensure `build.sh` has correct permissions
- Verify Python version

### Database Connection Issues
- Double-check DATABASE_URL
- Ensure PostgreSQL database is running
- Check database region matches web service

### CORS Errors
- Add your frontend URL to CORS_ALLOWED_ORIGINS
- Ensure HTTPS is used in production

### Static Files Not Loading
- Check `collectstatic` ran in build.sh
- Verify STATIC_ROOT is set correctly

## Free Tier Limitations

⚠️ **Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free
- Perfect for demos and portfolios!

## Next Steps

1. ✅ Deploy backend to Render
2. Deploy frontend to Vercel/Netlify
3. Update CORS settings with frontend URL
4. Test end-to-end functionality
5. Share both URLs in your submission!

---

**Your Backend URL**: `https://community-feed-api.onrender.com`

Update this in your frontend's `.env` file:
```
REACT_APP_API_URL=https://community-feed-api.onrender.com/api
```
