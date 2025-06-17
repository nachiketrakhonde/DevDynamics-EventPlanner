const express = require("express")
const router = express.Router()
const WeatherService = require("../services/weatherService")
const { asyncHandler } = require("../middleware/asyncHandler")

// Get weather for specific location and date
router.get(
  "/:location/:date",
  asyncHandler(async (req, res) => {
    const { location, date } = req.params

    // Validate date format
    const eventDate = new Date(date)
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      })
    }

    const weather = await WeatherService.getWeatherForLocationAndDate(location, eventDate)

    res.json({
      success: true,
      data: weather,
    })
  }),
)

// Get current weather for location
router.get(
  "/:location/current",
  asyncHandler(async (req, res) => {
    const { location } = req.params
    const weather = await WeatherService.getCurrentWeather(location)

    res.json({
      success: true,
      data: weather,
    })
  }),
)

// Get 5-day forecast for location
router.get(
  "/:location/forecast",
  asyncHandler(async (req, res) => {
    const { location } = req.params
    const forecast = await WeatherService.getForecast(location)

    res.json({
      success: true,
      data: forecast,
    })
  }),
)

// Get weather cache status
router.get(
  "/cache/status",
  asyncHandler(async (req, res) => {
    const cacheStats = WeatherService.getCacheStats()

    res.json({
      success: true,
      data: cacheStats,
    })
  }),
)

// Clear weather cache
router.delete(
  "/cache/clear",
  asyncHandler(async (req, res) => {
    WeatherService.clearCache()

    res.json({
      success: true,
      message: "Weather cache cleared successfully",
    })
  }),
)

module.exports = router
