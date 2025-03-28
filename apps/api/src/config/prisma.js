const { PrismaClient } = require("@prisma/client")

// Create a singleton instance of PrismaClient
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

module.exports = prisma

