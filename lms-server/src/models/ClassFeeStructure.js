const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassFeeStructureSchema = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
        unique: true // One structure per class
    },
    admissionFee: {
        type: Number,
        default: 0
    },
    monthlyTuition: {
        type: Number,
        required: true
    },
    examFee: {
        type: Number,
        default: 0
    },
    miscCharges: {
        type: Number,
        default: 0
    },
    lateFeeRule: {
        daysAfterDueDate: { type: Number, default: 10 },
        penaltyType: { type: String, enum: ['Fixed', 'Percentage'], default: 'Fixed' },
        value: { type: Number, default: 200 }
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassFeeStructure', ClassFeeStructureSchema);
