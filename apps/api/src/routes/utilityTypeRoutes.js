import express from "express"
import { prisma } from "../db.js"

const router = express.Router()

// เพิ่มการจัดการข้อผิดพลาดที่ดีขึ้นในการดึงข้อมูล utility types
router.get("/", async (req, res) => {
  try {
    console.log("Fetching utility types")

    const utilityTypes = await prisma.utilityType.findMany({
      include: {
        utilityRates: {
          where: { isActive: true },
          orderBy: { effectiveDate: "desc" },
          take: 1,
        },
      },
    })

    console.log(`Found ${utilityTypes.length} utility types`)

    // ถ้าไม่มีข้อมูล utility types ให้สร้างข้อมูลเริ่มต้น
    if (utilityTypes.length === 0) {
      console.log("No utility types found, returning default values")

      return res.status(200).json({
        utilityTypes: [
          { id: "water", name: "น้ำประปา", unit: "ลบ.ม." },
          { id: "electricity", name: "ไฟฟ้า", unit: "หน่วย" },
          { id: "internet", name: "อินเทอร์เน็ต", unit: "เดือน" },
        ],
      })
    }

    return res.status(200).json({ utilityTypes })
  } catch (error) {
    console.error("Get utility types error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

export default router

