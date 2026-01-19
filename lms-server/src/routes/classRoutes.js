const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// @route   GET /api/classes
// @desc    Get all classes
router.get('/', classController.getClasses);

// @route   POST /api/classes
// @desc    Create a new class
router.post('/', classController.createClass);

// @route   PUT /api/classes/:id/assign
// @desc    Assign/Update Class Teacher (Main Class Teacher)
router.put('/:id/assign', classController.assignTeacher);

// @route   POST /api/classes/:id/schedule
// @desc    Add period to schedule (with conflict check)
router.post('/:id/schedule', classController.addPeriod);

module.exports = router;
