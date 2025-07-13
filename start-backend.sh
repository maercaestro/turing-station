#!/bin/bash

# Turing Station - Backend Test Script

echo "🚀 Testing Turing Station Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit backend/.env and add your OpenAI API key!"
    echo ""
fi

# Start the backend server
echo "🚀 Starting backend server..."
echo "📡 Backend will run on http://localhost:3001"
echo "🔗 API endpoints available at http://localhost:3001/api"
echo "❤️  Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
