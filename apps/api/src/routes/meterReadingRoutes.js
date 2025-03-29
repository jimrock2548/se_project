const express = require("express")
const router = express.Router()
const meterReadingController = require("../controllers/meterReadingController")
const { authenticateToken } = require("../middleware/auth")

// ดึงข้อมูลมิเตอร์ทั้งหมดของห้อง
router.get("/rooms/:roomId/meters", authenticateToken, meterReadingController.getRoomMeters)

// ดึงข้อมูลการอ่านมิเตอร์ล่าสุดของห้อง
router.get("/rooms/:roomId/readings", authenticateToken, meterReadingController.getLatestMeterReadings)

// บันทึกการอ่านมิเตอร์ใหม่
router.post("/", authenticateToken, meterReadingController.createMeterReading)

// ดึงประวัติการอ่านมิเตอร์
router.get("/meters/:meterId/history", authenticateToken, meterReadingController.getMeterReadingHistory)

module.exports = router

