const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Public (should be protected in real app)
router.get('/', teacherController.getTeachers);

// @route   POST /api/teachers
// @desc    Create a new teacher
router.post('/', teacherController.createTeacher);

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
router.get('/:id', teacherController.getTeacherById);

// @route   PUT /api/teachers/:id
// @desc    Update teacher
router.put('/:id', teacherController.updateTeacher);

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
