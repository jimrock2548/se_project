// middleware/checkOldAnnouncements.js
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Middleware สำหรับตรวจสอบและลบประกาศเก่า
async function checkOldAnnouncements(req, res, next) {
  try {
    // คำนวณวันที่ 14 วันที่แล้ว
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // ลบประกาศที่เก่ากว่า 14 วัน
    await prisma.announcement.deleteMany({
      where: {
        createdAt: {
          lt: fourteenDaysAgo,
        },
      },
    })

    // ดำเนินการต่อไปยัง route handler
    next()
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบประกาศเก่า:", error)
    next()
  }
}

module.exports = checkOldAnnouncements

