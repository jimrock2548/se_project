const express = require("express");
const cors = require("cors");
const authRoutes = require("./authController");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อม API ล็อกอิน
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
