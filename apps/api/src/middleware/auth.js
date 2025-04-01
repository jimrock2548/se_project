const jwt = require("jsonwebtoken")
const prisma = require("../config/prisma")

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }

    // If user is a resident, add residentId to request
    if (user.role === "RESIDENT") {
      const resident = await prisma.resident.findFirst({
        where: { userId: user.id, isActive: true },
      })

      if (resident) {
        req.user.residentId = resident.id
      }
    }

    // If user is a landlord, add landlordId to request
    if (user.role === "LANDLORD") {
      const landlord = await prisma.landlord.findFirst({
        where: { userId: user.id },
      })

      if (landlord) {
        req.user.landlordId = landlord.id
      }
    }

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(401).json({ error: "Invalid token" })
  }
}

// Middleware to authorize user roles
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" })
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
}

