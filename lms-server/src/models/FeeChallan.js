const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeeChallanSchema = new Schema({
    challanNumber: {
        type: String,
        unique: true,
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    month: {
        type: String, // e.g., "January-2025"
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },

    // Financial Snapshot (Snapshot at time of generation)
    tuitionFee: { type: Number, required: true },
    otherCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Partial', 'Overdue', 'Cancelled'],
        default: 'Pending'
    },

    // Verification Data (Manual)
    paymentReference: { type: String, trim: true }, // Bank Txn ID or Cheque No
    paymentDate: Date,
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationNote: String,

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeeChallan', FeeChallanSchema);
