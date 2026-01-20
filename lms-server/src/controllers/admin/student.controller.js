const Student = require('../../models/Student');

// @desc    Create a new student
// @route   POST /api/admin/students
// @access  Admin
exports.createStudent = async (req, res) => {
    try {
        const student = await Student.create({
            ...req.body,
            ...req.body,
            lastModifiedBy: req.user._id
        });
        res.status(201).json(student);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Registration number already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all students (with pagination/search)
// @route   GET /api/admin/students
// @access  Admin
exports.getStudents = async (req, res) => {
    try {
        const { classId, sectionId, keyword } = req.query;
        const query = {};

        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;

        if (keyword) {
            query.$or = [
                { fullName: { $regex: keyword, $options: 'i' } },
                { registrationNumber: { $regex: keyword, $options: 'i' } }
            ];
        }

        const students = await Student.find(query)
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .sort({ registrationNumber: 1 });

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single student
// @route   GET /api/admin/students/:id
// @access  Admin
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('classId', 'name')
            .populate('sectionId', 'name');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Admin
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastModifiedBy: req.user._id },
            { new: true }
        );
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
