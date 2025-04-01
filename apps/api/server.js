const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const path = require("path")
const http = require("http")

// โหลดค่า environment variables
dotenv.config()

// Import routes
const authRoutes = require("./src/routes/authRoutes")
const userRoutes = require("./src/routes/userRoutes")
const roomRoutes = require("./src/routes/roomRoutes")
const setupRoutes = require("./src/routes/setupRoutes")
const announcementRoutes = require("./src/routes/announcementRoutes")
const reportRoutes = require("./src/routes/reportRoutes")
const meterRoutes = require("./src/routes/meterRoutes")
const meterReadingRoutes = require("./src/routes/meterReadingRoutes")
const billRoutes = require("./src/routes/billRoutes")
const utilityTypeRoutes = require("./src/routes/utilityTypeRoutes")
const slipRoutes = require("./src/routes/slipRoutes")
const chatRoutes = require("./src/routes/chatRoutes")

// สร้าง Express app
const app = express()
const PORT = process.env.PORT || 5000

// สร้าง HTTP server
const server = http.createServer(app)

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "./uploads")))
app.use("/images", express.static(path.join(__dirname, "./uploads/slips")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/setup", setupRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/meters", meterRoutes)
app.use("/api/meter-readings", meterReadingRoutes)
app.use("/api/bills", billRoutes)
app.use("/api/utility-types", utilityTypeRoutes)
app.use("/api/slip", slipRoutes)
app.use("/api/chat", chatRoutes)

// Test route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)

  // เริ่มต้น Socket.io หลังจากเซิร์ฟเวอร์เริ่มทำงาน
  try {
    const { initializeSocket } = require("./src/socket")
    initializeSocket(server)
    console.log("Socket.io initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Socket.io:", error.message)
  }
})

module.exports = app

