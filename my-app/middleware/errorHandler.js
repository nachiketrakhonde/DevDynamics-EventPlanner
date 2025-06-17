const { logger } = require("../utils/logger")

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  // Default error
  let error = { ...err }
  error.message = err.message

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found"
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message)
    error = { message, statusCode: 400 }
  }

  // API rate limit error
  if (err.message && err.message.includes("rate limit")) {
    error = { message: "API rate limit exceeded. Please try again later.", statusCode: 429 }
  }

  // Weather API errors
  if (err.message && err.message.includes("weather")) {
    error = { message: err.message, statusCode: 503 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = { errorHandler }
