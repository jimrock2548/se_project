const prisma = require("../config/prisma")

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { isActive, building, floor } = req.query

    // Build filter conditions
    const where = {}

    if (isActive !== undefined) {
      where.isActive = isActive === "true"
    }

    if (building) {
      where.building = building
    }

    if (floor) {
      where.floor = floor
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        residents: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
        meters: {
          where: {
            isActive: true,
          },
          include: {
            utilityType: true,
          },
        },
      },
    })

    return res.status(200).json({ rooms })
  } catch (error) {
    console.error("Get all rooms error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        residents: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
        meters: {
          where: {
            isActive: true,
          },
          include: {
            utilityType: true,
            meterReadings: {
              orderBy: {
                readingDate: "desc",
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    return res.status(200).json({ room })
  } catch (error) {
    console.error("Get room by ID error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, building, roomSize, baseRent, isActive } = req.body

    // Validate required fields
    if (!roomNumber || !floor || baseRent === undefined) {
      return res.status(400).json({ error: "Room number, floor, and base rent are required" })
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findFirst({
      where: { roomNumber },
    })

    if (existingRoom) {
      return res.status(400).json({ error: "Room number already exists" })
    }

    // Create room
    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        floor,
        building,
        roomSize: roomSize ? Number.parseFloat(roomSize) : null,
        baseRent: Number.parseFloat(baseRent),
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    })
  } catch (error) {
    console.error("Create room error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params
    const { roomNumber, floor, building, roomSize, baseRent, isActive } = req.body

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Check if room number is already used by another room
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          roomNumber,
          id: { not: id },
        },
      })

      if (existingRoom) {
        return res.status(400).json({ error: "Room number already in use by another room" })
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        roomNumber: roomNumber || room.roomNumber,
        floor: floor || room.floor,
        building: building !== undefined ? building : room.building,
        roomSize: roomSize !== undefined ? Number.parseFloat(roomSize) : room.roomSize,
        baseRent: baseRent !== undefined ? Number.parseFloat(baseRent) : room.baseRent,
        isActive: isActive !== undefined ? isActive : room.isActive,
      },
    })

    return res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
    })
  } catch (error) {
    console.error("Update room error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        residents: {
          where: {
            isActive: true,
          },
        },
      },
    })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    // Check if room has active residents
    if (room.residents.length > 0) {
      return res.status(400).json({ error: "Cannot delete room with active residents" })
    }

    // Delete room
    await prisma.room.delete({
      where: { id },
    })

    return res.status(200).json({
      message: "Room deleted successfully",
    })
  } catch (error) {
    console.error("Delete room error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

