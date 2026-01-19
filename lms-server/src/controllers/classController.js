const Class = require('../models/Class');
const User = require('../models/User');

// Create Class
exports.createClass = async (req, res) => {
    try {
        const { name, teacherId, schedule } = req.body;

        const newClass = new Class({
            name,
            teacherId,
            schedule
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get All Classes
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('teacherId', 'name email');
        res.json(classes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Assign/Update Class Teacher
exports.assignTeacher = async (req, res) => {
    try {
        const { teacherId } = req.body;
        const clazz = await Class.findByIdAndUpdate(
            req.params.id,
            { $set: { teacherId } },
            { new: true }
        );
        res.json(clazz);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Add Period to Schedule (with Conflict Detection)
exports.addPeriod = async (req, res) => {
    try {
        const { day, subject, startTime, endTime, teacherId } = req.body;
        const classId = req.params.id;

        // 1. Check Class Availability
        const classDoc = await Class.findById(classId);
        if (!classDoc) return res.status(404).json({ message: 'Class not found' });

        const daySchedule = classDoc.schedule.find(s => s.day === day);
        if (daySchedule) {
            const classConflict = daySchedule.periods.some(p =>
                isTimeOverlap(p.startTime, p.endTime, startTime, endTime)
            );
            if (classConflict) {
                return res.status(409).json({ message: `Class ${classDoc.name} is already occupied at this time.` });
            }
        }

        // 2. Check Teacher Availability
        if (teacherId) {
            const classes = await Class.find({
                'schedule.day': day,
                'schedule.periods.teacherId': teacherId
            });

            for (const cls of classes) {
                const daySched = cls.schedule.find(s => s.day === day);
                const teacherConflict = daySched.periods.some(p =>
                    p.teacherId?.toString() === teacherId &&
                    isTimeOverlap(p.startTime, p.endTime, startTime, endTime)
                );

                if (teacherConflict) {
                    return res.status(409).json({ message: `Teacher is busy in Class ${cls.name} at this time.` });
                }
            }
        }

        // 3. Add Period
        if (!daySchedule) {
            classDoc.schedule.push({
                day,
                periods: [{ subject, startTime, endTime, teacherId }]
            });
        } else {
            daySchedule.periods.push({ subject, startTime, endTime, teacherId });
        }

        await classDoc.save();
        res.json(classDoc);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Helper: Check Time Overlap
const isTimeOverlap = (start1, end1, start2, end2) => {
    return (start1 < end2 && start2 < end1);
};

// Get Classes by Teacher ID
exports.getClassesByTeacher = async (req, res) => {
    try {
        const classes = await Class.find({ teacherId: req.params.teacherId });
        res.json(classes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
