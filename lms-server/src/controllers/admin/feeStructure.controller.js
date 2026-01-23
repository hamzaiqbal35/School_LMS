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
            return res.status(404).json({ message: 'Fee Structure not defined for this class' });
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
        let structure = await ClassFeeStructure.findOne({ classId });

        if (structure) {
            // Update
            structure.admissionFee = admissionFee ?? structure.admissionFee;
            structure.monthlyTuition = monthlyTuition ?? structure.monthlyTuition;
            structure.examFee = examFee ?? structure.examFee;
            structure.miscCharges = miscCharges ?? structure.miscCharges;
            if (lateFeeRule) structure.lateFeeRule = lateFeeRule;

            structure.lastUpdatedBy = req.user._id;
            structure.updatedAt = Date.now();
            await structure.save();
            return res.json(structure);
        }

        // Create
        structure = new ClassFeeStructure({
            classId,
            admissionFee,
            monthlyTuition,
            examFee,
            miscCharges,
            lateFeeRule,
            lastUpdatedBy: req.user._id
        });

        await structure.save();
        res.status(201).json(structure);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
