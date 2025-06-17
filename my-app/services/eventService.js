const fs = require("fs").promises
const path = require("path")
const { v4: uuidv4 } = require("uuid")

class EventService {
  constructor() {
    this.dataFile = path.join(__dirname, "../data/events.json")
    this.ensureDataFile()
  }

  async ensureDataFile() {
    try {
      await fs.access(this.dataFile)
    } catch (error) {
      // File doesn't exist, create it
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true })
      await fs.writeFile(this.dataFile, JSON.stringify([], null, 2))
    }
  }

  async readEvents() {
    try {
      const data = await fs.readFile(this.dataFile, "utf8")
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }

  async writeEvents(events) {
    await fs.writeFile(this.dataFile, JSON.stringify(events, null, 2))
  }

  async createEvent(eventData) {
    const events = await this.readEvents()

    const newEvent = {
      id: uuidv4(),
      name: eventData.name,
      location: eventData.location,
      date: eventData.date,
      eventType: eventData.eventType,
      description: eventData.description || "",
      duration: eventData.duration || 4, // hours
      participants: eventData.participants || 1,
      requirements: eventData.requirements || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    events.push(newEvent)
    await this.writeEvents(events)

    return newEvent
  }

  async getAllEvents(filters = {}) {
    const events = await this.readEvents()
    let filteredEvents = events

    // Apply filters
    if (filters.eventType) {
      filteredEvents = filteredEvents.filter((event) =>
        event.eventType.toLowerCase().includes(filters.eventType.toLowerCase()),
      )
    }

    if (filters.location) {
      filteredEvents = filteredEvents.filter((event) =>
        event.location.toLowerCase().includes(filters.location.toLowerCase()),
      )
    }

    // Pagination
    const page = Number.parseInt(filters.page) || 1
    const limit = Number.parseInt(filters.limit) || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    return {
      events: paginatedEvents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredEvents.length / limit),
        totalEvents: filteredEvents.length,
        hasNext: endIndex < filteredEvents.length,
        hasPrev: startIndex > 0,
      },
    }
  }

  async getEventById(id) {
    const events = await this.readEvents()
    return events.find((event) => event.id === id)
  }

  async updateEvent(id, updateData) {
    const events = await this.readEvents()
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return null
    }

    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await this.writeEvents(events)
    return events[eventIndex]
  }

  async deleteEvent(id) {
    const events = await this.readEvents()
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return false
    }

    events.splice(eventIndex, 1)
    await this.writeEvents(events)
    return true
  }
}

module.exports = new EventService()
