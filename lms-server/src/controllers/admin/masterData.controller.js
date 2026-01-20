const { Class, Section, Subject, TimeSlot } = require('../../models/ClassStructure');
const User = require('../../models/User');

// @desc    Get all master data (Classes, Sections, Subjects, TimeSlots)
// @route   GET /api/admin/master-data
// @access  Admin
exports.getAllMasterData = async (req, res) => {
    try {
        const classes = await Class.find().sort({ order: 1 });
        const sections = await Section.find().sort({ name: 1 });
        const subjects = await Subject.find().sort({ name: 1 }).populate('classes', 'name');
        const timeslots = await TimeSlot.find().sort({ order: 1, day: 1 });
        const teachers = await User.find({ role: 'TEACHER', isActive: true })
            .select('fullName email qualifications')
            .sort({ fullName: 1 });

        res.json({
            classes,
            sections,
            subjects,
            timeslots,
            teachers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Initialize Defaults (Helper for quick setup)
// @route   POST /api/admin/master-data/init
exports.initDefaults = async (req, res) => {
    try {
        const classCount = await Class.countDocuments();
        if (classCount === 0) {
            await Class.create([
                { name: '9th', order: 9 },
                { name: '10th', order: 10 }
            ]);
            await Section.create([
                { name: 'A' }, { name: 'B' }
            ]);
            await Subject.create([
                { name: 'Physics', code: 'PHY' },
                { name: 'Math', code: 'MTH' },
                { name: 'Chemistry', code: 'CHE' },
                { name: 'English', code: 'ENG' }
            ]);
            // TimeSlots?
            await TimeSlot.create([
                { name: 'Period 1 (Mon)', day: 'Monday', startTime: '08:00', endTime: '09:00', order: 1 },
                { name: 'Period 2 (Mon)', day: 'Monday', startTime: '09:00', endTime: '10:00', order: 2 }
            ]);
            return res.json({ message: 'Defaults Initialized' });
        }
        res.json({ message: 'Already initialized' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generic Create Handler
exports.createItem = async (req, res) => {
    const { type } = req.params; // classes, sections, subjects, timeslots
    const data = req.body;

    try {
        let item;
        if (type === 'classes') item = await Class.create(data);
        else if (type === 'sections') item = await Section.create(data);
        else if (type === 'subjects') item = await Subject.create(data);
        else if (type === 'timeslots') item = await TimeSlot.create(data);
        else return res.status(400).json({ message: 'Invalid Type' });

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generic Delete Handler
exports.deleteItem = async (req, res) => {
    const { type, id } = req.params;

    try {
        let model;
        if (type === 'classes') model = Class;
        else if (type === 'sections') model = Section;
        else if (type === 'subjects') model = Subject;
        else if (type === 'timeslots') model = TimeSlot;
        else return res.status(400).json({ message: 'Invalid Type' });

        await model.findByIdAndDelete(id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
