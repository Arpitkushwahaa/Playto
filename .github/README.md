# Community Feed Project

## Project Structure

This directory contains the complete Community Feed application built for the Playto Engineering Challenge.

### Directory Structure

```
Playto/
├── backend/              # Django backend
│   ├── community_feed/   # Django project settings
│   ├── feed/             # Main app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js
│   │   └── api.js
│   └── package.json
├── docker-compose.yml    # Docker orchestration
├── README.md             # Setup and usage guide
└── EXPLAINER.md          # Technical deep dive

```

### Quick Start

See [README.md](README.md) for detailed setup instructions.

### Running with Docker

```bash
docker-compose up --build
```

### Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Features

- ✅ Threaded comments with efficient query optimization
- ✅ Like system with race condition prevention
- ✅ Dynamic 24-hour leaderboard
- ✅ Beautiful, responsive UI with Tailwind CSS
- ✅ Comprehensive test coverage
- ✅ Docker support

### Technologies

**Backend:** Django 4.2, Django REST Framework, SQLite/PostgreSQL

**Frontend:** React 18, Tailwind CSS, Axios

### Documentation

- **Setup Guide:** [README.md](README.md)
- **Technical Explanation:** [EXPLAINER.md](EXPLAINER.md)

### Author

Built for the Playto Engineering Challenge
