const Student = require('../../models/Student');
const StudentFeeStatus = require('../../models/StudentFeeStatus');

// @desc    Create a new student
// @route   POST /api/admin/students
// @access  Admin
exports.createStudent = async (req, res) => {
    try {
        const { isAdmissionPaid, ...studentData } = req.body;

        const student = await Student.create({
            ...studentData,
            lastModifiedBy: req.user._id
        });

        // Create Fee Status
        await StudentFeeStatus.create({
            studentId: student._id,
            isAdmissionPaid: !!isAdmissionPaid
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
        const { classId, sectionId, keyword, status } = req.query;
        const query = {};

        if (status && status !== 'All') query.status = status;

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

        // Fetch Fee Status
        const feeStatus = await StudentFeeStatus.findOne({ studentId: student._id });

        const response = {
            ...student.toObject(),
            isAdmissionPaid: feeStatus ? feeStatus.isAdmissionPaid : false
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Admin
exports.updateStudent = async (req, res) => {
    try {
        const { isAdmissionPaid, ...updateData } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { ...updateData, lastModifiedBy: req.user._id },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Update Fee Status
        if (isAdmissionPaid !== undefined) {
            await StudentFeeStatus.findOneAndUpdate(
                { studentId: student._id },
                { isAdmissionPaid: isAdmissionPaid },
                { upsert: true, new: true }
            );
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
