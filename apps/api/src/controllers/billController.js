// ไฟล์นี้ยังไม่ต้องใช้ในตอนนี้ เก็บไว้สำหรับอนาคต
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// ดึงข้อมูลบิลทั้งหมด
exports.getAllBills = async (req, res) => {
  try {
    const { status, residentId } = req.query

    // สร้าง query condition
    const where = {}

    if (status) {
      where.status = status
    }

    if (residentId) {
      where.residentId = residentId
    }

    // ดึงข้อมูลบิล
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
                id: true,
                username: true,
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
        payments: true,
      },
    })

    return res.status(200).json({
      success: true,
      bills,
    })
  } catch (error) {
    console.error("Error getting bills:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล" })
  }
}

// ดึงข้อมูลบิลตาม ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params

    // ดึงข้อมูลบิล
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        resident: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
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
          include: {
            paymentMethod: true,
          },
        },
      },
    })

    if (!bill) {
      return res.status(404).json({ error: "ไม่พบบิลที่ระบุ" })
    }

    return res.status(200).json({
      success: true,
      bill,
    })
  } catch (error) {
    console.error("Error getting bill:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลบิล" })
  }
}

// สร้างบิลใหม่
exports.createBill = async (req, res) => {
  try {
    const { residentId, totalAmount, billingPeriodStart, billingPeriodEnd, dueDate, billItems } = req.body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!residentId || !totalAmount || !billingPeriodStart || !billingPeriodEnd || !dueDate || !billItems) {
      return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" })
    }

    // ตรวจสอบว่าผู้เช่ามีอยู่จริงหรือไม่
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
    })

    if (!resident) {
      return res.status(404).json({ error: "ไม่พบผู้เช่าที่ระบุ" })
    }

    // สร้างบิลใหม่
    const bill = await prisma.bill.create({
      data: {
        residentId,
        totalAmount: Number.parseFloat(totalAmount),
        billingPeriodStart: new Date(billingPeriodStart),
        billingPeriodEnd: new Date(billingPeriodEnd),
        dueDate: new Date(dueDate),
        status: "PENDING",
        billItems: {
          create: billItems.map((item) => ({
            utilityTypeId: item.utilityTypeId,
            amount: Number.parseFloat(item.amount),
            unitUsed: Number.parseFloat(item.unitUsed),
            rate: Number.parseFloat(item.rate),
            description: item.description,
          })),
        },
      },
      include: {
        resident: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
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
      success: true,
      bill,
    })
  } catch (error) {
    console.error("Error creating bill:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการสร้างบิล" })
  }
}

// อัปเดตสถานะบิล
exports.updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!status) {
      return res.status(400).json({ error: "กรุณาระบุสถานะ" })
    }

    // ตรวจสอบว่าบิลมีอยู่จริงหรือไม่
    const bill = await prisma.bill.findUnique({
      where: { id },
    })

    if (!bill) {
      return res.status(404).json({ error: "ไม่พบบิลที่ระบุ" })
    }

    // อัปเดตสถานะบิล
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: { status },
      include: {
        resident: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
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
      success: true,
      bill: updatedBill,
    })
  } catch (error) {
    console.error("Error updating bill status:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตสถานะบิล" })
  }
}

