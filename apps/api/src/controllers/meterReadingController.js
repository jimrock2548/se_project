const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// ดึงข้อมูลการอ่านมิเตอร์ล่าสุดของห้อง
exports.getLatestMeterReadings = async (req, res) => {
  try {
    const { roomId } = req.params
    const { userId } = req.user // ได้จาก middleware auth

    // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return res.status(404).json({ error: "ไม่พบห้องที่ระบุ" })
    }

    // ดึงข้อมูลมิเตอร์ทั้งหมดของห้อง
    const meters = await prisma.meter.findMany({
      where: {
        roomId: roomId,
        isActive: true,
      },
      include: {
        utilityType: true,
      },
    })

    // สร้างอาร์เรย์เพื่อเก็บผลลัพธ์
    const results = []

    // ดึงข้อมูลการอ่านมิเตอร์ล่าสุดสำหรับแต่ละมิเตอร์
    for (const meter of meters) {
      const latestReading = await prisma.meterReading.findFirst({
        where: {
          meterId: meter.id,
        },
        orderBy: {
          readingDate: "desc",
        },
        include: {
          meter: {
            include: {
              utilityType: true,
            },
          },
        },
      })

      if (latestReading) {
        results.push({
          id: latestReading.id,
          meterId: latestReading.meterId,
          reading: latestReading.reading,
          readingDate: latestReading.readingDate,
          utilityType: meter.utilityType,
          meterNumber: meter.meterNumber,
        })
      } else {
        // ถ้าไม่มีข้อมูลการอ่านมิเตอร์ ให้ส่งข้อมูลว่างพร้อมกับข้อมูลมิเตอร์
        results.push({
          id: null,
          meterId: meter.id,
          reading: 0,
          readingDate: null,
          utilityType: meter.utilityType,
          meterNumber: meter.meterNumber,
        })
      }
    }

    return res.status(200).json({
      success: true,
      readings: results,
    })
  } catch (error) {
    console.error("Error getting meter readings:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลมิเตอร์" })
  }
}

// บันทึกการอ่านมิเตอร์ใหม่
exports.createMeterReading = async (req, res) => {
  try {
    const { meterId, reading, readingDate, note } = req.body
    const { userId } = req.user // ได้จาก middleware auth

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!meterId || reading === undefined) {
      return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" })
    }

    // ตรวจสอบว่ามิเตอร์มีอยู่จริงหรือไม่
    const meter = await prisma.meter.findUnique({
      where: {
        id: meterId,
        isActive: true,
      },
      include: {
        room: true,
        utilityType: true,
      },
    })

    if (!meter) {
      return res.status(404).json({ error: "ไม่พบมิเตอร์ที่ระบุ" })
    }

    // สร้างการอ่านมิเตอร์ใหม่
    const meterReading = await prisma.meterReading.create({
      data: {
        reading: Number.parseFloat(reading),
        readingDate: readingDate ? new Date(readingDate) : new Date(),
        note: note,
        meter: {
          connect: { id: meterId },
        },
        recordedBy: {
          connect: { id: userId },
        },
      },
      include: {
        meter: {
          include: {
            utilityType: true,
            room: true,
          },
        },
        recordedBy: true,
      },
    })

    return res.status(201).json({
      success: true,
      meterReading,
    })
  } catch (error) {
    console.error("Error creating meter reading:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลมิเตอร์" })
  }
}

// ดึงประวัติการอ่านมิเตอร์
exports.getMeterReadingHistory = async (req, res) => {
  try {
    const { meterId } = req.params
    const { limit } = req.query

    // ตรวจสอบว่ามิเตอร์มีอยู่จริงหรือไม่
    const meter = await prisma.meter.findUnique({
      where: {
        id: meterId,
        isActive: true,
      },
    })

    if (!meter) {
      return res.status(404).json({ error: "ไม่พบมิเตอร์ที่ระบุ" })
    }

    // ดึงประวัติการอ่านมิเตอร์
    const readings = await prisma.meterReading.findMany({
      where: {
        meterId: meterId,
      },
      orderBy: {
        readingDate: "desc",
      },
      take: limit ? Number.parseInt(limit) : undefined,
      include: {
        meter: {
          include: {
            utilityType: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      readings,
    })
  } catch (error) {
    console.error("Error getting meter reading history:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงประวัติข้อมูลมิเตอร์" })
  }
}

// ดึงข้อมูลมิเตอร์ทั้งหมดของห้อง
exports.getRoomMeters = async (req, res) => {
  try {
    const { roomId } = req.params

    // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return res.status(404).json({ error: "ไม่พบห้องที่ระบุ" })
    }

    // ดึงข้อมูลมิเตอร์ทั้งหมดของห้อง
    const meters = await prisma.meter.findMany({
      where: {
        roomId: roomId,
        isActive: true,
      },
      include: {
        utilityType: true,
      },
    })

    return res.status(200).json({
      success: true,
      meters,
    })
  } catch (error) {
    console.error("Error getting room meters:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลมิเตอร์" })
  }
}

