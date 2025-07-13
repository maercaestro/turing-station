# Instructions for updating CORS after deployment

1. Get your Vercel deployment URL from the Vercel dashboard
2. SSH into your EC2 instance
3. Edit the server.js file:

cd /home/ubuntu/turing-station/backend
nano server.js

4. Update the CORS origin array with your actual Vercel URL:

origin: process.env.NODE_ENV === 'production' 
  ? [
      'https://your-actual-vercel-app.vercel.app',
      'https://your-custom-domain.com'  // If you have a custom domain
    ]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'],

5. Restart the application:
pm2 restart turing-station-backend
