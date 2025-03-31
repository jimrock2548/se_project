const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")

// Get all reports
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const { status, type } = req.query
    const { role, userId, landlordId } = req.user

    // Build filter conditions
    const where = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // If user is a resident, only show reports they created
    if (role === "RESIDENT") {
      // Get the resident record for this user
      const reporter = await prisma.resident.findFirst({
        where: { userId },
      })

      if (reporter) {
        where.reporterId = reporter.id
      } else {
        return res.status(404).json({ error: "Resident record not found for this user" })
      }
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reporter: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        reported: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
      },
    })

    return res.status(200).json({ reports })
  } catch (error) {
    console.error("Get reports error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Create a new report
router.post("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const { reportedId, title, description } = req.body
    const { userId } = req.user

    // Validate required fields
    if (!reportedId || !title || !description) {
      return res.status(400).json({ error: "Reported resident, title, and description are required" })
    }

    // Get the reporter's resident record
    const reporter = await prisma.resident.findFirst({
      where: { userId },
    })

    if (!reporter) {
      return res.status(404).json({ error: "Resident record not found for this user" })
    }

    // Check if reported resident exists
    const reported = await prisma.resident.findUnique({
      where: { id: reportedId },
    })

    if (!reported) {
      return res.status(404).json({ error: "Reported resident not found" })
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        status: "PENDING",
        reporter: {
          connect: { id: reporter.id },
        },
        reported: {
          connect: { id: reportedId },
        },
      },
      include: {
        reporter: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        reported: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
      },
    })

    return res.status(201).json({
      message: "Report created successfully",
      report,
    })
  } catch (error) {
    console.error("Create report error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get report by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { role, userId, landlordId } = req.user

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        reported: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
      },
    })

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    // Check if user has permission to view this report
    if (role === "RESIDENT") {
      // Get the resident record for this user
      const resident = await prisma.resident.findFirst({
        where: { userId },
      })

      if (!resident || report.reporterId !== resident.id) {
        return res.status(403).json({ error: "You don't have permission to view this report" })
      }
    }

    return res.status(200).json({ report })
  } catch (error) {
    console.error("Get report by ID error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Update report status (landlord only)
router.patch("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status, response } = req.body

    // Validate required fields
    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        response: response || report.response,
      },
      include: {
        reporter: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        reported: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Report status updated successfully",
      report: updatedReport,
    })
  } catch (error) {
    console.error("Update report status error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Delete report (landlord only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    // Delete report
    await prisma.report.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Report deleted successfully",
    })
  } catch (error) {
    console.error("Delete report error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

module.exports = router

