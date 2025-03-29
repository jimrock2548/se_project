const express = require("express")
const router = express.Router()
const setupController = require("../controllers/setupController")
const authMiddleware = require("../middleware/auth")

// Create first landlord user (only works if no users exist)
router.post("/first-landlord", setupController.createFirstLandlord)

// Initialize utility types (landlord only)
router.post(
  "/utility-types",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD"]),
  setupController.initializeUtilityTypes,
)

// Initialize payment methods (landlord only)
router.post(
  "/payment-methods",
  authMiddleware.authenticate,
  authMiddleware.authorize(["LANDLORD"]),
  setupController.initializePaymentMethods,
)

module.exports = router

