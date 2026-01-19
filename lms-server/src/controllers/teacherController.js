const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create Teacher
exports.createTeacher = async (req, res) => {
    try {
        const { name, email, password, subjects, qualification } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'teacher',
            subjects,
            qualification
        });

        await user.save();

        res.status(201).json({ message: 'Teacher created successfully', teacher: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Teachers
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.json(teachers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Single Teacher
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select('-password');
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
    try {
        const { name, email, subjects, qualification, isActive } = req.body;

        // Build object
        const teacherFields = {};
        if (name) teacherFields.name = name;
        if (email) teacherFields.email = email;
        if (subjects) teacherFields.subjects = subjects;
        if (qualification) teacherFields.qualification = qualification;
        if (isActive !== undefined) teacherFields.isActive = isActive;

        let teacher = await User.findById(req.params.id);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher = await User.findByIdAndUpdate(
            req.params.id,
            { $set: teacherFields },
            { new: true }
        ).select('-password');

        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Teacher (Soft Delete usually preferred, but using hard delete for now or toggle active)
exports.deleteTeacher = async (req, res) => {
    try {
        // For now, let's just delete. In real app, check constraints.
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
