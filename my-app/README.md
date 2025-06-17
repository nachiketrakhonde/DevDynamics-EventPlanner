# Smart Event Planner Backend

A comprehensive backend service that helps users plan outdoor events by integrating weather APIs to provide intelligent recommendations based on weather forecasts, venue considerations, and user preferences.

## 🌟 Features

### Core Features (MUST HAVE)
- ✅ **Weather API Integration**: OpenWeatherMap integration for current weather and 5-day forecasts
- ✅ **Event Management System**: Complete CRUD operations for events
- ✅ **Weather Analysis**: Intelligent weather suitability scoring for different event types
- ✅ **Alternative Date Suggestions**: Smart recommendations for better weather dates
- ✅ **Caching Strategy**: Efficient weather data caching to reduce API calls
- ✅ **Error Handling**: Comprehensive error handling for API failures and edge cases

### Optional Features (EXTRA CREDIT)
- ✅ **Enhanced Weather Analysis**: Detailed weather scoring algorithms
- ✅ **Smart Caching**: Advanced caching with statistics and management
- ✅ **Comprehensive Logging**: Winston-based logging system
- ✅ **Input Validation**: Express-validator for request validation
- ✅ **Security Features**: Helmet, CORS, and rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- OpenWeatherMap API key (free tier: 1000 calls/day)

### Installation

1. **Clone and Install**
\`\`\`bash
git clone <repository-url>
cd smart-event-planner-backend
npm install
\`\`\`

2. **Environment Setup**
\`\`\`bash
cp .env.example .env
# Edit .env and add your OpenWeatherMap API key
\`\`\`

3. **Start the Server**
\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

The API will be available at `http://localhost:3000`

## 📋 API Endpoints

### Event Management
\`\`\`
POST   /api/events                    # Create new event
GET    /api/events                    # List all events (with pagination)
GET    /api/events/:id                # Get specific event
PUT    /api/events/:id                # Update event
DELETE /api/events/:id                # Delete event
\`\`\`

### Weather Integration
\`\`\`
GET    /api/weather/:location/:date   # Get weather for location and date
GET    /api/weather/:location/current # Get current weather
GET    /api/weather/:location/forecast # Get 5-day forecast
\`\`\`

### Event Weather Analysis
\`\`\`
POST   /api/events/:id/weather-check  # Analyze weather for event
GET    /api/events/:id/suitability    # Get weather suitability score
GET    /api/events/:id/alternatives   # Get alternative dates
\`\`\`

### System Endpoints
\`\`\`
GET    /health                        # Health check
GET    /api/weather/cache/status      # Cache statistics
DELETE /api/weather/cache/clear       # Clear weather cache
\`\`\`

## 🧪 Testing with Postman

### Sample Requests

**1. Create Cricket Tournament**
\`\`\`json
POST /api/events
{
  "name": "Mumbai Cricket Tournament",
  "location": "Mumbai",
  "date": "2024-03-16",
  "eventType": "outdoor sports",
  "description": "Annual cricket tournament",
  "duration": 8,
  "participants": 22
}
\`\`\`

**2. Create Beach Wedding**
\`\`\`json
POST /api/events
{
  "name": "Beach Wedding Ceremony",
  "location": "Goa",
  "date": "2024-12-10",
  "eventType": "wedding",
  "description": "Sunset beach wedding",
  "duration": 6,
  "participants": 150
}
\`\`\`

**3. Get Weather for Location**
\`\`\`
GET /api/weather/Mumbai/2024-03-16
\`\`\`

**4. Check Event Weather Suitability**
\`\`\`
POST /api/events/{event-id}/weather-check
\`\`\`

**5. Get Alternative Dates**
\`\`\`
GET /api/events/{event-id}/alternatives?days=7
\`\`\`

## 🎯 Weather Scoring Algorithm

The system uses intelligent scoring based on event types:

### Outdoor Sports
- Temperature: 15-30°C (30 points)
- Precipitation: <20% (25 points)  
- Wind: <20km/h (20 points)
- Conditions: Clear/Partly cloudy (25 points)

### Wedding Events
- Temperature: 18-28°C (30 points)
- Precipitation: <10% (30 points)
- Wind: <15km/h (25 points)
- Aesthetic weather: Clear skies (15 points)

### Hiking/Adventure
- Temperature: 10-25°C (25 points)
- Precipitation: <30% (30 points)
- Wind: <25km/h (20 points)
- Visibility: Good conditions (25 points)

## 🔧 Configuration

### Environment Variables
\`\`\`env
OPENWEATHER_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
LOG_LEVEL=info
\`\`\`

### Event Types Supported
- `outdoor sports` - Cricket, football, tennis
- `wedding` - Outdoor ceremonies
- `hiking` - Trekking and adventure activities
- `corporate` - Team outings and events
- `festival` - Music festivals and fairs
- `picnic` - Family gatherings
- `concert` - Outdoor performances

## 📊 Caching Strategy

- **Cache Duration**: 1 hour for weather data
- **Cache Keys**: Location + date combination
- **Cache Statistics**: Hit/miss ratios and performance metrics
- **Cache Management**: Manual cache clearing and status monitoring

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers protection
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## 📝 Logging

- **Winston Logger**: Structured logging with multiple transports
- **Log Levels**: Error, warn, info, debug
- **Log Files**: Separate error and combined logs
- **Request Logging**: All API requests logged with IP and timestamp

## 🚨 Error Handling

The API handles various error scenarios:
- Invalid API keys or API downtime
- Invalid locations or dates
- Rate limit exceeded
- Network timeouts
- Data validation errors
- Cache failures

## 🔄 API Response Format

### Success Response
\`\`\`json
{
  "success": true,
  "data": {
    // Response data
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors if applicable
  ]
}
\`\`\`

## 📈 Performance Considerations

- **Caching**: Reduces API calls by 60-80%
- **Rate Limiting**: Prevents API abuse
- **Pagination**: Efficient data retrieval
- **Error Recovery**: Graceful degradation
- **Memory Management**: Efficient cache cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and support:
- Create an issue in the repository
- Check the logs in the `logs/` directory
- Verify your OpenWeatherMap API key
- Ensure all environment variables are set correctly

---

**Happy Event Planning! 🎉**
