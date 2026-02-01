# 🚀 QUICK START GUIDE

Get the Community Feed app running in 5 minutes!

## Prerequisites
- Python 3.9+ installed
- Node.js 16+ installed
- Git (optional)

---

## ⚡ Fastest Way (Windows)

1. **Open PowerShell in the Playto folder**

2. **Run the setup script:**
   ```powershell
   .\setup.bat
   ```

3. **Start the backend** (in one terminal):
   ```powershell
   cd backend
   venv\Scripts\activate
   python manage.py runserver
   ```

4. **Start the frontend** (in another terminal):
   ```powershell
   cd frontend
   npm start
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

---

## ⚡ Fastest Way (Mac/Linux)

1. **Open Terminal in the Playto folder**

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start the backend** (in one terminal):
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

4. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm start
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

---

## 🐳 Docker Way (All Platforms)

If you have Docker installed:

```bash
docker-compose up --build
```

Then open http://localhost:3000

---

## 📝 Manual Setup (If Scripts Don't Work)

### Backend

```bash
# 1. Go to backend folder
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run migrations
python manage.py migrate

# 6. Create admin user (optional)
python manage.py createsuperuser

# 7. Load sample data (optional)
python manage.py shell < seed_data.py

# 8. Start server
python manage.py runserver
```

### Frontend

```bash
# 1. Go to frontend folder (in a NEW terminal)
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

---

## ✅ Verify It's Working

1. **Frontend loads at http://localhost:3000**
   - You should see "Community Feed" header
   - "What's on your mind?" input box
   - Leaderboard widget on the right

2. **Backend API works at http://localhost:8000/api/posts/**
   - You should see JSON response

3. **Admin panel at http://localhost:8000/admin**
   - Login with superuser credentials
   - Create users, posts, comments

---

## 🎮 Try These Features

1. **Create a Post**
   - Click "What's on your mind?"
   - Type something
   - Click "Post"

2. **Add a Comment**
   - Click "Comments" on a post
   - Type your comment
   - Click "Post Comment"

3. **Reply to a Comment**
   - Click "Reply" on any comment
   - Type your reply
   - See nested threading!

4. **Like Something**
   - Click the heart icon on posts or comments
   - Watch the count increase

5. **Check the Leaderboard**
   - See top users (if you seeded data)
   - Auto-refreshes every 30 seconds

---

## 🐛 Troubleshooting

### "Python not found"
Install Python from python.org

### "Node not found"
Install Node.js from nodejs.org

### "Port 8000 already in use"
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

### "Port 3000 already in use"
```bash
# Same as above but for port 3000
```

### "Module not found"
```bash
# Backend:
pip install -r requirements.txt

# Frontend:
npm install
```

### "Database locked"
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py shell < seed_data.py
```

---

## 📚 Next Steps

- Read [README.md](README.md) for detailed info
- Check [EXPLAINER.md](EXPLAINER.md) for technical details
- See [API.md](API.md) for API documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) to deploy online

---

## 🎯 Test Login Credentials

If you seeded the database:
- Username: `alice`, `bob`, `charlie`, etc.
- Password: `password123`

For admin panel:
- Use the superuser you created

---

## 🔥 Pro Tips

1. **Keep both terminals open** - one for backend, one for frontend
2. **Seed sample data** - makes testing easier
3. **Use the admin panel** - great for viewing/editing data
4. **Try the Docker method** - it's the easiest!
5. **Check the leaderboard** - like some posts to see it populate

---

## 🆘 Still Stuck?

1. Check the full [README.md](README.md)
2. Review error messages carefully
3. Make sure all prerequisites are installed
4. Try the Docker method instead

---

**Happy coding! 🚀**
