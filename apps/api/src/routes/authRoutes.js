const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/auth")

// Login route
router.post("/login", authController.login)

// Get current user info (protected route)
router.get("/me", authMiddleware.authenticate, authController.getCurrentUser)

// Logout route (optional for JWT)
router.post("/logout", authController.logout)

module.exports = router

