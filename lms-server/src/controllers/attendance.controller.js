const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const TeacherAssignment = require('../models/TeacherAssignment');
const mongoose = require('mongoose');
const Substitution = require('../models/Substitution');

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
            let activeAssignment = null;

            // 1.1 Check for Substitution first
            // Create range for the entire day to ensure we catch the substitution regardless of time component
            // Adjusted to +/- 24 hours to handle any timezone offset mismatches (e.g. Local vs UTC)
            const startOfDay = new Date(attendedDate);
            startOfDay.setHours(startOfDay.getHours() - 24);

            const endOfDay = new Date(attendedDate);
            endOfDay.setHours(endOfDay.getHours() + 48); // Cover the day and next day buffer

            const substitution = await Substitution.findOne({
                date: { $gte: startOfDay, $lte: endOfDay },
                classId,
                sectionId,
                subjectId,
                status: 'Assigned'
            }).populate('timeSlotId');

            if (substitution) {
                // If substitution exists, ONLY the substitute teacher can mark
                if (substitution.substituteTeacherId.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        message: 'A substitution is assigned for this class today. Only the substitute teacher can mark attendance.'
                    });
                }
                activeAssignment = substitution;
            } else {
                // 1.2 No Substitution, check regular assignment
                // CRITICAL FIX: A teacher might have multiple assignments for the same class/subject on different days.
                // We must find the assignment that corresponds to the ATTENDANCE DATE's day.

                const dayName = attendedDate.toLocaleString('en-US', { weekday: 'long' });

                // Find all assignments for this teacher/class/subject
                const assignments = await TeacherAssignment.find({
                    teacherId: req.user._id,
                    classId,
                    sectionId,
                    subjectId, // if subject-wise
                    active: true
                }).populate('timeSlotId');

                // Filter for the one matching the day
                const hasAssignment = assignments.find(a => a.timeSlotId && a.timeSlotId.day === dayName);

                if (!hasAssignment) {
                    return res.status(403).json({
                        message: `You are not assigned to this class/subject on ${dayName}.`
                    });
                }
                activeAssignment = hasAssignment;
            }

            // Time Window Enforcement (15 Minutes)
            // Skip this if Admin or override provided (future feature)
            if (activeAssignment.timeSlotId) {
                const now = new Date();
                // We already matched the day above, so we don't need to re-check day mismatch "Mon vs Sun"
                // But we still check if we are *actually* on that day in real-time (for security, preventing attendance marking for next week?)
                // Actually attendedDate is passed by user. We should ensure attendedDate matches today if we enforce "Live" attendance.

                // For now, let's keep the time window check relative to the "now" time.

                const [startH, startM] = activeAssignment.timeSlotId.startTime.split(':');
                const startWindow = new Date();
                startWindow.setHours(parseInt(startH), parseInt(startM), 0, 0);

                const [endH, endM] = activeAssignment.timeSlotId.endTime.split(':');
                const endWindow = new Date(startWindow); // Use same date basis
                endWindow.setHours(parseInt(endH), parseInt(endM), 0, 0);

                // Helper function to format time in 12-hour AM/PM format
                const formatTime12Hour = (time24) => {
                    const [hours, minutes] = time24.split(':').map(Number);
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12;
                    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
                };

                // Format day and date for messages
                const dayName = attendedDate.toLocaleString('en-US', { weekday: 'long' });
                const formattedDate = attendedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                const startTimeFormatted = formatTime12Hour(activeAssignment.timeSlotId.startTime);
                const endTimeFormatted = formatTime12Hour(activeAssignment.timeSlotId.endTime);

                // Allow marking slightly before? No, strict "not before start".
                // Allow marking if 'now' is within window.
                if (now < startWindow) {
                    return res.status(403).json({
                        message: `Too early. Attendance for ${dayName}, ${formattedDate} opens at ${startTimeFormatted}.`
                    });
                }

                if (now > endWindow) {
                    return res.status(403).json({
                        message: `Attendance Closed for ${dayName}, ${formattedDate}. Allowed only between ${startTimeFormatted} and ${endTimeFormatted}.`
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
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .populate('markedBy', 'fullName role avatar')
            .sort({ date: -1 });

        res.json(attendance);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
