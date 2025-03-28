const jwt = require("jsonwebtoken")
const authConfig = require("../config/auth")

// Middleware to authenticate requests
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, authConfig.jwtSecret)

    // Attach user info to request
    req.user = decoded

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" })
    }
    console.error("Authentication error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Middleware to check if user has required role
exports.authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles]
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to access this resource",
      })
    }
    next()
  }
}

