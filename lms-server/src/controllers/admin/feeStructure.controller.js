const ClassFeeStructure = require('../../models/ClassFeeStructure');
const Class = require('../../models/ClassStructure').Class;

// @desc    Get all fee structures
// @route   GET /api/admin/fee-structures
exports.getAllFeeStructures = async (req, res) => {
    try {
        const structures = await ClassFeeStructure.find().populate('classId', 'name');
        res.json(structures);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get fee structure by class ID
// @route   GET /api/admin/fee-structures/:classId
exports.getFeeStructureByClass = async (req, res) => {
    try {
        const structure = await ClassFeeStructure.findOne({ classId: req.params.classId });
        if (!structure) {
            return res.json(null);
        }
        res.json(structure);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create or Update Fee Structure for a Class
// @route   POST /api/admin/fee-structures
exports.saveFeeStructure = async (req, res) => {
    const { classId, admissionFee, monthlyTuition, examFee, miscCharges, lateFeeRule } = req.body;

    try {
        // Use findOneAndUpdate with upsert to prevent race conditions (Duplicate Key Error)
        const structure = await ClassFeeStructure.findOneAndUpdate(
            { classId },
            {
                $set: {
                    admissionFee,
                    monthlyTuition,
                    examFee,
                    miscCharges,
                    lateFeeRule,
                    lastUpdatedBy: req.user._id,
                    updatedAt: Date.now()
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        res.json(structure);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
