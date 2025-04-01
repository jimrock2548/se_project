const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

// กำหนดที่เก็บไฟล์สลิป
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../uploads/slips")

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `slip-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
  fileFilter: (req, file, cb) => {
    // ตรวจสอบประเภทไฟล์
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("ไฟล์ต้องเป็นรูปภาพเท่านั้น"))
    }
  },
})

// Get all bills
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const { residentId, roomNumber, status } = req.query
    const { role, landlordId, residentId: userResidentId } = req.user

    // Build filter conditions
    const where = {}

    if (residentId) {
      where.residentId = residentId
    }

    if (roomNumber) {
      where.room = {
        roomNumber,
      }
    }

    if (status) {
      where.status = status
    }

    // If user is a resident, only show their bills
    if (role === "RESIDENT" && userResidentId) {
      where.residentId = userResidentId
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resident: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        billItems: {
          include: {
            utilityType: true,
          },
        },
        payments: true,
      },
    })

    return res.status(200).json({ bills })
  } catch (error) {
    console.error("Get bills error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get current bill for logged in resident
router.get("/current", authMiddleware.authenticate, async (req, res) => {
  try {
    const { role, residentId } = req.user

    if (role !== "RESIDENT") {
      return res.status(403).json({ error: "Only residents can access their current bill" })
    }

    if (!residentId) {
      return res.status(404).json({ error: "Resident ID not found for this user" })
    }

    console.log(`Fetching current bill for resident ID: ${residentId}`)

    // ตรวจสอบว่า residentId มีอยู่จริงหรือไม่
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
    })

    if (!resident) {
      console.log(`Resident with ID ${residentId} not found`)
      return res.status(404).json({ error: "Resident not found" })
    }

    // Get the most recent bill for this resident with status PENDING, OVERDUE, or PROCESSING
    // แก้ไขการใช้ operator in โดยใช้ OR condition แทน
    const bill = await prisma.bill.findFirst({
      where: {
        residentId: residentId,
        OR: [{ status: "PENDING" }, { status: "OVERDUE" }, { status: "PROCESSING" }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resident: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
            room: true,
          },
        },
        billItems: {
          include: {
            utilityType: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            paymentMethod: true,
          },
        },
      },
    })

    if (!bill) {
      console.log(`No current bill found for resident ID: ${residentId}`)
      return res.status(404).json({ error: "No current bill found" })
    }

    console.log(`Found current bill with ID: ${bill.id}`)
    return res.status(200).json(bill)
  } catch (error) {
    console.error("Get current bill error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Get bill by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { role, landlordId, residentId } = req.user

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        resident: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
              },
            },
            room: true,
          },
        },
        billItems: {
          include: {
            utilityType: true,
          },
        },
        payments: true,
      },
    })

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" })
    }

    // Check if user has permission to view this bill
    if (role === "RESIDENT" && bill.residentId !== residentId) {
      return res.status(403).json({ error: "You don't have permission to view this bill" })
    }

    return res.status(200).json({ bill })
  } catch (error) {
    console.error("Get bill by ID error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Create a new bill
router.post("/", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const {
      residentId,
      roomNumber,
      residentName,
      totalAmount,
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
      billItems,
    } = req.body
    const { landlordId } = req.user

    console.log("Received bill creation request with data:", {
      residentId,
      roomNumber,
      residentName,
      totalAmount,
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
      billItemsCount: billItems ? billItems.length : 0,
    })

    // Validate required fields
    if (!residentId || !totalAmount || !dueDate || !billItems || billItems.length === 0) {
      return res.status(400).json({
        error: "Resident ID, total amount, due date, and bill items are required",
      })
    }

    // Check if resident exists
    const resident = await prisma.resident.findFirst({
      where: {
        id: residentId,
      },
      include: {
        room: true,
      },
    })

    let actualResidentId = residentId

    if (!resident) {
      console.error(`Resident with ID ${residentId} not found`)

      // Try to find resident by user ID instead
      const userResident = await prisma.resident.findFirst({
        where: {
          user: {
            id: residentId,
          },
        },
        include: {
          room: true,
        },
      })

      if (userResident) {
        console.log(`Found resident by user ID instead: ${userResident.id}`)
        // Use the correct resident ID
        actualResidentId = userResident.id
      } else {
        return res.status(404).json({ error: "Resident not found" })
      }
    }

    // Create bill without transaction first to simplify
    try {
      // Create the bill first
      const newBill = await prisma.bill.create({
        data: {
          totalAmount: Number(totalAmount),
          billingPeriodStart: new Date(billingPeriodStart),
          billingPeriodEnd: billingPeriodEnd ? new Date(billingPeriodEnd) : new Date(),
          dueDate: new Date(dueDate),
          status: "PENDING",
          resident: {
            connect: { id: actualResidentId },
          },
        },
        include: {
          resident: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
              room: true,
            },
          },
        },
      })

      console.log("Bill created successfully, now creating bill items")

      // Then create bill items separately
      const createdBillItems = []
      for (const item of billItems) {
        const billItemData = {
          description: item.description,
          amount: Number(item.amount),
          unitUsed: item.unitUsed ? Number(item.unitUsed) : null,
          rate: item.rate ? Number(item.rate) : null,
          bill: {
            connect: { id: newBill.id },
          },
        }

        // Only add utilityType connection if utilityTypeId exists and is valid
        if (item.utilityTypeId) {
          try {
            // Check if utility type exists
            const utilityType = await prisma.utilityType.findUnique({
              where: { id: item.utilityTypeId },
            })

            if (utilityType) {
              billItemData.utilityType = {
                connect: { id: item.utilityTypeId },
              }
            }
          } catch (err) {
            console.warn(`UtilityType with ID ${item.utilityTypeId} not found, skipping connection`)
          }
        }

        try {
          const billItem = await prisma.billItem.create({
            data: billItemData,
            include: {
              utilityType: true,
            },
          })
          createdBillItems.push(billItem)
        } catch (err) {
          console.error("Error creating bill item:", err)
        }
      }

      // Get the complete bill with items
      const completeBill = await prisma.bill.findUnique({
        where: { id: newBill.id },
        include: {
          resident: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
              room: true,
            },
          },
          billItems: {
            include: {
              utilityType: true,
            },
          },
        },
      })

      return res.status(201).json({
        message: "Bill created successfully",
        bill: completeBill,
      })
    } catch (error) {
      console.error("Error in bill creation:", error)
      return res.status(500).json({ error: "Failed to create bill", details: error.message })
    }
  } catch (error) {
    console.error("Create bill error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// Update bill status
router.patch("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Validate required fields
    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
      where: { id },
    })

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" })
    }

    // Update bill status
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        status,
      },
      include: {
        resident: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
            room: true,
          },
        },
        billItems: true,
      },
    })

    return res.status(200).json({
      message: "Bill status updated successfully",
      bill: updatedBill,
    })
  } catch (error) {
    console.error("Update bill status error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// เพิ่ม route สำหรับลบบิล
router.delete("/:id", authMiddleware.authenticate, authMiddleware.authorize(["LANDLORD"]), async (req, res) => {
  try {
    const { id } = req.params
    const { deleteRelatedReadings } = req.query // ตัวเลือกสำหรับลบ meter readings ที่เกี่ยวข้อง

    console.log(`Attempting to delete bill with ID: ${id}`)
    console.log(`Delete related readings: ${deleteRelatedReadings}`)

    // ตรวจสอบว่าบิลมีอยู่จริงหรือไม่
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        billItems: true,
      },
    })

    if (!bill) {
      console.log(`Bill with ID ${id} not found`)
      return res.status(404).json({ error: "Bill not found" })
    }

    console.log(`Found bill with ${bill.billItems?.length || 0} items`)

    // ลบ bill items ก่อน (เพื่อป้องกัน foreign key constraint)
    if (bill.billItems && bill.billItems.length > 0) {
      console.log(`Deleting ${bill.billItems.length} bill items`)
      await prisma.billItem.deleteMany({
        where: {
          billId: id,
        },
      })
      console.log("Bill items deleted successfully")
    }

    // ลบบิล
    console.log(`Deleting bill with ID: ${id}`)
    await prisma.bill.delete({
      where: { id },
    })
    console.log("Bill deleted successfully")

    // ถ้ามีการระบุให้ลบ meter readings ที่เกี่ยวข้อง
    if (deleteRelatedReadings === "true") {
      console.log("Note: Related meter readings were not deleted as the relationship is not tracked")
    }

    return res.status(200).json({
      message: "Bill deleted successfully",
    })
  } catch (error) {
    console.error("Delete bill error:", error)
    return res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

// แก้ไขฟังก์ชัน POST /:id/payment เพื่อบันทึก path ของไฟล์ลงในฐานข้อมูล
router.post("/:id/payment", authMiddleware.authenticate, upload.single("slip"), async (req, res) => {
  try {
    const { id } = req.params
    const { amount, paymentDate, status, verificationResult } = req.body
    const { role, residentId } = req.user

    console.log("Received payment for bill ID:", id)
    console.log("Payment data:", { amount, paymentDate, status })

    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์สลิป" })
    }

    console.log("Uploaded file:", req.file)

    // ตรวจสอบว่าผู้ใช้เป็น resident หรือไม่
    if (role !== "RESIDENT" || !residentId) {
      return res.status(403).json({ error: "Only residents can make payments" })
    }

    // ดึงข้อมูลบิลตาม ID
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        resident: true,
      },
    })

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" })
    }

    // ตรวจสอบว่าบิลนี้เป็นของ resident ที่กำลังทำรายการหรือไม่
    if (bill.residentId !== residentId) {
      return res.status(403).json({ error: "You don't have permission to pay this bill" })
    }

    // กำหนดสถานะการชำระเงิน
    let paymentStatus = "PENDING"

    // ถ้ามีการระบุสถานะมา ให้ใช้สถานะนั้น
    if (status === "COMPLETED") {
      paymentStatus = "COMPLETED"
    }

    // ดึง default payment method (ถ้าไม่มีให้สร้างใหม่)
    let paymentMethod = await prisma.paymentMethod.findFirst({
      where: { name: "Bank Transfer" },
    })

    if (!paymentMethod) {
      paymentMethod = await prisma.paymentMethod.create({
        data: {
          name: "Bank Transfer",
          description: "โอนเงินผ่านธนาคาร",
          isActive: true,
        },
      })
    }

    // สร้างข้อมูลการชำระเงิน (รวมถึงบันทึก path ของไฟล์)
    const payment = await prisma.payment.create({
      data: {
        billId: id,
        paymentMethodId: paymentMethod.id,
        amount: Number.parseFloat(amount),
        paymentDate: new Date(paymentDate),
        status: paymentStatus,
        slipImagePath: req.file.path, // บันทึก path ของไฟล์
        verificationResult: verificationResult || null, // บันทึกผลการตรวจสอบ (ถ้ามี)
      },
    })

    // อัปเดตสถานะบิล
    let billStatus = bill.status
    if (paymentStatus === "COMPLETED") {
      billStatus = "PAID"
    } else if (paymentStatus === "PENDING") {
      billStatus = "PROCESSING" // เปลี่ยนสถานะเป็น "กำลังตรวจสอบ" เมื่อมีการอัปโหลดสลิป
    }

    await prisma.bill.update({
      where: { id },
      data: { status: billStatus },
    })

    // สร้าง URL สำหรับเข้าถึงไฟล์
    const apiUrl = process.env.API_URL || "http://localhost:5000"
    const slipUrl = `${apiUrl}/${req.file.path.replace(/\\/g, "/")}`

    return res.status(200).json({
      message: "บันทึกการชำระเงินสำเร็จ",
      payment,
      billStatus,
      slipPath: req.file.path,
      slipUrl: slipUrl,
    })
  } catch (error) {
    console.error("Error creating payment:", error)

    // ลบไฟล์ที่อัปโหลดในกรณีที่เกิดข้อผิดพลาด
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path)
        console.log("Deleted uploaded file due to error")
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }

    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน", details: error.message })
  }
})

module.exports = router

