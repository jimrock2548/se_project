const prisma = require("../config/prisma")

// ฟังก์ชันสำหรับลบประกาศที่เก่ากว่า 14 วัน
async function deleteOldAnnouncements() {
  try {
    // คำนวณวันที่ 14 วันที่แล้ว
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // ลบประกาศที่เก่ากว่า 14 วัน
    const deletedAnnouncements = await prisma.announcement.deleteMany({
      where: {
        publishDate: {
          lt: fourteenDaysAgo,
        },
      },
    })

    if (deletedAnnouncements.count > 0) {
      console.log(`ลบประกาศเก่าแล้ว ${deletedAnnouncements.count} รายการ`)
    }

    return deletedAnnouncements.count
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบประกาศเก่า:", error)
    return 0
  }
}

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    // ลบประกาศเก่าก่อนที่จะดึงข้อมูล
    await deleteOldAnnouncements()

    const { limit } = req.query

    const where = {}

    // ถ้ามีการระบุ limit ให้ดึงข้อมูลตามจำนวนที่ระบุ
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        publishDate: "desc",
      },
      take: limit ? Number.parseInt(limit) : undefined,
      include: {
        landlord: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    })

    return res.status(200).json({ announcements })
  } catch (error) {
    console.error("Get announcements error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, publishDate, expiryDate } = req.body
    const { landlordId } = req.user

    // Validate required fields
    if (!title || !content || !publishDate) {
      return res.status(400).json({ error: "Title, content, and publish date are required" })
    }

    // Check if user is a landlord
    if (!landlordId) {
      return res.status(403).json({ error: "Only landlords can create announcements" })
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        publishDate: new Date(publishDate),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isActive: true,
        landlord: {
          connect: { id: landlordId },
        },
      },
      include: {
        landlord: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    })

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    })
  } catch (error) {
    console.error("Create announcement error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const { landlordId, role } = req.user

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        landlord: true,
      },
    })

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" })
    }

    // Check if user is the owner of the announcement
    if (announcement.landlordId !== landlordId) {
      return res.status(403).json({ error: "You don't have permission to delete this announcement" })
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Announcement deleted successfully",
    })
  } catch (error) {
    console.error("Delete announcement error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

