const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")

// Get all utility types
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const utilityTypes = await prisma.utilityType.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return res.status(200).json({ utilityTypes })
  } catch (error) {
    console.error("Get utility types error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Create a new utility type (landlord only)
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { name, unit, description } = req.body

    // Validate required fields
    if (!name || !unit) {
      return res.status(400).json({ error: "Name and unit are required" })
    }

    // Check if utility type already exists
    const existingUtilityType = await prisma.utilityType.findFirst({
      where: {
        name,
      },
    })

    if (existingUtilityType) {
      return res.status(400).json({ error: "Utility type already exists" })
    }

    // Create utility type
    const utilityType = await prisma.utilityType.create({
      data: {
        name,
        unit,
        description,
      },
    })

    return res.status(201).json({
      message: "Utility type created successfully",
      utilityType,
    })
  } catch (error) {
    console.error("Create utility type error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Get utility type by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params

    const utilityType = await prisma.utilityType.findUnique({
      where: { id },
    })

    if (!utilityType) {
      return res.status(404).json({ error: "Utility type not found" })
    }

    return res.status(200).json({ utilityType })
  } catch (error) {
    console.error("Get utility type error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Update utility type (landlord only)
router.put("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, unit, description } = req.body

    // Check if utility type exists
    const utilityType = await prisma.utilityType.findUnique({
      where: { id },
    })

    if (!utilityType) {
      return res.status(404).json({ error: "Utility type not found" })
    }

    // Update utility type
    const updatedUtilityType = await prisma.utilityType.update({
      where: { id },
      data: {
        name: name !== undefined ? name : utilityType.name,
        unit: unit !== undefined ? unit : utilityType.unit,
        description: description !== undefined ? description : utilityType.description,
      },
    })

    return res.status(200).json({
      message: "Utility type updated successfully",
      utilityType: updatedUtilityType,
    })
  } catch (error) {
    console.error("Update utility type error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Delete utility type (landlord only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if utility type exists
    const utilityType = await prisma.utilityType.findUnique({
      where: { id },
    })

    if (!utilityType) {
      return res.status(404).json({ error: "Utility type not found" })
    }

    // Check if utility type is used in any meter
    const meter = await prisma.meter.findFirst({
      where: {
        utilityTypeId: id,
      },
    })

    if (meter) {
      return res.status(400).json({ error: "Cannot delete utility type that is used in meters" })
    }

    // Delete utility type
    await prisma.utilityType.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Utility type deleted successfully",
    })
  } catch (error) {
    console.error("Delete utility type error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router

