const express = require("express")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
require("dotenv").config()

const eventRoutes = require("./routes/events")
const weatherRoutes = require("./routes/weather")
const { errorHandler } = require("./middleware/errorHandler")
const { logger } = require("./utils/logger")

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use("/api/events", eventRoutes)
app.use("/api/weather", weatherRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  })
})

// Global error handler
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Smart Event Planner API running on port ${PORT}`)
  console.log(`🌤️  Smart Event Planner API running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
