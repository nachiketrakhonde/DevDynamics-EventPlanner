const express = require("express")
const router = express.Router()
const EventService = require("../services/eventService")
const WeatherService = require("../services/weatherService")
const { validateEvent, validateEventUpdate } = require("../middleware/validation")
const { asyncHandler } = require("../middleware/asyncHandler")

// Create new event
router.post(
  "/",
  validateEvent,
  asyncHandler(async (req, res) => {
    const eventData = req.body
    const event = await EventService.createEvent(eventData)

    // Automatically check weather for the event
    const weatherAnalysis = await WeatherService.analyzeEventWeather(event)

    res.status(201).json({
      success: true,
      data: {
        event,
        weatherAnalysis,
      },
    })
  }),
)

// Get all events
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, eventType, location } = req.query
    const events = await EventService.getAllEvents({ page, limit, eventType, location })

    res.json({
      success: true,
      data: events,
    })
  }),
)

// Get event by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const event = await EventService.getEventById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    res.json({
      success: true,
      data: event,
    })
  }),
)

// Update event
router.put(
  "/:id",
  validateEventUpdate,
  asyncHandler(async (req, res) => {
    const updatedEvent = await EventService.updateEvent(req.params.id, req.body)

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    res.json({
      success: true,
      data: updatedEvent,
    })
  }),
)

// Delete event
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await EventService.deleteEvent(req.params.id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    })
  }),
)

// Check weather for specific event
router.post(
  "/:id/weather-check",
  asyncHandler(async (req, res) => {
    const event = await EventService.getEventById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    const weatherAnalysis = await WeatherService.analyzeEventWeather(event)

    res.json({
      success: true,
      data: weatherAnalysis,
    })
  }),
)

// Get weather suitability score
router.get(
  "/:id/suitability",
  asyncHandler(async (req, res) => {
    const event = await EventService.getEventById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    const suitability = await WeatherService.getEventSuitability(event)

    res.json({
      success: true,
      data: suitability,
    })
  }),
)

// Get alternative dates for better weather
router.get(
  "/:id/alternatives",
  asyncHandler(async (req, res) => {
    const event = await EventService.getEventById(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      })
    }

    const { days = 7 } = req.query
    const alternatives = await WeatherService.getAlternativeDates(event, Number.parseInt(days))

    res.json({
      success: true,
      data: alternatives,
    })
  }),
)

module.exports = router
