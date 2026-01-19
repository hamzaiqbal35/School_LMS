const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// Get All Students (Simple List)
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ name: 1 });
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get Single Student Detailed View
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Aggregate Fee History
        const payments = await Payment.find({ student: id })
            .populate('fee', 'name amount type')
            .sort({ createdAt: -1 });

        // Aggregate Attendance Stats
        // This is a simplified calculation. For large datasets, use MongoDB Aggregation Pipeline.
        const attendanceRecords = await Attendance.find({ 'records.student': id });

        let present = 0;
        let absent = 0;
        let total = 0;

        attendanceRecords.forEach(record => {
            const studentRecord = record.records.find(r => r.student.toString() === id);
            if (studentRecord) {
                total++;
                if (studentRecord.status === 'present') present++;
                else if (studentRecord.status === 'absent') absent++;
            }
        });

        const attendanceStats = {
            totalDays: total,
            presentDays: present,
            absentDays: absent,
            percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
        };

        res.json({
            student,
            payments,
            attendanceStats
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create Student
exports.createStudent = async (req, res) => {
    try {
        const { name, rollNumber, class: className, section, parentName, parentPhone, dob, address, admissionDate } = req.body;

        // Auto-generate Registration Number (Format: REG-YYYY-XXXX)
        const year = new Date().getFullYear();
        const count = await Student.countDocuments();
        const sequence = (count + 1).toString().padStart(4, '0');
        const registrationNumber = `REG-${year}-${sequence}`;

        const newStudent = new Student({
            name,
            rollNumber,
            registrationNumber,
            class: className,
            section,
            parentName,
            parentPhone,
            dob,
            address,
            admissionDate
        });

        const student = await newStudent.save();
        res.status(201).json(student);
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Duplicate key error (Roll Number or Reg Number)' });
        }
        res.status(500).send('Server Error');
    }
};

// Update Student Status (Soft Delete / Status Change)
exports.updateStudentStatus = async (req, res) => {
    try {
        const { status, frozenAttendance } = req.body;
        const updates = {};

        if (status) updates.status = status;
        // Auto update isActive based on status
        if (status === 'active') updates.isActive = true;
        else if (status === 'inactive' || status === 'passed_out') updates.isActive = false;

        if (frozenAttendance) updates.frozenAttendance = frozenAttendance;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update Student Class
exports.updateStudentClass = async (req, res) => {
    try {
        const { className, section } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: { class: className, section } },
            { new: true }
        );
        res.json(student);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
