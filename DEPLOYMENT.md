# Deployment Guide

This guide covers deploying the Community Feed application to various cloud platforms.

## Table of Contents

1. [Railway Deployment](#railway-deployment)
2. [Vercel + Railway](#vercel--railway)
3. [Heroku Deployment](#heroku-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Environment Variables](#environment-variables)

---

## Railway Deployment

Railway is great for full-stack apps. It can host both backend and frontend.

### Backend on Railway

1. **Create a new project** on [Railway](https://railway.app)

2. **Add PostgreSQL database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Deploy Django backend**:
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables:
     ```
     SECRET_KEY=<generate-a-secret-key>
     DEBUG=False
     ALLOWED_HOSTS=*.railway.app
     ```

4. **Add start command**:
   - In Railway settings, set start command:
     ```bash
     python manage.py migrate && gunicorn community_feed.wsgi
     ```
   - Add `gunicorn` to `requirements.txt`:
     ```
     gunicorn==21.2.0
     ```

5. **Enable public domain**:
   - Railway → Settings → Generate Domain
   - Note the URL (e.g., `https://your-app.railway.app`)

### Frontend on Railway

1. **Create another service**:
   - Click "New" → "GitHub Repo"
   - Same repository, root directory: `frontend`

2. **Add environment variable**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

3. **Build settings**:
   - Build command: `npm run build`
   - Start command: `npx serve -s build`
   - Add to `package.json`:
     ```json
     "dependencies": {
       "serve": "^14.2.0"
     }
     ```

---

## Vercel + Railway

Deploy frontend on Vercel (optimized for React), backend on Railway.

### Backend on Railway
(Follow Railway backend steps above)

### Frontend on Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `REACT_APP_API_URL` = `https://your-backend.railway.app/api`

4. **Configure** `vercel.json` (optional):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## Heroku Deployment

### Backend on Heroku

1. **Create `Procfile`** in `backend/`:
   ```
   web: gunicorn community_feed.wsgi
   release: python manage.py migrate
   ```

2. **Create `runtime.txt`**:
   ```
   python-3.11.7
   ```

3. **Deploy**:
   ```bash
   heroku create your-app-backend
   heroku addons:create heroku-postgresql:mini
   heroku config:set SECRET_KEY=<your-secret-key>
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS=.herokuapp.com
   git subtree push --prefix backend heroku main
   ```

### Frontend on Netlify/Vercel
(Follow Vercel steps above, or use Netlify with similar config)

---

## AWS Deployment

### Option 1: Elastic Beanstalk

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize**:
   ```bash
   cd backend
   eb init -p python-3.11 community-feed
   ```

3. **Create environment**:
   ```bash
   eb create production
   eb setenv SECRET_KEY=<key> DEBUG=False
   ```

4. **Deploy**:
   ```bash
   eb deploy
   ```

### Option 2: ECS + RDS

Use the provided `docker-compose.yml` as a reference for ECS task definitions.

---

## Environment Variables

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Debug mode (False in production) | `False` |
| `ALLOWED_HOSTS` | Comma-separated domains | `yourdomain.com,*.railway.app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Frontend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.yourdomain.com/api` |

---

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Static files collected (if using S3/CDN)
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Superuser created for admin access
- [ ] Database backups configured
- [ ] Monitoring/logging set up (Sentry, LogRocket, etc.)

---

## Database Backup

### Railway/Heroku PostgreSQL

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated backups

Set up cron job or use platform-specific backup features:
- Railway: Automatic backups in Pro plan
- Heroku: `heroku pg:backups:schedule`
- AWS: RDS automated snapshots

---

## Scaling Considerations

1. **Database Connection Pooling**: Use PgBouncer for PostgreSQL
2. **Caching**: Implement Redis for leaderboard caching
3. **CDN**: Use Cloudflare for static assets
4. **Load Balancing**: AWS ALB or Railway's built-in scaling

---

## Monitoring

### Recommended Tools

- **Backend**: Sentry for error tracking
- **Frontend**: LogRocket for user sessions
- **Database**: Railway/Heroku built-in metrics
- **Uptime**: UptimeRobot or Pingdom

---

## Support

For issues with deployment, check:
- Platform-specific logs (Railway, Vercel, etc.)
- Django logs: `heroku logs --tail` or Railway logs
- Database connectivity: `python manage.py dbshell`

Good luck with your deployment! 🚀
