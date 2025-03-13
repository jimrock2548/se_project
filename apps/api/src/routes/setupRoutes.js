const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

// สร้างผู้ใช้แรก (First Admin)
router.post('/first-admin', setupController.createFirstAdmin);

module.exports = router;