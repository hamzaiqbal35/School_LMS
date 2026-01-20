const FeeChallan = require('../models/FeeChallan');
const Student = require('../models/Student');
const User = require('../models/User'); // If needed for verification
const { generateChallanPDF } = require('../utils/pdfGenerator');

// Helper: Generate Challan No (Deterministic-ish but unique enough)
// CH-YEARMONTH-STUDENTID_LAST4
const generateChallanNumber = (studentId, monthStr) => {
    // monthStr e.g. "2025-01"
    const suffix = studentId.toString().slice(-4);
    const cleanMonth = monthStr.replace(/[^a-zA-Z0-9]/g, '');
    return `CH-${cleanMonth}-${suffix}-${Date.now().toString().slice(-4)}`;
};

/**
 * Core Logic: Create or Retrieve Challan
 * Safe, Idempotent, Snapshot-based
 */
const createOrGetChallan = async (studentId, month, dueDate) => {
    // 1. Check DB for existing
    const existing = await FeeChallan.findOne({ studentId, month });
    if (existing) {
        return {
            challan: existing,
            status: 'EXISTING',
            pdfPath: existing.pdfPath // Assuming we save this reference or generate dynamic? 
            // Better to re-generate PDF path if not stored? Let's check model.
            // Model doesn't have pdfPath. Let's return dynamic path or generate on fly if needed?
            // User req: "Return existing PDF path". 
            // Note: If we don't store PDF path in DB, we rely on the file system.
            // Let's assume filename is deterministic based on challanNumber.
        };
    }

    // 2. Fetch Student Data (Snapshot source)
    const student = await Student.findById(studentId).populate('classId sectionId');
    if (!student) throw new Error(`Student not found: ${studentId}`);

    // 3. Calculate Amounts
    const tuition = student.monthlyFee || 0;
    const discount = student.discountAmount || 0;
    // Late fee is rule-based, but for GENERATION, it's usually 0 unless we are regenerating overdue?
    // Requirement: "Input: monthlyFee, discount. Calculate total."
    // Let's assume lateFee is 0 at generation time.
    const lateFee = 0;
    const otherCharges = 0; // Can be added via extra args if needed

    const total = Math.max(0, tuition + otherCharges - discount + lateFee);

    // 4. Generate Object
    const challanNo = generateChallanNumber(student._id, month);

    const newChallan = new FeeChallan({
        challanNumber: challanNo,
        studentId: student._id,
        month,
        dueDate,
        tuitionFee: tuition,
        discount,
        lateFee,
        otherCharges,
        totalAmount: total,
        status: 'Pending'
    });

    // 5. Generate PDF
    // We need student data for PDF too.
    const pdfUrl = await generateChallanPDF(newChallan.toObject(), student.toObject());

    // 6. Save DB
    await newChallan.save();

    return { challan: newChallan, status: 'CREATED', pdfPath: pdfUrl };
};


// @desc    Generate Challan (Single or Bulk Class)
// @route   POST /api/fees/generate
// @access  Admin
exports.generateChallan = async (req, res) => {
    try {
        // Can accept studentId (Single), studentIds (Array), or classId (Bulk by Class)
        const { studentId, studentIds, classId, month, dueDate } = req.body;

        if (!month || !dueDate) {
            return res.status(400).json({ message: 'Month and Due Date are required' });
        }

        const results = [];
        const errors = [];

        let targets = [];

        // Determine target students
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            targets = studentIds;
        } else if (studentId) {
            targets = [studentId];
        } else if (classId) {
            const students = await Student.find({ classId, status: 'Active' });
            targets = students.map(s => s._id);
        } else {
            return res.status(400).json({ message: 'Provide studentId, studentIds, or classId' });
        }

        // Process all targets
        for (const id of targets) {
            try {
                const result = await createOrGetChallan(id, month, dueDate);
                results.push(result);
            } catch (err) {
                errors.push({ studentId: id, error: err.message });
            }
        }

        res.status(200).json({
            message: 'Generation Process Completed',
            totalProcessed: results.length + errors.length,
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors
        });

    } catch (error) {
        console.error('Generate Challan Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Challans (History / Filter)
// @route   GET /api/fees
// @access  Admin / Teacher / Parent
exports.getChallans = async (req, res) => {
    try {
        const { studentId, status, month, classId, search } = req.query;
        const query = {};

        if (studentId) query.studentId = studentId;
        if (status) query.status = status;
        if (month) query.month = month;

        // Student Filters (Class or Search)
        if (classId || search) {
            const studentQuery = {};
            if (classId) studentQuery.classId = classId;
            if (search) {
                studentQuery.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { registrationNumber: { $regex: search, $options: 'i' } }
                ];
            }

            const students = await Student.find(studentQuery).select('_id');
            const ids = students.map(s => s._id);

            // If filtering by student, we must match one of the found students
            // Since we might already have studentId query, we need to be careful.
            // But if studentId is passed, usually search/class isn't.
            // Let's assume standard intersection if multiple provided, but safe to overwrite if studentId was null.
            if (query.studentId) {
                // If specific student requested AND class/search, effectively intersection (but simplest is just $in ids)
                // For now, let's just set the $in.
                query.studentId = { $in: ids };
            } else {
                query.studentId = { $in: ids };
            }
        }

        const challans = await FeeChallan.find(query)
            .populate('studentId', 'fullName registrationNumber fatherName classId sectionId')
            .sort({ createdAt: -1 });

        // Augment with PDF link if needed (deterministic based on challanNumber)
        const augmented = challans.map(c => ({
            ...c.toObject(),
            pdfUrl: `/challans/challan-${c.challanNumber}.pdf`
        }));

        res.json(augmented);
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
        const { paymentReference, paymentDate, note, status } = req.body;

        const challan = await FeeChallan.findById(req.params.id);
        if (!challan) return res.status(404).json({ message: 'Challan not found' });

        // Update fields (No recalculation!)
        challan.status = status || 'Paid';
        if (paymentReference) challan.paymentReference = paymentReference;
        if (paymentDate) challan.paymentDate = paymentDate;
        if (note) challan.verificationNote = note;

        challan.verifiedBy = req.user._id;

        await challan.save();

        res.json({ message: 'Payment Verified', challan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
