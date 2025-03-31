const express = require("express")
const router = express.Router()
const setupController = require("../controllers/setupController")
const authMiddleware = require("../middleware/auth")
const prisma = require("../config/prisma")

// Create first landlord user (only works if no users exist)
router.post("/first-landlord", setupController.createFirstLandlord)

// Initialize utility types (landlord only)
router.post(
  "/initialize-utility-types",
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

// เพิ่ม GET handler สำหรับดึงข้อมูลประเภทสาธารณูปโภค
router.get("/utility-types", authMiddleware.authenticate, async (req, res) => {
  try {
    // ดึงข้อมูลประเภทสาธารณูปโภคทั้งหมด
    const utilityTypes = await prisma.utilityType.findMany({
      include: {
        utilityRates: {
          where: { isActive: true },
          orderBy: { effectiveDate: "desc" },
          take: 1,
        },
      },
    })

    return res.status(200).json({ utilityTypes })
  } catch (error) {
    console.error("Get utility types error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router

