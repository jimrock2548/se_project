const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// เข้าสู่ระบบ
router.post('/login', authController.login);

// ออกจากระบบ
router.post('/logout', authenticate, authController.logout);

// ดึงข้อมูลเซสชันปัจจุบัน
router.get('/session', authenticate, authController.getSession);

module.exports = router;