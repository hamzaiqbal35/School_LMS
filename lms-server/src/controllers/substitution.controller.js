const Substitution = require('../models/Substitution');
const TeacherAttendance = require('../models/TeacherAttendance');
const TeacherAssignment = require('../models/TeacherAssignment');
const User = require('../models/User'); // Assuming User model has roles
const { format } = require('date-fns');

// Helper to get day name (e.g., 'Monday') from date
const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};

exports.getNeededSubstitutions = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const dayName = getDayName(date);

        // 1. Find Absent Teachers for the date
        const absentRecords = await TeacherAttendance.find({
            date: date,
            status: { $in: ['Absent', 'Leave'] }
        });

        if (absentRecords.length === 0) {
            return res.json([]);
        }

        const absentTeacherIds = absentRecords.map(r => r.teacherId);

        // 2. Find Assignments for these teachers
        // We need to populate timeSlot to filter by Day
        const assignments = await TeacherAssignment.find({
            teacherId: { $in: absentTeacherIds },
            active: true
        }).populate('timeSlotId')
            .populate('classId')
            .populate('sectionId')
            .populate('subjectId')
            .populate('teacherId', 'fullName email avatar');

        // 3. Filter assignments that match the current Day
        const relevantAssignments = assignments.filter(a =>
            a.timeSlotId && a.timeSlotId.day === dayName
        );

        // 4. Check for existing substitutions
        const substitutions = await Substitution.find({
            date: date
        }).populate('substituteTeacherId', 'fullName');

        // 5. Build Result
        const result = relevantAssignments.map(assignment => {
            const existingSub = substitutions.find(s =>
                s.classId.toString() === assignment.classId._id.toString() &&
                s.sectionId.toString() === assignment.sectionId._id.toString() &&
                s.timeSlotId.toString() === assignment.timeSlotId._id.toString()
            );

            return {
                assignmentId: assignment._id,
                class: assignment.classId,
                section: assignment.sectionId,
                subject: assignment.subjectId,
                timeSlot: assignment.timeSlotId, // Contains startTime/endTime
                originalTeacher: assignment.teacherId,
                substitution: existingSub ? existingSub : null,
                status: existingSub ? 'Covered' : 'Pending'
            };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAvailableTeachers = async (req, res) => {
    try {
        const { date, timeSlotId } = req.query;
        if (!date || !timeSlotId) return res.status(400).json({ message: 'Date and TimeSlotId required' });

        // 1. Get All Teachers
        const allTeachers = await User.find({ role: 'TEACHER' }).select('fullName email qualification avatar');

        // 2. Get Supervisors/Absent Teachers for that day
        const absentRecords = await TeacherAttendance.find({
            date: date,
            status: { $in: ['Absent', 'Leave'] }
        });
        const absentTeacherIds = absentRecords.map(r => r.teacherId.toString());

        // 3. Get Teachers BUSY in this slot (Regular Assignment)
        const busyAssignments = await TeacherAssignment.find({
            timeSlotId: timeSlotId,
            active: true
        }).populate('classId', 'name').populate('sectionId', 'name');
        const busyTeacherIds = busyAssignments.map(a => a.teacherId.toString());

        // 4. Get Teachers BUSY as Substitutes in this slot
        const busySubs = await Substitution.find({
            date: date,
            timeSlotId: timeSlotId
        });
        const busySubIds = busySubs.map(s => s.substituteTeacherId.toString());

        // 5. Build Response with Availability Status
        const teachersWithStatus = allTeachers.map(t => {
            const tid = t._id.toString();
            let isFree = true;
            let reason = 'Available';

            if (absentTeacherIds.includes(tid)) {
                isFree = false;
                reason = 'Absent';
            } else if (busySubIds.includes(tid)) {
                isFree = false;
                reason = 'Already Subbing';
            } else if (busyTeacherIds.includes(tid)) {
                isFree = false;
                const assignment = busyAssignments.find(a => a.teacherId.toString() === tid);
                reason = assignment ? `Teaching ${assignment.classId?.name}-${assignment.sectionId?.name}` : 'Has Class';
            }

            return {
                _id: t._id,
                fullName: t.fullName,
                qualification: t.qualification,
                isFree,
                reason
            };
        });

        // Sort: Free first, then by name
        // Filter: Only show free teachers
        const freeTeachers = teachersWithStatus.filter(t => t.isFree);

        // Sort by name
        freeTeachers.sort((a, b) => a.fullName.localeCompare(b.fullName));

        res.json(freeTeachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSubstitution = async (req, res) => {
    try {
        const {
            date,
            classId,
            sectionId,
            subjectId,
            timeSlotId,
            originalTeacherId,
            substituteTeacherId
        } = req.body;

        // Validation? 
        // Ensure sub is actually free? (Optional, but good safety)

        const substitution = new Substitution({
            date,
            classId,
            sectionId,
            subjectId,
            timeSlotId,
            originalTeacherId,
            substituteTeacherId,
            assignedBy: req.user._id
        });

        await substitution.save();
        res.status(201).json(substitution);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Substitution already exists for this slot' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteSubstitution = async (req, res) => {
    try {
        await Substitution.findByIdAndDelete(req.params.id);
        res.json({ message: 'Substitution removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
