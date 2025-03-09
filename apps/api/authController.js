const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// SECRET KEY สำหรับ JWT
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey"; // 🔐 แนะนำให้ใช้ไฟล์ .env

// 📌 [POST] สมัครสมาชิก (Register)
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  // ตรวจสอบว่ามี email นี้ในระบบแล้วหรือยัง
  const existingUser = await prisma.residents.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  // เข้ารหัสรหัสผ่านก่อนบันทึก
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.residents.create({
    data: {
      email,
      username,
      password: hashedPassword
    }
  });

  res.status(201).json({ message: "User registered successfully", userId: newUser.id }); // ✅ เปลี่ยนจาก roomId เป็น id
});

// 📌 [POST] ล็อกอิน
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier คือ email หรือ username ก็ได้

  // ค้นหาผู้ใช้จากฐานข้อมูล
  const user = await prisma.residents.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }]
    }
  });

  if (!user) return res.status(401).json({ message: "Invalid username/email or password" });

  // ตรวจสอบรหัสผ่าน
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid username/email or password" });

  // สร้าง JWT Token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" }); // ✅ เปลี่ยนจาก roomId เป็น id

  res.json({ token, username: user.username });
});

// 📌 [GET] ตรวจสอบข้อมูลผู้ใช้
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.residents.findUnique({ 
      where: { id: decoded.id },  // ✅ เปลี่ยนจาก roomId เป็น id
      select: { id: true, email: true, username: true } 
    });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
