const express = require("express")
const router = express.Router()
const billController = require("../controllers/billController")
const { authenticateToken } = require("../middleware/auth")

// ดึงข้อมูลบิลทั้งหมด
router.get("/", authenticateToken, billController.getAllBills)

// ดึงข้อมูลบิลตาม ID
router.get("/:id", authenticateToken, billController.getBillById)

// สร้างบิลใหม่
router.post("/", authenticateToken, billController.createBill)

// อัปเดตสถานะบิล
router.patch("/:id/status", authenticateToken, billController.updateBillStatus)

module.exports = router

