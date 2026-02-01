@echo off
echo 🚀 Community Feed - Quick Setup Script
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9+ first.
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

echo ✅ Node.js found
node --version
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo   Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo   Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo   Installing Python dependencies...
pip install -q -r requirements.txt

REM Run migrations
echo   Running migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser prompt
echo.
echo 📝 Would you like to create a superuser for admin access? (y/n)
set /p create_superuser=
if "%create_superuser%"=="y" (
    python manage.py createsuperuser
)

REM Seed data prompt
echo.
echo 📝 Would you like to seed the database with sample data? (y/n)
set /p seed_data=
if "%seed_data%"=="y" (
    echo   Seeding database...
    python manage.py shell < seed_data.py
)

cd ..

REM Frontend setup
echo.
echo 📦 Setting up Frontend...
cd frontend

echo   Installing Node dependencies...
call npm install

cd ..

REM Done
echo.
echo ======================================
echo ✅ Setup Complete!
echo ======================================
echo.
echo To start the application:
echo.
echo   Backend:
echo     cd backend
echo     venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   Frontend:
echo     cd frontend
echo     npm start
echo.
echo Or use Docker:
echo     docker-compose up --build
echo.
echo 📚 See README.md for more information
pause
