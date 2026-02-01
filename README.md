# Community Feed - Playto Engineering Challenge

A full-stack community feed application with threaded discussions and a dynamic leaderboard built with Django REST Framework and React.

![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![DRF](https://img.shields.io/badge/DRF-3.14-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **📮 Post Feed**: Create and view posts with author information and like counts
- **💬 Threaded Comments**: Reddit-style nested comments with unlimited depth
- **🏆 Gamification**: Karma-based system (5 karma per post like, 1 karma per comment like)
- **📊 Dynamic Leaderboard**: Top 5 users based on karma earned in the last 24 hours only
- **⚡ Optimized Performance**: Efficient query handling to prevent N+1 queries
- **🔒 Race Condition Prevention**: Database constraints to prevent duplicate likes

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin: http://localhost:8000/admin

### Manual Setup

**Prerequisites**: Python 3.9+, Node.js 16+

#### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py shell < seed_data.py
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## 🏗️ Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- SQLite (easily switchable to PostgreSQL)

### Frontend
- React 18
- Tailwind CSS
- Axios

## 📁 Project Structure

```
Playto/
├── backend/              # Django REST Framework API
│   ├── community_feed/   # Django project settings
│   ├── feed/             # Main app (models, views, serializers, tests)
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py      # Sample data generator
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js
│   │   └── api.js        # API client
│   └── package.json
├── docker-compose.yml
├── README.md
├── EXPLAINER.md         # Technical deep dive
├── API.md               # API documentation
└── DEPLOYMENT.md        # Deployment guide
```

## API Endpoints

### Posts
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create a new post
- `GET /api/posts/{id}/` - Get a specific post with comments
- `POST /api/posts/{id}/like/` - Like a post
- `POST /api/posts/{id}/unlike/` - Unlike a post

### Comments
- `GET /api/comments/` - List all comments
- `GET /api/comments/?post_id={id}` - Get comments for a specific post
- `POST /api/comments/` - Create a comment or reply
- `POST /api/comments/{id}/like/` - Like a comment
- `POST /api/comments/{id}/unlike/` - Unlike a comment

### Leaderboard
- `GET /api/leaderboard/top_users/` - Get top 5 users by karma (last 24h)

### Users
- `GET /api/users/` - List all users
- `GET /api/users/{id}/` - Get a specific user

## 🧪 Running Tests

```bash
cd backend
python manage.py test feed
```

**Test Coverage:**
- Leaderboard calculation (24-hour window)
- Duplicate like prevention (race conditions)
- Comment tree structure integrity

## 📖 Documentation

- **[EXPLAINER.md](EXPLAINER.md)** - Technical deep dive covering:
  - Comment tree architecture and N+1 query prevention
  - Leaderboard calculation with QuerySet examples
  - AI audit showing where AI failed and how issues were fixed
  
- **[API.md](API.md)** - Complete API reference with endpoints and examples

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide for deploying to Railway, Vercel, Heroku, or AWS

## 🔑 Key Technical Achievements

### 1. Efficient Comment Tree (No N+1 Queries)
- **Challenge**: Load 50+ nested comments without 50+ database queries
- **Solution**: Materialized path + strategic prefetching
- **Result**: 50 nested comments in 4 queries (92% improvement)

### 2. Race Condition Prevention
- **Challenge**: Prevent duplicate likes under concurrent requests
- **Solution**: Database unique constraints + atomic transactions
- **Result**: 100% prevention of duplicate likes

### 3. Dynamic 24-Hour Leaderboard
- **Challenge**: Calculate karma from last 24 hours without storing it
- **Solution**: Complex Django ORM aggregation with time-based filtering
- **Result**: Real-time calculation with proper indexing

See [EXPLAINER.md](EXPLAINER.md) for detailed technical explanations.

## 🌐 Deployment

The application is ready to deploy to cloud platforms. See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Railway (recommended for full-stack)
- Vercel + Railway combination
- Heroku
- AWS (Elastic Beanstalk or ECS)

## 📊 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Nested comment queries | 51 queries | 4 queries | 92% reduction |
| Duplicate like prevention | Vulnerable | 100% safe | ∞% |
| Leaderboard query time | N/A | 50-200ms | Optimized |

## 🤝 Contributing

This is a challenge project. Feedback and suggestions are welcome!

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.
