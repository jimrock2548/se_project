const express = require("express")
const router = express.Router()
const roomController = require("../controllers/roomController")
const authMiddleware = require("../middleware/auth")

// Get all rooms
router.get("/", authMiddleware.authenticate, roomController.getAllRooms)

// Get room by ID
router.get("/:id", authMiddleware.authenticate, roomController.getRoomById)

// Create a new room (landlord only)
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.createRoom)

// Update room (landlord only)
router.put("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.updateRoom)

// Delete room (landlord only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), roomController.deleteRoom)

module.exports = router

