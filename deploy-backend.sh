#!/bin/bash

# Deployment script for Turing Station Backend on AWS EC2

echo "🚀 Starting Turing Station Backend Deployment..."

# Update system
sudo apt update

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not already installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Create logs directory
sudo mkdir -p /home/ubuntu/logs
sudo chown ubuntu:ubuntu /home/ubuntu/logs

# Navigate to project directory
cd /home/ubuntu/turing-station/backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create production .env file
echo "⚙️ Setting up environment variables..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
MAX_QUESTIONS_PER_AGENT=5
EOF

echo "⚠️  IMPORTANT: Update the .env file with your actual OpenAI API key!"

# Stop any existing PM2 processes
pm2 stop turing-station-backend 2>/dev/null || true
pm2 delete turing-station-backend 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment completed!"
echo "🔍 Use 'pm2 status' to check application status"
echo "📋 Use 'pm2 logs turing-station-backend' to view logs"
echo "🔄 Use 'pm2 restart turing-station-backend' to restart the app"
