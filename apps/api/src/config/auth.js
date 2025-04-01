// Authentication configuration
module.exports = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiresIn: "24h",
  bcryptSaltRounds: 10,
}

