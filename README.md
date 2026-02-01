# Community Feed - Playto Engineering Challenge

A full-stack community feed application with threaded discussions and a dynamic leaderboard built with Django REST Framework and React.

## Features

- **Threaded Comments**: Reddit-style nested comment threads with unlimited depth
- **Gamification System**: Karma-based leaderboard (5 karma per post like, 1 karma per comment like)
- **Real-time Leaderboard**: Top 5 users based on karma earned in the last 24 hours
- **Optimized Performance**: Efficient query handling to prevent N+1 queries
- **Race Condition Prevention**: Database constraints to prevent duplicate likes

## Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- SQLite (easily switchable to PostgreSQL)

### Frontend
- React 18
- Tailwind CSS
- Axios

## Project Structure

```
Playto/
├── backend/
│   ├── community_feed/       # Django project settings
│   ├── feed/                 # Main app with models, views, serializers
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js
│   │   ├── api.js           # API client
│   │   └── index.css
│   └── package.json
├── docker-compose.yml
├── README.md
└── EXPLAINER.md
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (for admin access):
```bash
python manage.py createsuperuser
```

7. Create some test users (optional):
```bash
python manage.py shell
```
Then in the Python shell:
```python
from django.contrib.auth.models import User
User.objects.create_user('alice', 'alice@example.com', 'password123')
User.objects.create_user('bob', 'bob@example.com', 'password123')
User.objects.create_user('charlie', 'charlie@example.com', 'password123')
exit()
```

8. Start the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000/`

## Using Docker (Alternative)

If you prefer to use Docker:

1. Make sure Docker and Docker Compose are installed

2. From the project root directory:
```bash
docker-compose up --build
```

This will start both the backend and frontend services:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

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

## Running Tests

To run the backend tests:

```bash
cd backend
python manage.py test feed
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to:
- Create/edit users, posts, comments
- View all likes
- Monitor database state

## Notes for Development

### Authentication
The current implementation uses a simplified authentication model for demo purposes. In production, you should implement:
- Proper user authentication (JWT, OAuth, etc.)
- Session management
- CSRF protection for state-changing operations

### Database
The project uses SQLite by default for simplicity. For production:
1. Switch to PostgreSQL in `settings.py`
2. Update the `DATABASES` configuration
3. Install `psycopg2-binary`

### Environment Variables
For production, create a `.env` file:
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## Performance Optimizations Implemented

1. **N+1 Query Prevention**: Uses `select_related` and `prefetch_related` for efficient data fetching
2. **Tree Path Indexing**: Comments use a tree_path field for efficient nested query traversal
3. **Database Indexes**: Strategic indexes on frequently queried fields
4. **Unique Constraints**: Prevent duplicate likes at the database level
5. **Atomic Transactions**: Race condition prevention for concurrent like operations

## Contributing

This is a challenge project, but suggestions are welcome!

## License

MIT License - feel free to use this code for learning purposes.
