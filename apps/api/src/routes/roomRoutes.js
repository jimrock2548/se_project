const express = require("express")
const router = express.Router()
const roomController = require("../controllers/roomController")
const authMiddleware = require("../middleware/auth")
const prisma = require("../config/prisma")

// Get all rooms
router.get("/", authMiddleware.authenticate, roomController.getAllRooms)

// Get room by ID
router.get("/:id", authMiddleware.authenticate, roomController.getRoomById)

// Create a new room (landlord only)
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.createRoom)

// Update room (landlord only)
router.put("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.updateRoom)

// Delete room (landlord only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.deleteRoom)

// Get meters for a specific room
router.get("/:id/meters", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Get all meters for this room
    const meters = await prisma.meter.findMany({
      where: {
        roomId: id,
        isActive: true,
      },
      include: {
        utilityType: true,
        meterReadings: {
          orderBy: {
            readingDate: "desc",
          },
          take: 1,
        },
      },
    })

    return res.status(200).json({ meters })
  } catch (error) {
    console.error("Get room meters error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get meter readings for a specific room
router.get("/:id/meter-readings", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Get all meters for this room
    const meters = await prisma.meter.findMany({
      where: {
        roomId: id,
        isActive: true,
      },
      include: {
        utilityType: true,
      },
    })

    // Get the latest readings for each meter
    const meterIds = meters.map((meter) => meter.id)

    const readings = await prisma.meterReading.findMany({
      where: {
        meterId: {
          in: meterIds,
        },
      },
      orderBy: {
        readingDate: "desc",
      },
      include: {
        meter: {
          include: {
            utilityType: true,
          },
        },
      },
    })

    // Format readings with utility type information
    const formattedReadings = readings.map((reading) => ({
      ...reading,
      utilityType: reading.meter.utilityType,
    }))

    return res.status(200).json({ readings: formattedReadings })
  } catch (error) {
    console.error("Get room meter readings error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

module.exports = router

