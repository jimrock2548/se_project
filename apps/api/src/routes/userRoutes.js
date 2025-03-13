const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isLandlordOrAdmin } = require('../middleware/auth');

// ลงทะเบียนผู้ใช้ใหม่ (เฉพาะเจ้าของหอพักและผู้ดูแลระบบ)
router.post('/register', authenticate, isLandlordOrAdmin, userController.register);

// เปลี่ยนรหัสผ่าน
router.post('/change-password', authenticate, userController.changePassword);

// อัปเดตข้อมูลส่วนตัว
router.put('/update-profile', authenticate, userController.updateProfile);

module.exports = router;