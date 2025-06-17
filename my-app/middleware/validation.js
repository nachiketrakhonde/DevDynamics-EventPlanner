const { body, validationResult } = require("express-validator")

const validateEvent = [
  body("name")
    .notEmpty()
    .withMessage("Event name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Event name must be between 3 and 100 characters"),

  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)")
    .custom((value) => {
      const eventDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (eventDate < today) {
        throw new Error("Event date cannot be in the past")
      }
      return true
    }),

  body("eventType")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn(["outdoor sports", "wedding", "hiking", "corporate", "festival", "picnic", "concert"])
    .withMessage("Invalid event type"),

  body("duration").optional().isInt({ min: 1, max: 24 }).withMessage("Duration must be between 1 and 24 hours"),

  body("participants").optional().isInt({ min: 1 }).withMessage("Participants must be at least 1"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }
    next()
  },
]

const validateEventUpdate = [
  body("name").optional().isLength({ min: 3, max: 100 }).withMessage("Event name must be between 3 and 100 characters"),

  body("location")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)")
    .custom((value) => {
      if (value) {
        const eventDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (eventDate < today) {
          throw new Error("Event date cannot be in the past")
        }
      }
      return true
    }),

  body("eventType")
    .optional()
    .isIn(["outdoor sports", "wedding", "hiking", "corporate", "festival", "picnic", "concert"])
    .withMessage("Invalid event type"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }
    next()
  },
]

module.exports = {
  validateEvent,
  validateEventUpdate,
}
