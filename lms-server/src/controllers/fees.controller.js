const FeeChallan = require('../models/FeeChallan');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

// @desc    Generate Challan for Student(s) (Bulk possible)
// @route   POST /api/fees/generate
// @access  Admin
exports.generateChallan = async (req, res) => {
    try {
        const { studentIds, month, dueDate } = req.body;

        const students = await Student.find({ _id: { $in: studentIds } });

        const challans = [];

        for (const student of students) {
            // Calculate Fees
            const tuitionUser = student.monthlyFee;
            const discount = student.discountAmount || 0;
            const total = Math.max(0, tuitionUser - discount);

            // Unique Challan Number e.g., CH-TIMESTAMP-RAND
            const challanNo = `CH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            challans.push({
                challanNumber: challanNo,
                studentId: student._id,
                month,
                dueDate,
                tuitionFee: tuitionUser,
                discount,
                totalAmount: total,
                status: 'Pending'
            });
        }

        await FeeChallan.insertMany(challans);

        res.status(201).json({ message: `${challans.length} Challans Generated Successfully` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Payment (Manual)
// @route   POST /api/fees/verify/:id
// @access  Admin
exports.verifyPayment = async (req, res) => {
    try {
        const { paymentReference, paymentDate, note } = req.body;

        const challan = await FeeChallan.findById(req.params.id);
        if (!challan) return res.status(404).json({ message: 'Challan not found' });

        challan.status = 'Paid';
        challan.paymentReference = paymentReference;
        challan.paymentDate = paymentDate || new Date();
        challan.verificationNote = note;
        challan.verifiedBy = req.user._id;

        await challan.save();

        res.json({ message: 'Payment Verified', challan });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Challans
// @route   GET /api/fees
// @access  Admin / Teacher (ReadOnly)
exports.getChallans = async (req, res) => {
    try {
        const { studentId, status, month } = req.query;
        const query = {};
        if (studentId) query.studentId = studentId;
        if (status) query.status = status;
        if (month) query.month = month;

        const challans = await FeeChallan.find(query)
            .populate('studentId', 'fullName registrationNumber classId')
            .sort({ createdAt: -1 });

        res.json(challans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
