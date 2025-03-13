const bcrypt = require('bcrypt');
const prisma = require('../services/prisma');

// สร้างผู้ใช้แรก (First Admin)
const createFirstAdmin = async (req, res) => {
  try {
    // ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
    const usersCount = await prisma.user.count();
    
    if (usersCount > 0) {
      return res.status(400).json({ error: "Cannot create first admin: Users already exist in the system" });
    }
    
    const { username, password, email, fullName, phone } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ error: "Username, password, email, and fullName are required" });
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // สร้างผู้ใช้ ADMIN คนแรก
    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        fullName,
        phone,
        role: "ADMIN",
      },
    });
    
    res.status(201).json({
      message: "First admin created successfully",
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create first admin error:", error);
    res.status(500).json({ error: "Failed to create first admin" });
  }
};

module.exports = {
  createFirstAdmin
};