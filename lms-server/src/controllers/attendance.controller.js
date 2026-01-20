const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const TeacherAssignment = require('../models/TeacherAssignment');
const mongoose = require('mongoose');

// @desc    Mark Attendance (Bulk or Single)
// @route   POST /api/attendance
// @access  Teacher (Assigned) / Admin
exports.markAttendance = async (req, res) => {
    try {
        // records: [{ studentId, status, reason }]
        const { date, classId, sectionId, subjectId, records } = req.body;
        const attendedDate = new Date(date);
        attendedDate.setUTCHours(0, 0, 0, 0); // Normalize

        // 0. Check Freeze Status (Optimized: Check one existing record for this date/class)
        // Note: Ideally we store "Frozen" status in a separate "AttendanceDay" model, but here it's on the record.
        // We will check if ANY record for this day/class is frozen.
        const frozenCheck = await Attendance.findOne({
            date: attendedDate,
            classId,
            sectionId,
            isFrozen: true
        });

        if (frozenCheck && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Attendance for this date is frozen. Contact Admin.' });
        }

        // 1. Authorization: If Teacher, check assignment & Time Window
        if (req.user.role === 'TEACHER') {
            const hasAssignment = await TeacherAssignment.findOne({
                teacherId: req.user._id,
                classId,
                sectionId,
                subjectId, // if subject-wise
                active: true
            }).populate('timeSlotId');

            if (!hasAssignment) {
                return res.status(403).json({ message: 'You are not assigned to this class/subject' });
            }

            // Time Window Enforcement (15 Minutes)
            // Skip this if Admin or override provided (future feature)
            if (hasAssignment.timeSlotId) {
                const now = new Date();
                const currentDay = now.toLocaleString('en-US', { weekday: 'long' });

                // 1. Check Day
                if (hasAssignment.timeSlotId.day !== currentDay) {
                    return res.status(403).json({
                        message: `Not allowed. Class is scheduled for ${hasAssignment.timeSlotId.day}, today is ${currentDay}.`
                    });
                }

                // 2. Check Time (Start to Start + 15m)
                const [startH, startM] = hasAssignment.timeSlotId.startTime.split(':');
                const startWindow = new Date();
                startWindow.setHours(parseInt(startH), parseInt(startM), 0, 0);

                const endWindow = new Date(startWindow);
                endWindow.setMinutes(endWindow.getMinutes() + 15);

                // Allow marking slightly before? No, strict "not before start".
                // Allow marking if 'now' is within window.
                if (now < startWindow) {
                    return res.status(403).json({
                        message: `Too early. Attendance opens at ${hasAssignment.timeSlotId.startTime}.`
                    });
                }

                if (now > endWindow) {
                    return res.status(403).json({
                        message: `Attendance Closed. Allowed only within 15 mins of start (${hasAssignment.timeSlotId.startTime}).`
                    });
                }
            }
        }

        // 2. Process Records
        const ops = records.map(record => ({
            updateOne: {
                filter: {
                    date: attendedDate,
                    studentId: record.studentId,
                    subjectId // Optional
                },
                update: {
                    $set: {
                        classId,
                        sectionId,
                        status: record.status,
                        markedBy: req.user._id,
                        markedAt: new Date()
                        // Don't set isFrozen here, allows Admin to update frozen records without unfreezing explicitly? 
                        // Actually, if we are here, we passed the freeze check.
                    },
                    $push: {
                        history: {
                            status: record.status,
                            changedBy: req.user._id,
                            reason: record.reason || '',
                            timestamp: new Date()
                        }
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(ops);

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Freeze/Unfreeze Attendance
// @route   POST /api/attendance/freeze
// @access  Admin Only
exports.freezeAttendance = async (req, res) => {
    try {
        const { date, classId, sectionId, action } = req.body; // action: 'FREEZE' or 'UNFREEZE'
        const isFrozen = action === 'FREEZE';
        const qDate = new Date(date);
        qDate.setUTCHours(0, 0, 0, 0);

        await Attendance.updateMany(
            { date: qDate, classId, sectionId },
            { $set: { isFrozen } }
        );

        res.json({ message: `Attendance ${isFrozen ? 'Frozen' : 'Unfrozen'} Successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Attendance
// @route   GET /api/attendance
// @access  Teacher (Assigned) / Admin
exports.getAttendance = async (req, res) => {
    try {
        const { classId, sectionId, date, studentId } = req.query;

        const query = {};
        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;
        if (studentId) query.studentId = studentId;
        if (date) {
            const qDate = new Date(date);
            qDate.setUTCHours(0, 0, 0, 0);
            query.date = qDate;
        }

        const attendance = await Attendance.find(query)
            .populate('studentId', 'fullName registrationNumber')
            .populate('markedBy', 'fullName role')
            .sort({ date: -1 });

        res.json(attendance);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
