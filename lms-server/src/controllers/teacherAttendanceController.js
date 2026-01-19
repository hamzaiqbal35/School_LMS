const TeacherAttendance = require('../models/TeacherAttendance');
const Substitution = require('../models/Substitution');
const Class = require('../models/Class');
const User = require('../models/User');

// Mark Attendance
exports.markAttendance = async (req, res) => {
    try {
        const { teacherId, date, status, remarks } = req.body;

        // Upster attendance
        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacherId, date: new Date(date) },
            { status, remarks },
            { new: true, upsert: true }
        );

        let affectedClasses = [];
        if (status === 'Absent' || status === 'Leave') {
            // Find day of week (e.g., 'Monday')
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

            // Find classes assigned to this teacher that have a schedule on this day
            affectedClasses = await Class.find({
                teacherId: teacherId,
                'schedule.day': dayOfWeek
            }).select('name section schedule');
        }

        res.json({ attendance, affectedClasses });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get Teacher Attendance History
exports.getAttendanceHistory = async (req, res) => {
    try {
        const history = await TeacherAttendance.find({ teacherId: req.params.teacherId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create Substitution
exports.createSubstitution = async (req, res) => {
    try {
        const { originalTeacherId, substituteTeacherId, classId, date, reason } = req.body;

        const substitution = new Substitution({
            originalTeacherId,
            substituteTeacherId,
            classId,
            date,
            reason
        });

        await substitution.save();
        res.status(201).json(substitution);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get Substitutions
exports.getSubstitutions = async (req, res) => {
    try {
        const subs = await Substitution.find()
            .populate('originalTeacherId', 'name')
            .populate('substituteTeacherId', 'name')
            .populate('classId', 'name');
        res.json(subs);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
