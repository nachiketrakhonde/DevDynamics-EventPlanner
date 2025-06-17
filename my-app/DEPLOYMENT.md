# 🚀 Deployment Guide

This guide covers multiple deployment options for the Smart Event Planner API.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **OpenWeatherMap API Key**
   - Sign up at https://openweathermap.org/api
   - Get your free API key (1000 calls/day)
   - Add it to your `.env` file

2. **Environment Variables**
   \`\`\`env
   OPENWEATHER_API_KEY=your_api_key_here
   NODE_ENV=production
   PORT=3000
   \`\`\`

## 🎯 Quick Deploy

Run the deployment script:
\`\`\`bash
node scripts/deploy.js [platform]
\`\`\`

Available platforms: `railway`, `render`, `heroku`, `docker`

## 🚂 Railway (Recommended)

**Why Railway?**
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Git-based deployments

### Deploy Steps:

1. **Install Railway CLI**
   \`\`\`bash
   npm install -g @railway/cli
   \`\`\`

2. **Login and Deploy**
   \`\`\`bash
   railway login
   railway up
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   railway variables set OPENWEATHER_API_KEY=your_api_key
   \`\`\`

4. **Access Your App**
   - Railway will provide a URL like: `https://your-app.railway.app`

### Railway Dashboard Setup:
1. Go to https://railway.app/dashboard
2. Connect your GitHub repository
3. Add environment variables
4. Deploy automatically on git push

---

## 🎨 Render

**Why Render?**
- ✅ Free tier available
- ✅ Automatic SSL certificates
- ✅ GitHub integration
- ✅ Health checks included

### Deploy Steps:

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   \`\`\`

2. **Create Render Service**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Add Environment Variables**
   \`\`\`
   OPENWEATHER_API_KEY = your_api_key
   NODE_ENV = production
   \`\`\`

4. **Deploy**
   - Render will automatically deploy on git push
   - Access your app at the provided URL

---

## 🟣 Heroku

**Why Heroku?**
- ✅ Mature platform
- ✅ Extensive add-on ecosystem
- ✅ Easy scaling
- ✅ CLI tools

### Deploy Steps:

1. **Install Heroku CLI**
   \`\`\`bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   \`\`\`

2. **Login and Create App**
   \`\`\`bash
   heroku login
   heroku create your-app-name
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   heroku config:set OPENWEATHER_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   \`\`\`

4. **Deploy**
   \`\`\`bash
   git push heroku main
   \`\`\`

5. **Open Your App**
   \`\`\`bash
   heroku open
   \`\`\`

### Heroku Add-ons (Optional):
\`\`\`bash
# Logging
heroku addons:create papertrail:choklad

# Monitoring
heroku addons:create newrelic:wayne

# Redis caching
heroku addons:create heroku-redis:mini
\`\`\`

---

## 🐳 Docker

**Why Docker?**
- ✅ Consistent environments
- ✅ Easy local development
- ✅ Scalable deployments
- ✅ Works anywhere

### Deploy Steps:

1. **Build and Run**
   \`\`\`bash
   # Build the image
   docker build -t smart-event-planner .
   
   # Run with environment variables
   docker run -p 3000:3000 \
     -e OPENWEATHER_API_KEY=your_api_key \
     -e NODE_ENV=production \
     smart-event-planner
   \`\`\`

2. **Using Docker Compose**
   \`\`\`bash
   # Create .env file first
   echo "OPENWEATHER_API_KEY=your_api_key" > .env
   
   # Start all services
   docker-compose up -d
   \`\`\`

3. **Access Your App**
   - http://localhost:3000
   - Health check: http://localhost:3000/health

### Docker Production Tips:
- Use multi-stage builds for smaller images
- Set up proper logging drivers
- Use Docker secrets for sensitive data
- Consider orchestration with Kubernetes

---

## 🌐 Custom VPS/Server

### Deploy Steps:

1. **Server Setup**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   \`\`\`

2. **Deploy Application**
   \`\`\`bash
   # Clone repository
   git clone your-repo-url
   cd smart-event-planner-backend
   
   # Install dependencies
   npm install --production
   
   # Set environment variables
   echo "OPENWEATHER_API_KEY=your_api_key" > .env
   echo "NODE_ENV=production" >> .env
   
   # Start with PM2
   pm2 start server.js --name "event-planner"
   pm2 startup
   pm2 save
   \`\`\`

3. **Set up Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

---

## 📊 Post-Deployment Checklist

After deploying, verify these endpoints:

- ✅ **Health Check**: `GET /health`
- ✅ **Create Event**: `POST /api/events`
- ✅ **Weather Data**: `GET /api/weather/Mumbai/current`
- ✅ **Event Analysis**: `POST /api/events/:id/weather-check`

### Test with cURL:
\`\`\`bash
# Health check
curl https://your-app-url.com/health

# Create test event
curl -X POST https://your-app-url.com/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "location": "Mumbai",
    "date": "2024-03-20",
    "eventType": "outdoor sports"
  }'
\`\`\`

## 🔧 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | - | ✅ |
| `NODE_ENV` | Node environment | development | ✅ |
| `PORT` | Server port | 3000 | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | ❌ |
| `CACHE_TTL` | Cache time-to-live | 3600 | ❌ |
| `LOG_LEVEL` | Logging level | info | ❌ |

## 🚨 Troubleshooting

### Common Issues:

1. **API Key Not Working**
   \`\`\`bash
   # Test your API key
   curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY"
   \`\`\`

2. **Port Already in Use**
   \`\`\`bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 PID
   \`\`\`

3. **Memory Issues**
   \`\`\`bash
   # Check memory usage
   free -h
   
   # Restart application
   pm2 restart event-planner
   \`\`\`

4. **Logs Not Showing**
   \`\`\`bash
   # Check PM2 logs
   pm2 logs event-planner
   
   # Check application logs
   tail -f logs/combined.log
   \`\`\`

## 📈 Monitoring & Scaling

### Health Monitoring:
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure alerts for API failures
- Monitor API rate limits

### Performance Optimization:
- Enable gzip compression
- Set up CDN for static assets
- Implement database connection pooling
- Use Redis for advanced caching

### Scaling Options:
- **Horizontal**: Multiple server instances
- **Vertical**: Increase server resources
- **Load Balancing**: Distribute traffic
- **Caching**: Redis/Memcached integration

---

## 🎉 Success!

Your Smart Event Planner API is now deployed and ready to help users plan amazing outdoor events with intelligent weather insights!

### Next Steps:
1. Set up monitoring and alerts
2. Configure custom domain (optional)
3. Set up CI/CD pipeline
4. Add more weather providers
5. Implement user authentication

**Happy Event Planning! 🌤️**
