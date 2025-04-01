const express = require("express")
const router = express.Router()
const axios = require("axios")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const FormData = require("form-data")
const authMiddleware = require("../middleware/auth")

// กำหนดที่เก็บไฟล์ชั่วคราว
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../uploads/temp")

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
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

// API สำหรับตรวจสอบสลิปผ่าน SlipOK API
router.post("/verify", authMiddleware.authenticate, upload.single("file"), (req, res) => {
  console.log("Received slip verification request")

  // ตรวจสอบว่ามีไฟล์หรือไม่
  if (!req.file) {
    console.log("No file uploaded")
    return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์สลิป" })
  }

  console.log("File uploaded:", req.file.path)

  try {
    // สร้าง FormData สำหรับส่งไปยัง SlipOK API
    const formData = new FormData()

    // อ่านไฟล์และเพิ่มลงใน FormData
    const fileBuffer = fs.readFileSync(req.file.path)
    console.log("File size:", fileBuffer.length, "bytes")

    // เปลี่ยนชื่อพารามิเตอร์จาก "file" เป็น "files" ตามที่ SlipOK API ต้องการ
    formData.append("files", fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    // เรียกใช้ SlipOK API
    const slipokApiKey = process.env.SLIPOK_API_KEY || "SLIPOK33I5EGK"
    const slipokApiUrl = "https://api.slipok.com/api/line/apikey/42375"

    console.log("Sending request to SlipOK API:", slipokApiUrl)
    console.log("Using API key:", slipokApiKey)

    axios
      .post(slipokApiUrl, formData, {
        headers: {
          "x-authorization": slipokApiKey,
          ...formData.getHeaders(), // ใช้ headers จาก form-data
        },
      })
      .then((response) => {
        console.log("SlipOK API response:", response.data)

        // ลบไฟล์ชั่วคราวหลังจากใช้งานเสร็จ
        fs.unlinkSync(req.file.path)
        console.log("Temporary file deleted")

        // ส่งผลลัพธ์กลับไปยังไคลเอนต์
        return res.status(200).json(response.data)
      })
      .catch((error) => {
        console.error("Error calling SlipOK API:", error.message)

        if (error.response) {
          console.error("SlipOK API response status:", error.response.status)
          console.error("SlipOK API response data:", error.response.data)
        }

        // ลบไฟล์ชั่วคราวในกรณีที่เกิดข้อผิดพลาด
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
          console.log("Temporary file deleted after error")
        }

        return res.status(500).json({
          error: "เกิดข้อผิดพลาดในการตรวจสอบสลิป",
          details: error.message,
        })
      })
  } catch (error) {
    console.error("Error in slip verification process:", error)

    // ลบไฟล์ชั่วคราวในกรณีที่เกิดข้อผิดพลาด
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path)
        console.log("Temporary file deleted after error")
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError)
      }
    }

    return res.status(500).json({
      error: "เกิดข้อผิดพลาดในการประมวลผลสลิป",
      details: error.message,
    })
  }
})

// เพิ่ม route ทดสอบง่ายๆ
router.get("/test", (req, res) => {
  return res.status(200).json({ message: "SlipOK API route is working" })
})

module.exports = router

