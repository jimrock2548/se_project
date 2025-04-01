const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const prisma = require("../config/prisma")
const authConfig = require("../config/auth")

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }, // Allow login with email as well
        ],
      },
      include: {
        resident: true,
        landlord: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        residentId: user.resident?.id || null,
        landlordId: user.landlord?.id || null,
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn },
    )

    // Return user info and token
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        residentId: user.resident?.id || null,
        landlordId: user.landlord?.id || null,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    // User info is already attached to req by the auth middleware
    const { userId } = req.user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        resident: {
          select: {
            id: true,
            roomId: true,
            checkInDate: true,
            isActive: true,
          },
        },
        landlord: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Logout (optional, as JWT is stateless)
exports.logout = (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  return res.status(200).json({ message: "Logged out successfully" })
}

