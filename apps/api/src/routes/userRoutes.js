const express = require("express")
const router = express.Router()
const prisma = require("../config/prisma")
const authMiddleware = require("../middleware/auth")
const bcrypt = require("bcrypt")

// ดึงข้อมูลโปรไฟล์ผู้ใช้
router.get("/profile", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId } = req.user

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้" })
    }

    // ลองดึงข้อมูลห้องแยกต่างหาก (ถ้ามี)
    let roomNumber = null
    try {
      const userRoom = await prisma.resident.findUnique({
        where: { userId: userId },
        include: { room: true },
      })

      if (userRoom && userRoom.room) {
        roomNumber = userRoom.room.roomNumber
      }
    } catch (roomError) {
      console.log("ไม่สามารถดึงข้อมูลห้องได้:", roomError)
    }

    // สร้างข้อมูลผู้ใช้ที่จะส่งกลับไปยังไคลเอนต์
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      roomNumber: roomNumber,
    }

    return res.status(200).json({ user: userData })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" })
  }
})

// อัปเดตข้อมูลโปรไฟล์ผู้ใช้
router.put("/profile", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId } = req.user
    const { username, email, fullName } = req.body

    console.log("Updating user profile:", { userId, username, email, fullName })

    // ตรวจสอบว่ามี username ซ้ำหรือไม่
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: {
            not: userId,
          },
        },
      })

      if (existingUser) {
        return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" })
      }
    }

    // ตรวจสอบว่ามีอีเมลซ้ำหรือไม่
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: {
            not: userId,
          },
        },
      })

      if (existingUser) {
        return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" })
      }
    }

    // สร้าง object สำหรับข้อมูลที่จะอัปเดต
    const updateData = {}

    // เพิ่มข้อมูลที่จะอัปเดตเฉพาะฟิลด์ที่มีค่า
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (fullName !== undefined) updateData.fullName = fullName

    console.log("Update data:", updateData)

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // ลองดึงข้อมูลห้องแยกต่างหาก (ถ้ามี)
    let roomNumber = null
    try {
      const userRoom = await prisma.resident.findUnique({
        where: { userId: userId },
        include: { room: true },
      })

      if (userRoom && userRoom.room) {
        roomNumber = userRoom.room.roomNumber
      }
    } catch (roomError) {
      console.log("ไม่สามารถดึงข้อมูลห้องได้:", roomError)
    }

    // สร้างข้อมูลผู้ใช้ที่จะส่งกลับไปยังไคลเอนต์
    const userData = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      roomNumber: roomNumber,
    }

    return res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ", user: userData })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้" })
  }
})

// เปลี่ยนรหัสผ่าน
router.put("/password", authMiddleware.authenticate, async (req, res) => {
  try {
    const { userId } = req.user
    const { currentPassword, newPassword } = req.body

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
    }

    // ตรวจสอบความยาวของรหัสผ่านใหม่
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" })
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" })
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" })
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // อัปเดตรหัสผ่าน
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    return res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" })
  } catch (error) {
    console.error("Error changing password:", error)
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" })
  }
})

module.exports = router

