const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// @route   GET /api/students
// @desc    Get all students
router.get('/', studentController.getStudents);

// @route   POST /api/students
// @desc    Create student
router.post('/', studentController.createStudent);

// @route   GET /api/students/:id
// @desc    Get student details with fees and attendance
router.get('/:id', studentController.getStudentById);

// @route   PATCH /api/students/:id/status
// @desc    Update student status
router.patch('/:id/status', studentController.updateStudentStatus);

// @route   PATCH /api/students/:id/class
// @desc    Update student class
router.patch('/:id/class', studentController.updateStudentClass);

module.exports = router;
