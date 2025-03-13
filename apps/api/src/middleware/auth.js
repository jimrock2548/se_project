const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma');

// Middleware ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือไม่
const authenticate = async (req, res, next) => {
  try {
    // ดึง token จาก header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        resident: true,
        landlord: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // เก็บข้อมูลผู้ใช้ใน request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      residentId: user.resident?.id || null,
      landlordId: user.landlord?.id || null,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Middleware ตรวจสอบว่าผู้ใช้มีสิทธิ์เป็น LANDLORD หรือ ADMIN
const isLandlordOrAdmin = (req, res, next) => {
  if (req.user.role !== 'LANDLORD' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Forbidden: Only landlords and admins can access this resource' 
    });
  }
  next();
};

// Middleware ตรวจสอบว่าผู้ใช้มีสิทธิ์เป็น ADMIN
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Forbidden: Only admins can access this resource' 
    });
  }
  next();
};

module.exports = {
  authenticate,
  isLandlordOrAdmin,
  isAdmin
};