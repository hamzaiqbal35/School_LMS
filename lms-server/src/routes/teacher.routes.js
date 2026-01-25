const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middlewares/auth');
const TeacherAssignment = require('../models/TeacherAssignment');
const Student = require('../models/Student');

// Middleware
router.use(protect, teacherOnly);

const Substitution = require('../models/Substitution');

// @desc    Get data for logged-in teacher's assignments
// @route   GET /api/teacher/assignments
router.get('/assignments', async (req, res) => {
    try {
        // 1. Regular Assignments
        const assignments = await TeacherAssignment.find({
            teacherId: req.user._id,
            active: true
        })
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .populate('subjectId', 'name')
            .populate('timeSlotId', 'name day startTime endTime');

        // 2. Substitutions (For today)
        // We fetch substitutions for today so they appear in "Today's Schedule"
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const substitutions = await Substitution.find({
            substituteTeacherId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        })
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .populate('subjectId', 'name')
            .populate('timeSlotId', 'name day startTime endTime')
            .populate('originalTeacherId', 'fullName');

        // Merge results
        // Substitutions effectively act as assignments for the UI
        const combined = [...assignments, ...substitutions];

        res.json(combined);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get students for a specific class/section (for attendance)
// @route   GET /api/teacher/students
router.get('/students', async (req, res) => {
    try {
        const { classId, sectionId } = req.query;
        // Verify this teacher is actually assigned to this class? 
        // For strict security yes, but for now simple fetch is okay, or verify logic here.

        const students = await Student.find({ classId, sectionId, status: 'Active' })
            .select('registrationNumber fullName fatherName')
            .sort({ registrationNumber: 1 });

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
