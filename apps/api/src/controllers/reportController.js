const prisma = require("../config/prisma")

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query
    const { role, residentId } = req.user

    // Build filter conditions
    const where = {}

    if (status) {
      where.status = status
    }

    // If user is a resident, only show their reports
    if (role === "RESIDENT") {
      where.reporterId = residentId
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
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedId, title, description } = req.body
    const { residentId } = req.user

    // Validate required fields
    if (!reportedId || !title || !description) {
      return res.status(400).json({ error: "Reported resident, title, and description are required" })
    }

    // Check if user is a resident
    if (!residentId) {
      return res.status(403).json({ error: "Only residents can create reports" })
    }

    // Check if reported resident exists
    const reportedResident = await prisma.resident.findUnique({
      where: { id: reportedId },
    })

    if (!reportedResident) {
      return res.status(404).json({ error: "Reported resident not found" })
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        status: "PENDING",
        reporter: {
          connect: { id: residentId },
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
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { role } = req.user

    // Validate required fields
    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    // Check if user is a landlord
    if (role !== "LANDLORD") {
      return res.status(403).json({ error: "Only landlords can update report status" })
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
    return res.status(500).json({ error: "Internal server error" })
  }
}

