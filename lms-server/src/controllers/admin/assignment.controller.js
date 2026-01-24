const TeacherAssignment = require('../../models/TeacherAssignment');
const User = require('../../models/User');
const { Class, Section, Subject, TimeSlot } = require('../../models/ClassStructure'); // Need TimeSlot model for validation if strict

// @desc    Assign a teacher to a class/subject/slot
// @route   POST /api/admin/assignments
// @access  Admin
exports.createAssignment = async (req, res) => {
    try {
        const { teacherId, classId, sectionId, subjectId, timeSlotId, timeSlotIds } = req.body;

        // 1. Validate Teacher
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'TEACHER') {
            return res.status(400).json({ message: 'Invalid teacher ID' });
        }

        // Normalize timeSlotIds
        // Support both single 'timeSlotId' (legacy/single) and 'timeSlotIds' (bulk)
        let slotsToProcess = [];
        if (timeSlotIds && Array.isArray(timeSlotIds)) {
            slotsToProcess = timeSlotIds;
        } else if (timeSlotId) {
            slotsToProcess = [timeSlotId];
        }

        if (slotsToProcess.length === 0) {
            return res.status(400).json({ message: 'No time slot selected' });
        }

        const createdAssignments = [];
        const errors = [];

        // Process each slot
        for (const slotId of slotsToProcess) {
            // Check Teacher Clash
            const teacherBusy = await TeacherAssignment.findOne({
                teacherId,
                timeSlotId: slotId,
                active: true
            }).populate('timeSlotId');

            if (teacherBusy) {
                errors.push(`Teacher busy at ${teacherBusy.timeSlotId?.name || 'slot'}`);
                continue;
            }

            // Check Class Clash
            const classBusy = await TeacherAssignment.findOne({
                classId,
                sectionId,
                timeSlotId: slotId,
                active: true
            }).populate('timeSlotId');

            if (classBusy) {
                // If it's the SAME subject and SAME teacher, maybe we don't need to error, but for now assume strict uniqueness
                errors.push(`Class already occupied at slot ${classBusy.timeSlotId?.name || slotId}`);
                continue;
            }

            // Create
            try {
                const assignment = await TeacherAssignment.create({
                    teacherId,
                    classId,
                    sectionId,
                    subjectId,
                    timeSlotId: slotId,
                    assignedBy: req.user._id
                });
                createdAssignments.push(assignment);
            } catch (err) {
                if (err.code === 11000) {
                    errors.push(`Duplicate assignment for slot ${slotId}`);
                } else {
                    errors.push(`Error assigning slot ${slotId}`);
                }
            }
        }

        if (createdAssignments.length === 0 && errors.length > 0) {
            return res.status(409).json({ message: errors.join(', ') });
        }

        res.status(201).json({
            message: `Created ${createdAssignments.length} assignments`,
            assignments: createdAssignments,
            warnings: errors
        });

    } catch (error) {
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
        let query = { active: true };
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
