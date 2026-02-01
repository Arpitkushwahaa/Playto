#!/bin/bash

echo "🚀 Community Feed - Quick Setup Script"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Python found: $(python --version)"

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "  Activating virtual environment..."
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
echo "  Installing Python dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "  Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser prompt
echo ""
echo "📝 Would you like to create a superuser for admin access? (y/n)"
read -r create_superuser
if [ "$create_superuser" = "y" ]; then
    python manage.py createsuperuser
fi

# Seed data prompt
echo ""
echo "📝 Would you like to seed the database with sample data? (y/n)"
read -r seed_data
if [ "$seed_data" = "y" ]; then
    echo "  Seeding database..."
    python manage.py shell < seed_data.py
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

echo "  Installing Node dependencies..."
npm install

cd ..

# Done
echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "  Backend:"
echo "    cd backend"
echo "    source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "    python manage.py runserver"
echo ""
echo "  Frontend:"
echo "    cd frontend"
echo "    npm start"
echo ""
echo "Or use Docker:"
echo "    docker-compose up --build"
echo ""
echo "📚 See README.md for more information"
