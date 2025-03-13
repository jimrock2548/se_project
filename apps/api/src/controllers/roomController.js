const prisma = require('../services/prisma');

// ดึงข้อมูลห้องพักทั้งหมด
const getAllRooms = async (req, res) => {
  try {
    const { isActive, building, floor } = req.query;
    
    // สร้างเงื่อนไขการค้นหา
    const where = {};
    
    // กรองตามสถานะการใช้งาน
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    // กรองตามอาคาร
    if (building) {
      where.building = building;
    }
    
    // กรองตามชั้น
    if (floor) {
      where.floor = floor;
    }
    
    // ดึงข้อมูลห้องพัก
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
        },
        meters: {
          include: {
            utilityType: true,
          },
        },
      },
    });
    
    res.json(rooms);
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
};

// ดึงข้อมูลห้องพักตาม ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ดึงข้อมูลห้องพัก
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
        },
        meters: {
          include: {
            utilityType: true,
            meterReadings: {
              orderBy: {
                readingDate: 'desc',
              },
              take: 5,
            },
          },
        },
      },
    });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
};

// เพิ่มห้องพักใหม่
const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, building, roomSize, baseRent, isActive } = req.body;
    
    // ตรวจสอบว่ามีการส่งข้อมูลที่จำเป็นมาครบถ้วน
    if (!roomNumber || !floor || !baseRent) {
      return res.status(400).json({ error: 'Room number, floor, and base rent are required' });
    }
    
    // ตรวจสอบว่าหมายเลขห้องไม่ซ้ำกับที่มีอยู่แล้ว
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber },
    });
    
    if (existingRoom) {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    
    // สร้างห้องพักใหม่
    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        floor,
        building,
        roomSize: roomSize ? parseFloat(roomSize) : null,
        baseRent: parseFloat(baseRent),
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    
    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// อัปเดตข้อมูลห้องพัก
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, floor, building, roomSize, baseRent, isActive } = req.body;
    
    // ตรวจสอบว่ามีห้องพักที่ต้องการอัปเดต
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });
    
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // ตรวจสอบว่าหมายเลขห้องไม่ซ้ำกับห้องอื่น (ถ้ามีการเปลี่ยนหมายเลขห้อง)
    if (roomNumber && roomNumber !== existingRoom.roomNumber) {
      const roomWithSameNumber = await prisma.room.findUnique({
        where: { roomNumber },
      });
      
      if (roomWithSameNumber) {
        return res.status(400).json({ error: 'Room number already exists' });
      }
    }
    
    // สร้างออบเจ็กต์สำหรับอัปเดตข้อมูล
    const updateData = {};
    
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (floor) updateData.floor = floor;
    if (building !== undefined) updateData.building = building;
    if (roomSize !== undefined) updateData.roomSize = roomSize ? parseFloat(roomSize) : null;
    if (baseRent) updateData.baseRent = parseFloat(baseRent);
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // อัปเดตข้อมูลห้องพัก
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData,
    });
    
    res.json({
      message: 'Room updated successfully',
      room: updatedRoom,
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom
};