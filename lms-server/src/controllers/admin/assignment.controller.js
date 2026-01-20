const TeacherAssignment = require('../../models/TeacherAssignment');
const User = require('../../models/User');
const { Class, Section, Subject, TimeSlot } = require('../../models/ClassStructure'); // Need TimeSlot model for validation if strict

// @desc    Assign a teacher to a class/subject/slot
// @route   POST /api/admin/assignments
// @access  Admin
exports.createAssignment = async (req, res) => {
    try {
        const { teacherId, classId, sectionId, subjectId, timeSlotId } = req.body;

        // 1. Validate Teacher existence and role
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'TEACHER') {
            return res.status(400).json({ message: 'Invalid teacher ID' });
        }

        // 2. Validate TimeSlot (Optional but good)
        // const slot = await TimeSlot.findById(timeSlotId);
        // if(!slot) return res.status(400).json({message: 'Invalid Time Slot'});

        // 3. CLASH DETECTION

        // Check if Teacher is busy at this slot
        const teacherBusy = await TeacherAssignment.findOne({
            teacherId,
            timeSlotId,
            active: true
        }).populate('timeSlotId');

        if (teacherBusy) {
            return res.status(409).json({
                message: `Teacher is already assigned to another class at this time (${teacherBusy.timeSlotId?.name})`
            });
        }

        // Check if Class has a teacher for this slot already
        const classBusy = await TeacherAssignment.findOne({
            classId,
            sectionId,
            timeSlotId,
            active: true
        });

        if (classBusy) {
            return res.status(409).json({
                message: `Class already has a teacher assigned at this time slot`
            });
        }

        const assignment = await TeacherAssignment.create({
            teacherId,
            classId,
            sectionId,
            subjectId,
            timeSlotId,
            assignedBy: req.user._id
        });

        res.status(201).json(assignment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate assignment detected (DB constraint)' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all assignments (Optional filters)
// @desc    Get all assignments
// @route   GET /api/admin/assignments
exports.getAssignments = async (req, res) => {
    try {
        const { teacherId } = req.query;
        let query = {};
        if (teacherId) {
            query.teacherId = teacherId;
        }

        const assignments = await TeacherAssignment.find(query)
            .populate('teacherId', 'fullName email')
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .populate('subjectId', 'name code')
            .populate('timeSlotId', 'day startTime endTime label')
            .sort({ 'timeSlotId.day': 1, 'timeSlotId.startTime': 1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Deactivate an assignment
// @route   DELETE /api/admin/assignments/:id
// @access  Admin
exports.removeAssignment = async (req, res) => {
    try {
        const assignment = await TeacherAssignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Soft delete (or set active false)
        assignment.active = false;
        await assignment.save();

        res.json({ message: 'Assignment removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
