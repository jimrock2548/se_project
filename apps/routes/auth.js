const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const authenticateUser = require("../middleware/auth");
require("dotenv").config();

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 📌 [POST] สมัครสมาชิก
router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  // ตรวจสอบว่ามี email นี้อยู่ในระบบหรือไม่
  const existingUser = await prisma.residents.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  // เข้ารหัสรหัสผ่านก่อนบันทึก
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.residents.create({
    data: { email, username, password: hashedPassword }
  });

  res.status(201).json({ message: "User registered successfully", userId: newUser.id });
});

// 📌 [POST] ล็อกอิน
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier คือ email หรือ username

  // ค้นหาผู้ใช้
  const user = await prisma.residents.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    select: { id: true, password: true }
  });

  if (!user) return res.status(401).json({ message: "Invalid username/email or password" });

  // ตรวจสอบรหัสผ่าน
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: "Invalid username/email or password" });

  // สร้าง Access Token และ Refresh Token
  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ accessToken, refreshToken });
});

// 📌 [POST] Refresh Token
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// 📌 [GET] ข้อมูลผู้ใช้ (ต้องใช้ Token)
router.get("/me", authenticateUser, async (req, res) => {
  const user = await prisma.residents.findUnique({ 
    where: { id: req.user.id }, 
    select: { id: true, email: true, username: true } 
  });
  res.json(user);
});

module.exports = router;
