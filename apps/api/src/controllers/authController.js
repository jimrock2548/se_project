const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma');

// เข้าสู่ระบบ
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบว่ามีการส่งชื่อผู้ใช้และรหัสผ่านมาหรือไม่
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        resident: true,
        landlord: true,
      },
    });

    // ถ้าไม่พบผู้ใช้
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // สร้าง token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ส่งข้อมูลผู้ใช้และ token กลับไป
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        residentId: user.resident?.id || null,
        landlordId: user.landlord?.id || null,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// ออกจากระบบ
const logout = (req, res) => {
  // ในกรณีของ JWT เราไม่สามารถยกเลิก token ได้โดยตรง
  // แต่เราสามารถลบ token ที่เก็บไว้ฝั่ง client ได้
  // ในที่นี้เราจะส่งข้อความว่าออกจากระบบสำเร็จกลับไป
  res.json({ message: 'Logged out successfully' });
};

// ดึงข้อมูลเซสชันปัจจุบัน
const getSession = (req, res) => {
  // ข้อมูลผู้ใช้ถูกเก็บไว้ใน req.user โดย middleware authenticate
  res.json({ user: req.user });
};

module.exports = {
  login,
  logout,
  getSession
};