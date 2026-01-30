const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const TeacherAssignment = require('../models/TeacherAssignment');
const mongoose = require('mongoose');
const Substitution = require('../models/Substitution');

// @desc    Mark Attendance (Bulk or Single) - FIRST PERIOD ONLY
// @route   POST /api/attendance
// @access  Teacher (Assigned) / Admin
// NOTE: Attendance is daily, not subject-wise. First teacher to mark locks it for the day.
exports.markAttendance = async (req, res) => {
    try {
        // records: [{ studentId, status, reason }]
        const { date, classId, sectionId, records } = req.body;
        const attendedDate = new Date(date);
        attendedDate.setUTCHours(0, 0, 0, 0); // Normalize

        // 0. Check Freeze Status
        const frozenCheck = await Attendance.findOne({
            date: attendedDate,
            classId,
            sectionId,
            isFrozen: true
        });

        if (frozenCheck && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Attendance for this date is frozen. Contact Admin.' });
        }

        // 1. Check if attendance already marked for this class/section/date
        // First period teacher marks it, then it's locked for other teachers
        const existingAttendance = await Attendance.findOne({
            date: attendedDate,
            classId,
            sectionId
        });

        if (existingAttendance && req.user.role !== 'ADMIN') {
            // Attendance already marked by first period teacher
            return res.status(403).json({
                message: 'Attendance for this class has already been marked today by the first period teacher.'
            });
        }

        // 2. Authorization: If Teacher, check they have an assignment for this class today
        if (req.user.role === 'TEACHER') {
            const dayName = attendedDate.toLocaleString('en-US', { weekday: 'long' });

            // Check for substitution first
            const startOfDay = new Date(attendedDate);
            startOfDay.setHours(startOfDay.getHours() - 24);
            const endOfDay = new Date(attendedDate);
            endOfDay.setHours(endOfDay.getHours() + 48);

            const substitution = await Substitution.findOne({
                date: { $gte: startOfDay, $lte: endOfDay },
                classId,
                sectionId,
                status: 'Assigned'
            }).populate('timeSlotId');

            let hasAccess = false;

            if (substitution && substitution.substituteTeacherId.toString() === req.user._id.toString()) {
                hasAccess = true;
            }

            if (!hasAccess) {
                // Check regular assignment - teacher must have ANY assignment for this class/section on this day
                const assignments = await TeacherAssignment.find({
                    teacherId: req.user._id,
                    classId,
                    sectionId,
                    active: true
                }).populate('timeSlotId');

                // Find valid assignment for the day
                const todayAssignments = assignments.filter(a => a.timeSlotId && a.timeSlotId.day === dayName);

                if (todayAssignments.length > 0) {
                    hasAccess = true;

                    // Logic: If multiple assignments (e.g. 9am and 2pm), pick the one that is "current" or "upcoming"
                    // to avoid showing "Closed" for the 9am one when it's 1:55pm for the 2pm one.
                    // We'll prioritize an assignment where we are NOT "Too late" i.e. now <= endWindow (+buffer if needed)

                    let targetAssignment = todayAssignments[0]; // Default to first matches

                    // Try to find a better match (Currently active or upcoming)
                    const now = new Date();
                    for (const assign of todayAssignments) {
                        const [endH, endM] = assign.timeSlotId.endTime.split(':').map(Number);
                        const endWindow = new Date();
                        endWindow.setHours(endH, endM, 0, 0);

                        // If we are NOT past this class's end time, this is a better candidate to check against
                        // (It will either be Valid or "Too Early", but not "Closed")
                        if (now <= endWindow) {
                            targetAssignment = assign;
                            break; // specific priority: first one that hasn't finished yet
                        }
                    }

                    // Time Window Enforcement on the target assignment
                    const [startH, startM] = targetAssignment.timeSlotId.startTime.split(':').map(Number);
                    const [endH, endM] = targetAssignment.timeSlotId.endTime.split(':').map(Number);

                    const startWindow = new Date();
                    startWindow.setHours(startH, startM, 0, 0);
                    const endWindow = new Date();
                    endWindow.setHours(endH, endM, 0, 0);

                    // Helper function to format time in 12-hour AM/PM format
                    const formatTime12Hour = (time24) => {
                        const [hours, minutes] = time24.split(':').map(Number);
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const hours12 = hours % 12 || 12;
                        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
                    };

                    const formattedDate = attendedDate.toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });

                    if (now < startWindow) {
                        return res.status(403).json({
                            message: `Too early. Attendance for ${dayName}, ${formattedDate} opens at ${formatTime12Hour(targetAssignment.timeSlotId.startTime)}.`
                        });
                    }

                    if (now > endWindow) {
                        return res.status(403).json({
                            message: `Attendance Closed for ${dayName}, ${formattedDate}. Window was ${formatTime12Hour(targetAssignment.timeSlotId.startTime)} - ${formatTime12Hour(targetAssignment.timeSlotId.endTime)}.`
                        });
                    }
                }
            }

            if (!hasAccess) {
                return res.status(403).json({
                    message: `You are not assigned to this class on ${dayName}.`
                });
            }
        }

        // 3. Process Records - Daily attendance (no subjectId)
        const ops = records.map(record => ({
            updateOne: {
                filter: {
                    date: attendedDate,
                    studentId: record.studentId
                },
                update: {
                    $set: {
                        classId,
                        sectionId,
                        status: record.status,
                        markedBy: req.user._id,
                        markedAt: new Date()
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

        res.json({ message: 'Attendance marked successfully for the day' });
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
        const { classId, sectionId, date, studentId, month, year } = req.query;

        const query = {};
        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;
        if (studentId) query.studentId = studentId;
        if (date) {
            const qDate = new Date(date);
            qDate.setUTCHours(0, 0, 0, 0);
            query.date = qDate;
        } else if (month && year) {
            // Construct date range for the month in UTC
            // month is 1-12
            const start = new Date(Date.UTC(year, month - 1, 1));
            const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            query.date = { $gte: start, $lte: end };
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
