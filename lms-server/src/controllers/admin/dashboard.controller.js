const Student = require('../../models/Student');
const User = require('../../models/User');
const Fee = require('../../models/FeeChallan');
const Attendance = require('../../models/Attendance');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            studentCount,
            teacherCount,
            pendingFeesResult,
            attendanceStats
        ] = await Promise.all([
            // 1. Total Active Students
            Student.countDocuments({ status: 'Active' }),

            // 2. Active Teachers
            User.countDocuments({ role: 'TEACHER', isActive: true }),

            // 3. Pending Fees Total Amount
            Fee.aggregate([
                { $match: { status: 'Pending' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            // 4. Today's Attendance Percentage
            Attendance.aggregate([
                { $match: { date: { $gte: today } } },
                {
                    $group: {
                        _id: null,
                        totalPresent: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                        totalRecords: { $sum: 1 }
                    }
                }
            ])
        ]);

        const pendingFees = pendingFeesResult.length > 0 ? pendingFeesResult[0].total : 0;

        let attendancePercentage = 0;
        if (attendanceStats.length > 0 && attendanceStats[0].totalRecords > 0) {
            attendancePercentage = Math.round((attendanceStats[0].totalPresent / attendanceStats[0].totalRecords) * 100);
        }

        res.json({
            students: studentCount,
            teachers: teacherCount,
            pendingFees,
            attendancePercentage
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Fees Analytics (For Donut Chart)
// @route   GET /api/admin/dashboard/fees-chart
exports.getFeesAnalytics = async (req, res) => {
    try {
        const stats = await Fee.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        // Transform into standardized format
        const result = {
            Paid: { count: 0, amount: 0 },
            Pending: { count: 0, amount: 0 },
            Overdue: { count: 0, amount: 0 }
        };

        stats.forEach(s => {
            if (result[s._id]) {
                result[s._id] = { count: s.count, amount: s.totalAmount };
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Fees Chart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Attendance Analytics (For Graph)
// @route   GET /api/admin/dashboard/attendance-chart?type=student|teacher&range=week|month|year
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const { type = 'student', range = 'week' } = req.query;
        const Model = type === 'teacher' ? require('../../models/TeacherAttendance') : Attendance;

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        if (range === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (range === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (range === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

        const pipeline = [
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
                    leave: { $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const data = await Model.aggregate(pipeline);
        res.json(data);
    } catch (error) {
        console.error('Attendance Chart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
