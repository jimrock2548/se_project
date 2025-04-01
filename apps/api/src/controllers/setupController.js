const bcrypt = require("bcrypt")
const prisma = require("../config/prisma")
const authConfig = require("../config/auth")

// Create first landlord user
exports.createFirstLandlord = async (req, res) => {
  try {
    // Check if any user exists
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      return res.status(400).json({ error: "Cannot create first landlord: users already exist in the system" })
    }

    const { username, email, password, fullName, phone } = req.body

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: "Username, email, password, and fullName are required" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds)

    // Create landlord user with transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          phone,
          role: "LANDLORD",
        },
      })

      // Create landlord record
      await prisma.landlord.create({
        data: {
          userId: newUser.id,
        },
      })

      return newUser
    })

    return res.status(201).json({
      message: "First landlord user created successfully",
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
      },
    })
  } catch (error) {
    console.error("Create first landlord error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Initialize utility types
exports.initializeUtilityTypes = async (req, res) => {
  try {
    // Check if utility types already exist
    const utilityTypeCount = await prisma.utilityType.count()

    if (utilityTypeCount > 0) {
      return res.status(400).json({ error: "Utility types already exist in the system" })
    }

    // Create default utility types
    const utilityTypes = await prisma.$transaction([
      prisma.utilityType.create({
        data: {
          name: "Electricity",
          unit: "kWh",
          isActive: true,
          utilityRates: {
            create: {
              rate: 4.0,
              effectiveDate: new Date(),
              isActive: true,
            },
          },
        },
      }),
      prisma.utilityType.create({
        data: {
          name: "Water",
          unit: "cubic meter",
          isActive: true,
          utilityRates: {
            create: {
              rate: 18.0,
              effectiveDate: new Date(),
              isActive: true,
            },
          },
        },
      }),
      prisma.utilityType.create({
        data: {
          name: "Internet",
          unit: "package",
          isActive: true,
          utilityRates: {
            create: {
              rate: 500.0,
              effectiveDate: new Date(),
              isActive: true,
            },
          },
        },
      }),
    ])

    return res.status(201).json({
      message: "Utility types initialized successfully",
      utilityTypes,
    })
  } catch (error) {
    console.error("Initialize utility types error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Initialize payment methods
exports.initializePaymentMethods = async (req, res) => {
  try {
    // Check if payment methods already exist
    const paymentMethodCount = await prisma.paymentMethod.count()

    if (paymentMethodCount > 0) {
      return res.status(400).json({ error: "Payment methods already exist in the system" })
    }

    // Create default payment methods
    const paymentMethods = await prisma.$transaction([
      prisma.paymentMethod.create({
        data: {
          name: "Cash",
          description: "Cash payment at office",
          isActive: true,
        },
      }),
      prisma.paymentMethod.create({
        data: {
          name: "Bank Transfer",
          description: "Transfer to dormitory bank account",
          isActive: true,
        },
      }),
      prisma.paymentMethod.create({
        data: {
          name: "QR Payment",
          description: "Payment via QR code",
          isActive: true,
        },
      }),
    ])

    return res.status(201).json({
      message: "Payment methods initialized successfully",
      paymentMethods,
    })
  } catch (error) {
    console.error("Initialize payment methods error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

