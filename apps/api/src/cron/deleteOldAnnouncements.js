const prisma = require("../config/prisma")
const cron = require("node-cron")

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
      console.log(`[Scheduled] ลบประกาศเก่าแล้ว ${deletedAnnouncements.count} รายการ`)
    }

    return deletedAnnouncements.count
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบประกาศเก่า:", error)
    return 0
  }
}

// ตั้งเวลาให้ทำงานทุกวันเวลาเที่ยงคืน
function scheduleDailyCleanup() {
  try {
    // ทำงานทุกวันเวลา 00:00
    cron.schedule("0 0 * * *", async () => {
      console.log("กำลังทำงานตามกำหนดเวลา: ลบประกาศเก่า")
      await deleteOldAnnouncements()
    })

    console.log("ตั้งเวลาลบประกาศเก่าเรียบร้อยแล้ว (ทุกวันเวลาเที่ยงคืน)")
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการตั้งเวลา:", error)
  }
}

module.exports = { deleteOldAnnouncements, scheduleDailyCleanup }

