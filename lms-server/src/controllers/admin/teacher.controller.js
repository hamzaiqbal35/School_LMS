const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all teachers
// @route   GET /api/admin/teachers
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'TEACHER', isActive: true })
            .populate('qualifiedSubjects', 'name code')
            .select('-password')
            .sort({ fullName: 1 });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single teacher
// @route   GET /api/admin/teachers/:id
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id)
            .populate('qualifiedSubjects', 'name code')
            .select('-password');

        if (!teacher || teacher.role !== 'TEACHER') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a teacher
// @route   POST /api/admin/teachers
exports.createTeacher = async (req, res) => {
    const { fullName, email, password, qualifications, qualifiedSubjects, phoneNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const teacher = await User.create({
            fullName,
            email,
            username: email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate simple username
            password, // Will be hashed by pre-save hook
            role: 'TEACHER',
            qualifications: qualifications || [],
            qualifiedSubjects: qualifiedSubjects || [],
            phoneNumber
        });

        res.status(201).json({
            _id: teacher._id,
            fullName: teacher.fullName,
            email: teacher.email,
            role: teacher.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a teacher
// @route   PUT /api/admin/teachers/:id
exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);

        if (!teacher || teacher.role !== 'TEACHER') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.fullName = req.body.fullName || teacher.fullName;
        teacher.email = req.body.email || teacher.email;
        teacher.qualifications = req.body.qualifications || teacher.qualifications;
        teacher.qualifiedSubjects = req.body.qualifiedSubjects || teacher.qualifiedSubjects;
        teacher.phoneNumber = req.body.phoneNumber || teacher.phoneNumber;

        if (req.body.password) {
            teacher.password = req.body.password; // pre-save will hash it
        }

        const updatedTeacher = await teacher.save();

        res.json({
            _id: updatedTeacher._id,
            fullName: updatedTeacher.fullName,
            email: updatedTeacher.email,
            role: updatedTeacher.role
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete (Deactivate) a teacher
// @route   DELETE /api/admin/teachers/:id
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);

        if (!teacher || teacher.role !== 'TEACHER') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Hard delete or soft delete? 
        // Soft delete is safer for historical assignments
        teacher.isActive = false;
        await teacher.save();

        res.json({ message: 'Teacher deactivated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
