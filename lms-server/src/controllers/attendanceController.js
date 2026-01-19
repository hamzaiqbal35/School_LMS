const Attendance = require('../models/Attendance');

// @desc    Mark Attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    try {
        const { date, class: className, section, records } = req.body;

        // Check if duplicate exists
        const existing = await Attendance.findOne({ date, class: className, section });
        if (existing) {
            // Update existing? Or Error? Let's update for now so corrections can be made
            existing.records = records;
            existing.markedBy = req.user.id;
            await existing.save();
            return res.json(existing);
        }

        const attendance = await Attendance.create({
            date,
            class: className,
            section,
            records,
            markedBy: req.user.id,
            offlineCreatedAt: Date.now(), // Realtime online, so same as now
        });

        res.status(201).json(attendance);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Attendance
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const { date, class: className, section } = req.query;
        const query = {};
        if (date) query.date = date;
        if (className) query.class = className;
        if (section) query.section = section;

        const attendance = await Attendance.find(query);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    markAttendance,
    getAttendance,
};
