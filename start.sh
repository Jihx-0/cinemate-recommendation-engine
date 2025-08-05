#!/bin/bash

echo "🎬 Welcome to Lumora - AI-Powered Movie Recommendations!"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo "TMDB_API_KEY=your_tmdb_api_key_here" > .env
    echo "FLASK_SECRET_KEY=$(openssl rand -hex 32)" >> .env
    echo "⚠️  Please update the .env file with your TMDb API key!"
    echo "   Get your free API key at: https://www.themoviedb.org/settings/api"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Install backend dependencies
echo "🐍 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo ""
echo "🚀 Starting Lumora..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev 