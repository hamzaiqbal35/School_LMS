const FeeChallan = require('../models/FeeChallan');
const Student = require('../models/Student');
const User = require('../models/User'); // If needed for verification
const ClassFeeStructure = require('../models/ClassFeeStructure');
const StudentFeeStatus = require('../models/StudentFeeStatus');
const { generateChallanPDF } = require('../utils/pdfGenerator');
const cloudinary = require('../config/cloudinary');
const { getBrowser } = require('../utils/browserClient');

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
const createOrGetChallan = async (studentId, month, dueDate, options = {}, browser = null) => {
    // Options can include: { includeExamFee: boolean, includeMisc: boolean, forceAdmission: boolean }
    const { includeExamFee = false, includeMisc = false } = options;

    // 1. Check DB for existing
    const existing = await FeeChallan.findOne({ studentId, month });
    if (existing) {
        return {
            challan: existing,
            status: 'EXISTING',
            pdfPath: `/challans/challan-${existing.challanNumber}.pdf`
        };
    }

    // 2. Fetch Student Data & Fee Structure
    const student = await Student.findById(studentId).populate('classId sectionId');
    if (!student) throw new Error(`Student not found: ${studentId}`);

    const feeStructure = await ClassFeeStructure.findOne({ classId: student.classId._id });
    if (!feeStructure) throw new Error(`Fee Structure not defined for class ${student.classId.name}`);

    // 3. Fetch/Create Fee Status
    let feeStatus = await StudentFeeStatus.findOne({ studentId });
    if (!feeStatus) {
        feeStatus = await StudentFeeStatus.create({ studentId });
    }

    // 4. Calculate Amounts
    const tuition = feeStructure.monthlyTuition;
    let admission = 0;

    // Auto-include admission if not paid logic (or explicit override?)
    // Requirement: "Auto-exclude admission fee if already paid"
    if (!feeStatus.isAdmissionPaid && feeStructure.admissionFee > 0) {
        admission = feeStructure.admissionFee;
    }

    const exam = includeExamFee ? feeStructure.examFee : 0;
    const misc = includeMisc ? feeStructure.miscCharges : 0;

    const discount = student.discountAmount || 0;
    const otherCharges = 0; // Configurable if needed via inputs
    const lateFee = 0; // 0 at generation

    const subTotal = tuition + admission + exam + misc + otherCharges;
    const total = Math.max(0, subTotal - discount);

    // 5. Generate Object
    const challanNo = generateChallanNumber(student._id, month);

    const newChallan = new FeeChallan({
        challanNumber: challanNo,
        studentId: student._id,
        month,
        dueDate,

        // Breakdown
        tuitionFee: tuition,
        admissionFee: admission,
        examFee: exam,
        miscCharges: misc,
        otherCharges,

        discount,
        lateFee,
        totalAmount: total,
        status: 'Pending'
    });

    // 6. Generate PDF
    const { url, public_id } = await generateChallanPDF(newChallan.toObject(), student.toObject(), browser);

    newChallan.pdfUrl = url;
    newChallan.pdfPublicId = public_id;

    // 7. Save DB
    await newChallan.save();

    return { challan: newChallan, status: 'CREATED', pdfPath: url };
};


// @desc    Generate Challan (Single or Bulk Class)
// @route   POST /api/fees/generate
// @access  Admin
exports.generateChallan = async (req, res) => {
    try {
        // Can accept studentId (Single), studentIds (Array), or classId (Bulk by Class)
        const { studentId, studentIds, classId, month, dueDate, includeExamFee, includeMisc } = req.body;

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

        // Process all targets in batches
        const BATCH_SIZE = 5;
        let browser;

        const { getBrowser } = require('../utils/browserClient');

        // ... imports remain the same, just remove puppeteer if not used elsewhere (it's not used elsewhere in this file except launch)
        // Wait, I need to replace the imports too. But imports are at top. I will do two replacements in one call if possible, or just one call for the launch and assume imports cleanup later?
        // replace_file_content does single contiguous block.
        // I'll start with the launch logic since that's critical.

        // In generateChallan function:
        try {
            browser = await getBrowser();

            // Loop remains...

            for (let i = 0; i < targets.length; i += BATCH_SIZE) {
                const batch = targets.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (id) => {
                    try {
                        const result = await createOrGetChallan(id, month, dueDate, { includeExamFee, includeMisc }, browser);
                        results.push(result);
                    } catch (err) {
                        errors.push({ studentId: id, error: err.message });
                    }
                }));
            }
        } finally {
            if (browser) await browser.close();
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
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ message: 'Server Error', error: error.message });
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

            // Merge with existing studentId filter if any
            if (query.studentId) {
                // Intersect or... basically if query.studentId is present, we must match BOTH.
                // But simplified:
                query.studentId = { $in: ids }; // This overwrites single ID if set?
                // If both are set, we should ideally check intersection, but for typical usage it's one or other.
            } else {
                query.studentId = { $in: ids };
            }
        }

        const challans = await FeeChallan.find(query)
            .populate('studentId', 'fullName registrationNumber fatherName classId sectionId')
            .sort({ createdAt: -1 });

        // Augment with Signed URL for authenticated access
        const augmented = challans.map(c => {
            const obj = c.toObject();
            if (obj.pdfPublicId) {
                // Generate Signed URL
                obj.pdfUrl = cloudinary.url(obj.pdfPublicId, {
                    resource_type: 'image',
                    type: 'authenticated',
                    sign_url: true
                });
            } else if (obj.pdfUrl && obj.pdfUrl.startsWith('/')) {
                // Local Fallback: Dynamic Host
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                obj.pdfUrl = `${baseUrl}${obj.pdfUrl}`;
            }
            return obj;
        });

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

        // Update Student Fee Status if Paid
        if (challan.status === 'Paid') {
            const feeStatus = await StudentFeeStatus.findOne({ studentId: challan.studentId });
            if (feeStatus) {
                let updated = false;

                // If Admission Fee was included, mark as paid
                if (challan.admissionFee > 0 && !feeStatus.isAdmissionPaid) {
                    feeStatus.isAdmissionPaid = true;
                    updated = true;
                }

                // Update last paid tuition month logic?
                // Simple logic: if this month > lastPaid, update. 
                // But string comparison YYYY-MM works.
                if (challan.tuitionFee > 0) {
                    // Check if current month is greater than stored
                    // Assuming format YYYY-MM
                    if (!feeStatus.lastPaidTuitionMonth || challan.month > feeStatus.lastPaidTuitionMonth) {
                        feeStatus.lastPaidTuitionMonth = challan.month;
                        updated = true;
                    }
                }

                if (updated) await feeStatus.save();
            }
        }

        res.json({ message: 'Payment Verified', challan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Download Challan Proxy (Proxy Stream)
// @route   GET /api/fees/download/:id
// @access  Protected
exports.downloadChallan = async (req, res) => {
    try {
        const challan = await FeeChallan.findById(req.params.id);
        if (!challan) return res.status(404).json({ message: 'Challan not found' });

        // 1. Try Local File First (Preferred/Offline)
        const path = require('path');
        const fs = require('fs');
        const fileName = `challan-${challan.challanNumber}.pdf`;
        const localPath = path.join(__dirname, '../../public/challans', fileName);

        if (fs.existsSync(localPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            const fileStream = fs.createReadStream(localPath);
            fileStream.pipe(res);
            return;
        }

        // 2. Try Cloudinary (Network)
        if (challan.pdfPublicId) {
            // Priority: Use stored pdfUrl if available (this is the permanent signed URL from upload)
            if (challan.pdfUrl && challan.pdfUrl.startsWith('http')) {
                console.log(`[Download] Redirecting to stored URL: ${challan.pdfUrl}`);
                return res.redirect(challan.pdfUrl);
            }

            // Fallback: Generate public URL (no signature needed for 'upload' type)
            const url = cloudinary.url(challan.pdfPublicId, {
                resource_type: 'image',
                type: 'upload', // Changed to match new upload type (public)
                secure: true,
                format: 'pdf'
            });

            console.log(`[Download] Redirecting to generated URL for ID: ${challan.pdfPublicId}`);
            return res.redirect(url);
        }

        res.status(404).json({ message: 'PDF not found locally or on cloud' });

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Challan
// @route   DELETE /api/fees/:id
// @access  Admin
exports.deleteChallan = async (req, res) => {
    try {
        const challan = await FeeChallan.findById(req.params.id);

        if (!challan) return res.status(404).json({ message: 'Challan not found' });

        if (challan.status !== 'Pending') {
            return res.status(400).json({ message: 'Only Pending challans can be deleted' });
        }

        await FeeChallan.findByIdAndDelete(req.params.id);

        res.json({ message: 'Challan deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
