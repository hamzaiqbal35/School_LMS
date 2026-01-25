const express = require('express');
const router = express.Router();
const { protect, adminOnly, teacherOnly } = require('../middlewares/auth'); // Assuming these middlewares exist
const teacherAttendanceController = require('../controllers/teacherAttendance.controller');

router.use(protect);

// GET History (Admin sees all, Teacher sees own)
router.get('/', teacherAttendanceController.getAttendance);

// POST Mark (Admin only usually, or maybe Teacher self-checkin if allowed)
router.post('/', adminOnly, teacherAttendanceController.markAttendance);

// GET Stats for Dashboard
router.get('/stats', teacherAttendanceController.getTeacherStats);

module.exports = router;
