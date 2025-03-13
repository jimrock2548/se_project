const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, isLandlordOrAdmin } = require('../middleware/auth');

// ดึงข้อมูลห้องพักทั้งหมด
router.get('/', authenticate, roomController.getAllRooms);

// ดึงข้อมูลห้องพักตาม ID
router.get('/:id', authenticate, roomController.getRoomById);

// เพิ่มห้องพักใหม่ (เฉพาะเจ้าของหอพักและผู้ดูแลระบบ)
router.post('/', authenticate, isLandlordOrAdmin, roomController.createRoom);

// อัปเดตข้อมูลห้องพัก (เฉพาะเจ้าของหอพักและผู้ดูแลระบบ)
router.put('/:id', authenticate, isLandlordOrAdmin, roomController.updateRoom);

module.exports = router;