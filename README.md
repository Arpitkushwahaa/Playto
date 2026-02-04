# Community Feed - Playto Engineering Challenge

A full-stack community feed application with threaded discussions and a dynamic leaderboard built with Django REST Framework and React.

![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![DRF](https://img.shields.io/badge/DRF-3.14-orange.svg)

## Requirements Implementation

### 1. Core Features

- **The Feed:** Displays text posts with their **Author** and **Like count**.
- **Threaded Comments:** Users can comment on posts, *and* reply to other comments (nested threads, like Reddit).
- **Gamification:**
    - 1 Like on a Post = 5 Karma.
    - 1 Like on a Comment = 1 Karma.
- **The Leaderboard:** A widget showing the **Top 5 Users** based on Karma earned **in the last 24 hours only**.

### 2. Technical Constraints

- **The N+1 Nightmare (Comments):**
    - Loading a post with 50 nested comments does not trigger 50 SQL queries.
    - **Solution:** Uses `select_related` and `prefetch_related` with nested `Prefetch` objects to fetch the entire comment tree efficiently.
    
- **Concurrency:**
    - Users cannot "double like" a post or comment to inflate Karma.
    - **Solution:** Database-level `UniqueConstraint` on (user, post) and (user, comment) pairs, with atomic transactions to handle race conditions.
    
- **Complex Aggregation (Leaderboard):**
    - The leaderboard *only* counts Karma earned in the last 24 hours.
    - **Solution:** Dynamically calculates karma from Like records filtered by `created_at >= 24 hours ago`. No static "Daily Karma" field is used - it's calculated on-the-fly from the transaction history.

## 🚀 Quick Start

### Live Demo

- **Frontend:** https://playto-kappa.vercel.app
- **Backend API:** https://playto-ohyu.onrender.com/api

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
└── README.md
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

## � Key Technical Achievements

### 1. Efficient Comment Tree (No N+1 Queries)
- **Challenge**: Load 50+ nested comments without 50+ database queries
- **Solution**: Materialized path + strategic prefetching with nested `Prefetch` objects
- **Result**: Entire comment tree loaded in minimal queries (O(1) instead of O(n))

### 2. Race Condition Prevention
- **Challenge**: Prevent duplicate likes under concurrent requests
- **Solution**: Database `UniqueConstraint` on (user, post) and (user, comment) + atomic transactions
- **Result**: 100% prevention of duplicate likes even under high concurrency

### 3. Dynamic 24-Hour Leaderboard
- **Challenge**: Calculate karma from last 24 hours without storing it in a daily field
- **Solution**: Django ORM aggregation counting likes received on posts/comments in the last 24h
- **Result**: Real-time calculation: `(post_likes * 5) + (comment_likes * 1)`

## 🌐 Deployment

**Live Application:**
- Frontend: https://playto-kappa.vercel.app
- Backend: https://playto-ohyu.onrender.com/api

The application is deployed on:
- **Frontend**: Vercel (auto-deploys from main branch)
- **Backend**: Render (PostgreSQL + Gunicorn)

## 📝 License

MIT
## 🤝 Contributing

This is a challenge project. Feedback and suggestions are welcome!

## 📄 License

MIT
