const axios = require("axios")
const NodeCache = require("node-cache")
const { logger } = require("../utils/logger")

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "your_openweather_api_key_here"
    this.baseUrl = "https://api.openweathermap.org/data/2.5"
    this.cache = new NodeCache({ stdTTL: 3600 }) // 1 hour cache
    this.cacheStats = { hits: 0, misses: 0 }
  }

  async getCurrentWeather(location) {
    const cacheKey = `current_${location}`
    const cached = this.cache.get(cacheKey)

    if (cached) {
      this.cacheStats.hits++
      logger.info(`Cache hit for current weather: ${location}`)
      return cached
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: "metric",
        },
      })

      const weatherData = this.transformCurrentWeather(response.data)
      this.cache.set(cacheKey, weatherData)
      this.cacheStats.misses++

      logger.info(`Fetched current weather for: ${location}`)
      return weatherData
    } catch (error) {
      logger.error(`Error fetching current weather for ${location}:`, error.message)
      throw new Error(`Unable to fetch weather data for ${location}`)
    }
  }

  async getForecast(location) {
    const cacheKey = `forecast_${location}`
    const cached = this.cache.get(cacheKey)

    if (cached) {
      this.cacheStats.hits++
      logger.info(`Cache hit for forecast: ${location}`)
      return cached
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: "metric",
        },
      })

      const forecastData = this.transformForecast(response.data)
      this.cache.set(cacheKey, forecastData)
      this.cacheStats.misses++

      logger.info(`Fetched forecast for: ${location}`)
      return forecastData
    } catch (error) {
      logger.error(`Error fetching forecast for ${location}:`, error.message)
      throw new Error(`Unable to fetch forecast data for ${location}`)
    }
  }

  async getWeatherForLocationAndDate(location, date) {
    const targetDate = new Date(date)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      throw new Error("Cannot get weather data for past dates")
    }

    if (diffDays === 0) {
      return await this.getCurrentWeather(location)
    }

    if (diffDays <= 5) {
      const forecast = await this.getForecast(location)
      const targetDateStr = targetDate.toISOString().split("T")[0]

      const dayForecast = forecast.list.find((item) => item.date.startsWith(targetDateStr))

      if (dayForecast) {
        return dayForecast
      }
    }

    throw new Error("Weather data not available for the specified date")
  }

  async analyzeEventWeather(event) {
    try {
      const weather = await this.getWeatherForLocationAndDate(event.location, event.date)
      const suitabilityScore = this.calculateSuitabilityScore(weather, event.eventType)

      return {
        eventId: event.id,
        weather,
        suitability: {
          score: suitabilityScore.score,
          rating: suitabilityScore.rating,
          factors: suitabilityScore.factors,
          recommendations: suitabilityScore.recommendations,
        },
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      logger.error(`Error analyzing weather for event ${event.id}:`, error.message)
      throw error
    }
  }

  async getEventSuitability(event) {
    const analysis = await this.analyzeEventWeather(event)
    return analysis.suitability
  }

  async getAlternativeDates(event, daysRange = 7) {
    const alternatives = []
    const eventDate = new Date(event.date)

    try {
      const forecast = await this.getForecast(event.location)

      for (let i = 1; i <= daysRange; i++) {
        const alternativeDate = new Date(eventDate)
        alternativeDate.setDate(eventDate.getDate() + i)

        const dateStr = alternativeDate.toISOString().split("T")[0]
        const dayForecast = forecast.list.find((item) => item.date.startsWith(dateStr))

        if (dayForecast) {
          const suitability = this.calculateSuitabilityScore(dayForecast, event.eventType)

          alternatives.push({
            date: dateStr,
            weather: dayForecast,
            suitability: suitability,
            improvement: suitability.score > 70 ? "Better" : suitability.score > 50 ? "Moderate" : "Poor",
          })
        }
      }

      // Sort by suitability score (best first)
      alternatives.sort((a, b) => b.suitability.score - a.suitability.score)

      return {
        originalDate: event.date,
        alternatives: alternatives.slice(0, 5), // Return top 5 alternatives
        bestAlternative: alternatives[0] || null,
      }
    } catch (error) {
      logger.error(`Error getting alternative dates for event ${event.id}:`, error.message)
      throw error
    }
  }

  calculateSuitabilityScore(weather, eventType) {
    let score = 0
    const factors = {}
    const recommendations = []

    // Event type specific scoring
    const eventConfig = this.getEventTypeConfig(eventType)

    // Temperature scoring
    const temp = weather.temperature
    if (temp >= eventConfig.tempRange.min && temp <= eventConfig.tempRange.max) {
      score += eventConfig.weights.temperature
      factors.temperature = "Excellent"
    } else if (temp >= eventConfig.tempRange.min - 5 && temp <= eventConfig.tempRange.max + 5) {
      score += eventConfig.weights.temperature * 0.7
      factors.temperature = "Good"
    } else {
      score += eventConfig.weights.temperature * 0.3
      factors.temperature = "Poor"
      recommendations.push(`Temperature (${temp}°C) is not ideal for ${eventType}`)
    }

    // Precipitation scoring
    const precipitation = weather.precipitation || 0
    if (precipitation <= eventConfig.maxPrecipitation) {
      score += eventConfig.weights.precipitation
      factors.precipitation = "Excellent"
    } else if (precipitation <= eventConfig.maxPrecipitation * 2) {
      score += eventConfig.weights.precipitation * 0.5
      factors.precipitation = "Moderate"
      recommendations.push("Light rain expected - consider indoor backup")
    } else {
      factors.precipitation = "Poor"
      recommendations.push("Heavy rain expected - strongly consider rescheduling")
    }

    // Wind scoring
    const windSpeed = weather.windSpeed || 0
    if (windSpeed <= eventConfig.maxWindSpeed) {
      score += eventConfig.weights.wind
      factors.wind = "Excellent"
    } else if (windSpeed <= eventConfig.maxWindSpeed * 1.5) {
      score += eventConfig.weights.wind * 0.7
      factors.wind = "Moderate"
    } else {
      score += eventConfig.weights.wind * 0.3
      factors.wind = "Poor"
      recommendations.push(`High winds (${windSpeed} km/h) may affect the event`)
    }

    // Weather condition scoring
    const condition = weather.condition.toLowerCase()
    if (eventConfig.goodConditions.some((c) => condition.includes(c))) {
      score += eventConfig.weights.condition
      factors.condition = "Excellent"
    } else if (eventConfig.okayConditions.some((c) => condition.includes(c))) {
      score += eventConfig.weights.condition * 0.7
      factors.condition = "Good"
    } else {
      score += eventConfig.weights.condition * 0.3
      factors.condition = "Poor"
    }

    // Determine overall rating
    let rating
    if (score >= 80) rating = "Excellent"
    else if (score >= 60) rating = "Good"
    else if (score >= 40) rating = "Okay"
    else rating = "Poor"

    return {
      score: Math.round(score),
      rating,
      factors,
      recommendations,
    }
  }

  getEventTypeConfig(eventType) {
    const configs = {
      "outdoor sports": {
        tempRange: { min: 15, max: 30 },
        maxPrecipitation: 20,
        maxWindSpeed: 20,
        goodConditions: ["clear", "sunny", "partly cloudy"],
        okayConditions: ["cloudy", "overcast"],
        weights: { temperature: 30, precipitation: 25, wind: 20, condition: 25 },
      },
      wedding: {
        tempRange: { min: 18, max: 28 },
        maxPrecipitation: 10,
        maxWindSpeed: 15,
        goodConditions: ["clear", "sunny", "partly cloudy"],
        okayConditions: ["cloudy"],
        weights: { temperature: 30, precipitation: 30, wind: 25, condition: 15 },
      },
      hiking: {
        tempRange: { min: 10, max: 25 },
        maxPrecipitation: 30,
        maxWindSpeed: 25,
        goodConditions: ["clear", "sunny", "partly cloudy", "cloudy"],
        okayConditions: ["overcast", "mist"],
        weights: { temperature: 25, precipitation: 30, wind: 20, condition: 25 },
      },
      corporate: {
        tempRange: { min: 16, max: 26 },
        maxPrecipitation: 15,
        maxWindSpeed: 18,
        goodConditions: ["clear", "sunny", "partly cloudy"],
        okayConditions: ["cloudy"],
        weights: { temperature: 25, precipitation: 35, wind: 20, condition: 20 },
      },
    }

    return configs[eventType.toLowerCase()] || configs["outdoor sports"]
  }

  transformCurrentWeather(data) {
    return {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: data.wind.deg,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      precipitation: data.rain ? data.rain["1h"] || 0 : 0,
      visibility: data.visibility / 1000, // Convert to km
      timestamp: new Date().toISOString(),
    }
  }

  transformForecast(data) {
    return {
      location: data.city.name,
      country: data.city.country,
      list: data.list.map((item) => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: Math.round(item.wind.speed * 3.6),
        windDirection: item.wind.deg,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: item.rain ? item.rain["3h"] || 0 : 0,
        timestamp: new Date().toISOString(),
      })),
    }
  }

  getCacheStats() {
    return {
      ...this.cacheStats,
      cacheSize: this.cache.keys().length,
      keys: this.cache.keys(),
    }
  }

  clearCache() {
    this.cache.flushAll()
    this.cacheStats = { hits: 0, misses: 0 }
  }
}

module.exports = new WeatherService()
