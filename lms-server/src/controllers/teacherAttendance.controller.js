const TeacherAttendance = require('../models/TeacherAttendance');
const User = require('../models/User');

// @desc    Mark Teacher Attendance
// @route   POST /api/teacher-attendance
// @access  Admin Only
exports.markAttendance = async (req, res) => {
    try {
        const { date, records } = req.body; // records: [{ teacherId, status, reason }]
        const attendedDate = new Date(date);
        attendedDate.setUTCHours(0, 0, 0, 0);

        const ops = records.map(record => ({
            updateOne: {
                filter: {
                    date: attendedDate,
                    teacherId: record.teacherId
                },
                update: {
                    $set: {
                        status: record.status,
                        markedBy: req.user._id,
                        markedAt: new Date(),
                        reason: record.reason
                    },
                    $push: {
                        history: {
                            status: record.status,
                            changedBy: req.user._id,
                            reason: record.reason,
                            timestamp: new Date()
                        }
                    }
                },
                upsert: true
            }
        }));

        await TeacherAttendance.bulkWrite(ops);
        res.json({ message: 'Teacher Attendance Marked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Teacher Attendance
// @route   GET /api/teacher-attendance
// @access  Admin / Teacher (Own history)
exports.getAttendance = async (req, res) => {
    try {
        const { date, teacherId, month } = req.query;
        const query = {};

        if (teacherId) query.teacherId = teacherId;

        // Single Date
        if (date) {
            const qDate = new Date(date);
            qDate.setUTCHours(0, 0, 0, 0);
            query.date = qDate;
        }

        // Month Range (e.g. 2026-01)
        if (month) {
            const [y, m] = month.split('-');
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = new Date(Date.UTC(y, m, 0));
            query.date = { $gte: start, $lte: end };
        }

        // If Teacher requesting, enforce own ID
        if (req.user.role === 'TEACHER') {
            query.teacherId = req.user._id;
        }

        const attendance = await TeacherAttendance.find(query)
            .populate('teacherId', 'fullName email phoneNumber')
            .populate('markedBy', 'fullName') // Who marked it
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get Teacher Stats (Donut Chart & Today's Status)
// @route   GET /api/teacher-attendance/stats
exports.getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        // 1. Attendance Stats (Present vs Absent/Leave/Late) for this month
        const attendanceRecords = await TeacherAttendance.find({
            teacherId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        let present = 0;
        let absent = 0;
        let leave = 0;
        let late = 0;

        attendanceRecords.forEach(r => {
            if (r.status === 'Present') present++;
            else if (r.status === 'Absent') absent++;
            else if (r.status === 'Leave') leave++;
            else if (r.status === 'Late') late++;
        });

        // 2. Substitution Stats (Count where I was result of substitution)
        // actually user asked: "how many he miss and how many he take of other (substitution)"
        // "miss" is covered by Absent/Leave above.
        // "take of other" is being the substituteTeacher.

        const Substitution = require('../models/Substitution');
        const substitutionCount = await Substitution.countDocuments({
            substituteTeacherId: teacherId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: 'Cancelled' }
        });

        // 3. Today's Status
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0); // Match markAttendance storing UTC midnight
        const todayRecord = await TeacherAttendance.findOne({
            teacherId,
            date: todayStart
        });

        res.json({
            stats: {
                present,
                absent,
                leave,
                late,
                substitutions: substitutionCount
            },
            todayStatus: todayRecord ? todayRecord.status : 'Not Marked'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
