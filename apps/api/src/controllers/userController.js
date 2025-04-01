const bcrypt = require("bcrypt")
const prisma = require("../config/prisma")
const authConfig = require("../config/auth")

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error("Get all users error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        resident: {
          select: {
            id: true,
            roomId: true,
            checkInDate: true,
            checkOutDate: true,
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
    console.error("Get user by ID error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role, roomId, checkInDate } = req.body

    // Validate required fields
    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ error: "Username, email, password, fullName, and role are required" })
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds)

    // Create user with transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          phone,
          role,
        },
      })

      // If role is RESIDENT, create resident record
      if (role === "RESIDENT" && roomId) {
        await prisma.resident.create({
          data: {
            userId: newUser.id,
            roomId,
            checkInDate: new Date(checkInDate || Date.now()),
            isActive: true,
          },
        })
      }

      // If role is LANDLORD, create landlord record
      if (role === "LANDLORD") {
        await prisma.landlord.create({
          data: {
            userId: newUser.id,
          },
        })
      }

      return newUser
    })

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, email, phone } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if email is already used by another user
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (existingUser) {
        return res.status(400).json({ error: "Email already in use by another user" })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName || user.fullName,
        email: email || user.email,
        phone: phone || user.phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    })

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds)

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    return res.status(200).json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

