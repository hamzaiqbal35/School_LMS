const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// @desc    Get all teachers
// @route   GET /api/admin/teachers
const TeacherAssignment = require('../../models/TeacherAssignment');

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @desc    Get all teachers
// @route   GET /api/admin/teachers
exports.getTeachers = async (req, res) => {
    try {
        const { keyword, subjectId } = req.query;

        const pipeline = [
            // 1. Initial Match: Active Teachers
            { $match: { role: 'TEACHER', isActive: true } },

            // 2. Lookup Assigned Subjects (via TeacherAssignment)
            {
                $lookup: {
                    from: 'teacherassignments',
                    let: { teacherId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$teacherId', '$$teacherId'] }, active: true } },
                        { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
                        { $unwind: '$subject' },
                        { $replaceRoot: { newRoot: '$subject' } }
                    ],
                    as: 'assignedSubjects'
                }
            },

            // 3. Lookup Qualified Subjects
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'qualifiedSubjects',
                    foreignField: '_id',
                    as: 'qualifiedSubjects'
                }
            }
        ];

        // 4. Apply Filters
        const matchStage = {};

        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            matchStage.$or = [
                { fullName: regex },
                { email: regex },
                { phoneNumber: regex },
                { qualifications: { $elemMatch: { $regex: regex } } }
                // Optional: Search by subject name if needed, but usually filtered by dropdown
            ];
        }

        if (subjectId) {
            matchStage.$or = [
                { 'assignedSubjects._id': new mongoose.Types.ObjectId(subjectId) },
                { 'qualifiedSubjects._id': new mongoose.Types.ObjectId(subjectId) }
            ];
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // 5. Sort
        pipeline.push({ $sort: { fullName: 1 } });

        // 6. Projection (hide password)
        pipeline.push({ $project: { password: 0 } });

        const teachers = await User.aggregate(pipeline);

        res.json(teachers);
    } catch (error) {
        console.error(error);
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

        // Hard Delete: Remove User and related data
        const TeacherAssignment = require('../../models/TeacherAssignment');
        const TeacherAttendance = require('../../models/TeacherAttendance');

        await Promise.all([
            User.findByIdAndDelete(req.params.id),
            TeacherAssignment.deleteMany({ teacherId: req.params.id }),
            TeacherAttendance.deleteMany({ teacherId: req.params.id })
        ]);

        res.json({ message: 'Teacher and related data deleted permanently' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
