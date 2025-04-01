const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")

// Get all meter readings
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const { meterId } = req.query

    const where = {}
    if (meterId) {
      where.meterId = meterId
    }

    const meterReadings = await prisma.meterReading.findMany({
      where,
      include: {
        meter: {
          include: {
            utilityType: true,
            room: true,
          },
        },
      },
      orderBy: {
        readingDate: "desc",
      },
    })

    return res.status(200).json({ meterReadings })
  } catch (error) {
    console.error("Get meter readings error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Create a new meter reading
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { meterId, reading, readingDate, note } = req.body
    const { userId } = req.user

    // Validate required fields
    if (!meterId || reading === undefined) {
      return res.status(400).json({ error: "Meter ID and reading are required" })
    }

    // Check if meter exists
    const meter = await prisma.meter.findUnique({
      where: { id: meterId },
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
        // ถ้า recordedBy เป็นฟิลด์ที่จำเป็น แต่ไม่มีในข้อมูลที่ส่งมา
        // เราจะใช้ userId จาก token แทน
        recordedBy: {
          connect: { id: userId },
        },
      },
      include: {
        meter: {
          include: {
            utilityType: true,
            room: true,
          },
        },
      },
    })

    return res.status(201).json({
      message: "Meter reading created successfully",
      meterReading,
    })
  } catch (error) {
    console.error("Create meter reading error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get meter reading by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const meterReading = await prisma.meterReading.findUnique({
      where: { id },
      include: {
        meter: {
          include: {
            utilityType: true,
            room: true,
          },
        },
      },
    })

    if (!meterReading) {
      return res.status(404).json({ error: "Meter reading not found" })
    }

    return res.status(200).json({ meterReading })
  } catch (error) {
    console.error("Get meter reading error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Update meter reading
router.put("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { reading, readingDate, note } = req.body

    // Check if meter reading exists
    const meterReading = await prisma.meterReading.findUnique({
      where: { id },
    })

    if (!meterReading) {
      return res.status(404).json({ error: "Meter reading not found" })
    }

    // Update meter reading
    const updatedMeterReading = await prisma.meterReading.update({
      where: { id },
      data: {
        reading: reading !== undefined ? Number(reading) : meterReading.reading,
        readingDate: readingDate ? new Date(readingDate) : meterReading.readingDate,
        note: note !== undefined ? note : meterReading.note,
      },
      include: {
        meter: {
          include: {
            utilityType: true,
            room: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Meter reading updated successfully",
      meterReading: updatedMeterReading,
    })
  } catch (error) {
    console.error("Update meter reading error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Delete meter reading
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if meter reading exists
    const meterReading = await prisma.meterReading.findUnique({
      where: { id },
    })

    if (!meterReading) {
      return res.status(404).json({ error: "Meter reading not found" })
    }

    // Delete meter reading
    await prisma.meterReading.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Meter reading deleted successfully",
    })
  } catch (error) {
    console.error("Delete meter reading error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router

