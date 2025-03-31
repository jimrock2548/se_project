const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

// Load environment variables
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
// ถ้าคุณต้องการใช้ utilityTypeRoutes ให้ uncomment บรรทัดด้านล่าง
// const utilityTypeRoutes = require("./src/routes/utilityTypeRoutes")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/setup", setupRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/meters", meterRoutes)
app.use("/api/meter-readings", meterReadingRoutes)
app.use("/api/bills", billRoutes)
// ถ้าคุณต้องการใช้ utilityTypeRoutes ให้ uncomment บรรทัดด้านล่าง
// app.use("/api/utility-types", utilityTypeRoutes)

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dormitory Management API" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app // For testing

