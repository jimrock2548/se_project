const express = require("express")
const router = express.Router()
const reportController = require("../controllers/reportController")
const authMiddleware = require("../middleware/auth")

// Get all reports (authenticated users only)
router.get("/", authMiddleware.authenticate, reportController.getAllReports)

// Create a new report (resident only)
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["RESIDENT"]), reportController.createReport)

// Update report status (landlord or admin only)
router.patch(
  "/:id/status",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD", "ADMIN"]),
  reportController.updateReportStatus,
)

module.exports = router

