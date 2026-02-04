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

### 🌐 Live Demo

- **Frontend:** https://playto-kappa.vercel.app
- **Backend API:** https://playto-ohyu.onrender.com/api
- **GitHub Repository:** https://github.com/Arpitkushwahaa/Playto

### 🐳 Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Arpitkushwahaa/Playto.git
cd Playto

# Start all services (PostgreSQL + Django + React)
docker-compose up --build
```

**Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin

**Note:** First startup may take 2-3 minutes to build images and run migrations.

### 💻 Manual Setup

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL (optional)

#### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional: for admin access
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

**Access:** Frontend at http://localhost:3000, Backend at http://localhost:8000

## 🏗️ Tech Stack

### Backend
- Django 4.2.9 + Django REST Framework 3.14
- PostgreSQL (production) / SQLite (development)
- Gunicorn + Whitenoise (production server)

### Frontend
- React 18.2 + Tailwind CSS 3
- Axios for API communication
- Modern ES6+ JavaScript

### DevOps
- Docker + Docker Compose
- Vercel (frontend hosting)
- Render (backend + PostgreSQL hosting)

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
- ✅ Leaderboard calculation (24-hour window with correct karma math)
- ✅ Duplicate like prevention (race condition handling)
- ✅ Comment tree structure integrity (materialized path validation)
- ✅ N+1 query prevention (verifies < 10 queries for 70 nested comments)

**Run specific test:**
```bash
python manage.py test feed.tests.LeaderboardTestCase.test_leaderboard_calculation_last_24h
python manage.py test feed.tests.NPlusOnePreventionTestCase
```

## � Key Technical Achievements

### 1. Efficient Comment Tree (No N+1 Queries)
- **Challenge**: Load 50+ nested comments without 50+ database queries
- **Solution**: Materialized path + strategic prefetching with nested `Prefetch` objects
- **Result**: Entire comment tree loaded in ~4-6 queries instead of O(n)
- **See:** [EXPLAINER.md - The Tree](EXPLAINER.md#1-the-tree-nested-comments-architecture)

### 2. Race Condition Prevention
- **Challenge**: Prevent duplicate likes under concurrent requests
- **Solution**: Database `UniqueConstraint` on (user, post) and (user, comment) + atomic transactions
- **Result**: 100% prevention of duplicate likes even under high concurrency
- **See:** [models.py](backend/feed/models.py#L95-L114)

### 3. Dynamic 24-Hour Leaderboard
- **Challenge**: Calculate karma from last 24 hours without storing it in a daily field
- **Solution**: Django ORM aggregation counting likes received on posts/comments in the last 24h
- **Formula:** `karma = (post_likes × 5) + (comment_likes × 1)`
- **See:** [EXPLAINER.md - The Math](EXPLAINER.md#2-the-math-last-24h-leaderboard)

## 📖 Documentation

- **[EXPLAINER.md](EXPLAINER.md)** - Technical deep dive covering:
  - 🌲 **The Tree:** Database modeling and N+1 prevention for nested comments
  - 🧮 **The Math:** Complete QuerySet/SQL for 24h leaderboard calculation
  - 🤖 **The AI Audit:** Specific examples where AI code was buggy and how it was fixed

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
