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
