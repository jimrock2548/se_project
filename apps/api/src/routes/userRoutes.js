const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middleware/auth")

// Get all users (admin and landlord only)
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize(["ADMIN", "LANDLORD"]),
  userController.getAllUsers,
)

// Get user by ID (admin, landlord, or own user)
router.get("/:id", authMiddleware.authenticate, userController.getUserById)

// Create a new user (admin and landlord only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize(["ADMIN", "LANDLORD"]),
  userController.createUser,
)

// Update user (admin, landlord, or own user)
router.put("/:id", authMiddleware.authenticate, userController.updateUser)

// Change password (admin or own user)
router.post("/:id/change-password", authMiddleware.authenticate, userController.changePassword)

// Delete user (admin only)
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["ADMIN"]), userController.deleteUser)

module.exports = router

