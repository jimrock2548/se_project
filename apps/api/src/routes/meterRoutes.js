const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")

// Get all meters
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const meters = await prisma.meter.findMany({
      include: {
        room: true,
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
    console.error("Get meters error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Get meter by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const meter = await prisma.meter.findUnique({
      where: { id },
      include: {
        room: true,
        utilityType: true,
        meterReadings: {
          orderBy: {
            readingDate: "desc",
          },
          take: 5,
        },
      },
    })

    if (!meter) {
      return res.status(404).json({ error: "Meter not found" })
    }

    return res.status(200).json({ meter })
  } catch (error) {
    console.error("Get meter error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Create a new meter
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { roomId, utilityTypeId, meterNumber, initialReading, isActive } = req.body
    const { userId } = req.user // ดึง userId จาก token

    console.log("Creating new meter with data:", req.body)

    // Validate required fields
    if (!roomId || !utilityTypeId || !meterNumber) {
      return res.status(400).json({ error: "Room ID, utility type ID, and meter number are required" })
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Check if utility type exists
    const utilityType = await prisma.utilityType.findUnique({
      where: { id: utilityTypeId },
    })

    if (!utilityType) {
      return res.status(404).json({ error: "Utility type not found" })
    }

    // Check if meter with same number already exists
    const existingMeter = await prisma.meter.findFirst({
      where: {
        meterNumber: meterNumber,
        roomId: roomId,
      },
    })

    if (existingMeter) {
      return res.status(400).json({ error: "A meter with this number already exists for this room" })
    }

    // Create meter
    const meter = await prisma.meter.create({
      data: {
        meterNumber,
        isActive: isActive !== undefined ? isActive : true,
        installationDate: new Date(),
        room: {
          connect: { id: roomId },
        },
        utilityType: {
          connect: { id: utilityTypeId },
        },
        meterReadings:
          initialReading !== undefined && initialReading !== null && initialReading !== ""
            ? {
                create: {
                  reading: Number(initialReading),
                  readingDate: new Date(),
                  note: "Initial reading",
                  recordedBy: {
                    connect: { id: userId }, // เชื่อมโยงกับผู้ใช้ที่กำลังสร้างมิเตอร์
                  },
                },
              }
            : undefined,
      },
      include: {
        room: true,
        utilityType: true,
      },
    })

    return res.status(201).json({
      message: "Meter created successfully",
      meter,
    })
  } catch (error) {
    console.error("Create meter error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Update meter
router.put("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { meterNumber, isActive } = req.body

    // Check if meter exists
    const meter = await prisma.meter.findUnique({
      where: { id },
    })

    if (!meter) {
      return res.status(404).json({ error: "Meter not found" })
    }

    // Update meter
    const updatedMeter = await prisma.meter.update({
      where: { id },
      data: {
        meterNumber: meterNumber || meter.meterNumber,
        isActive: isActive !== undefined ? isActive : meter.isActive,
      },
      include: {
        room: true,
        utilityType: true,
      },
    })

    return res.status(200).json({
      message: "Meter updated successfully",
      meter: updatedMeter,
    })
  } catch (error) {
    console.error("Update meter error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Delete meter
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if meter exists
    const meter = await prisma.meter.findUnique({
      where: { id },
    })

    if (!meter) {
      return res.status(404).json({ error: "Meter not found" })
    }

    // Delete meter readings first
    await prisma.meterReading.deleteMany({
      where: { meterId: id },
    })

    // Delete meter
    await prisma.meter.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Meter deleted successfully",
    })
  } catch (error) {
    console.error("Delete meter error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Get meter readings for a meter
router.get("/:meterId/readings", authMiddleware.authenticate, async (req, res) => {
  try {
    const { meterId } = req.params
    const { limit } = req.query

    // Check if meter exists
    const meter = await prisma.meter.findUnique({
      where: { id: meterId },
    })

    if (!meter) {
      return res.status(404).json({ error: "Meter not found" })
    }

    // Get meter readings
    const readings = await prisma.meterReading.findMany({
      where: { meterId },
      orderBy: {
        readingDate: "desc",
      },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return res.status(200).json({ readings })
  } catch (error) {
    console.error("Get meter readings error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Add a meter reading
router.post(
  "/:meterId/readings",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD"]),
  async (req, res) => {
    try {
      const { meterId } = req.params
      const { reading, readingDate, note } = req.body
      const { userId } = req.user // ดึง userId จาก token

      // Validate required fields
      if (reading === undefined) {
        return res.status(400).json({ error: "Reading is required" })
      }

      // Check if meter exists
      const meter = await prisma.meter.findUnique({
        where: { id: meterId },
        include: {
          utilityType: true,
        },
      })

      if (!meter) {
        return res.status(404).json({ error: "Meter not found" })
      }

      // Create meter reading
      const meterReading = await prisma.meterReading.create({
        data: {
          reading: Number(reading),
          readingDate: readingDate ? new Date(readingDate) : new Date(),
          note,
          meter: {
            connect: { id: meterId },
          },
          recordedBy: {
            connect: { id: userId }, // เชื่อมโยงกับผู้ใช้ที่กำลังบันทึกค่ามิเตอร์
          },
        },
      })

      return res.status(201).json({
        message: "Meter reading added successfully",
        meterReading,
      })
    } catch (error) {
      console.error("Add meter reading error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

module.exports = router

