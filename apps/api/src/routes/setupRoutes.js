const express = require("express")
const router = express.Router()
const setupController = require("../controllers/setupController")
const authMiddleware = require("../middleware/auth")

// Create first admin user (only works if no users exist)
router.post("/first-admin", setupController.createFirstAdmin)

// Initialize utility types (admin only)
router.post(
  "/utility-types",
  authMiddleware.authenticate,
  authMiddleware.authorize(["ADMIN"]),
  setupController.initializeUtilityTypes,
)

// Initialize payment methods (admin only)
router.post(
  "/payment-methods",
  authMiddleware.authenticate,
  authMiddleware.authorize(["ADMIN"]),
  setupController.initializePaymentMethods,
)

module.exports = router

