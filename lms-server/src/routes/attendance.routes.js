const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const attendanceController = require('../controllers/attendance.controller');

router.use(protect); // Both Admin and Teacher can access, logic inside handles granular perms

router.post('/', attendanceController.markAttendance);
router.get('/', attendanceController.getAttendance);

// Admin Only - Freeze
router.post('/freeze', adminOnly, attendanceController.freezeAttendance);

module.exports = router;
