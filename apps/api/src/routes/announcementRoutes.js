const express = require("express")
const router = express.Router()
const announcementController = require("../controllers/announcementController")
const authMiddleware = require("../middleware/auth")

// Get all announcements (public)
router.get("/", announcementController.getAllAnnouncements)

// Create a new announcement (landlord only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD"]),
  announcementController.createAnnouncement,
)

// Delete announcement (landlord or admin only)
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD", "ADMIN"]),
  announcementController.deleteAnnouncement,
)

module.exports = router


