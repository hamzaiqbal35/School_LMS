const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
    },
    rollNumber: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    parentName: {
        type: String,
        required: true,
    },
    parentPhone: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
    },
    address: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'passed_out'],
        default: 'active'
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    frozenAttendance: {
        isFrozen: { type: Boolean, default: false },
        reason: String,
        startDate: Date,
        endDate: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
