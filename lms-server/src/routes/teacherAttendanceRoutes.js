const express = require('express');
const router = express.Router();
const teacherAttendanceController = require('../controllers/teacherAttendanceController');

// @route   POST /api/teacher-attendance
// @desc    Mark teacher attendance
router.post('/', teacherAttendanceController.markAttendance);

// @route   GET /api/teacher-attendance/history/:teacherId
// @desc    Get attendance history for a teacher
router.get('/history/:teacherId', teacherAttendanceController.getAttendanceHistory);

// @route   POST /api/teacher-attendance/substitutions
// @desc    Create a substitution
router.post('/substitutions', teacherAttendanceController.createSubstitution);

// @route   GET /api/teacher-attendance/substitutions
// @desc    Get all substitutions
router.get('/substitutions', teacherAttendanceController.getSubstitutions);

// @route   GET /api/teacher-attendance/history/:teacherId
// @desc    Get attendance history for a teacher
router.get('/history/:teacherId', teacherAttendanceController.getAttendanceHistory);

module.exports = router;
