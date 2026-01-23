const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentFeeStatusSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    isAdmissionPaid: {
        type: Boolean,
        default: false
    },
    lastPaidTuitionMonth: {
        type: String, // e.g. "2025-01"
        default: null
    },
    // We can track other one-time fees here if needed
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentFeeStatus', StudentFeeStatusSchema);
