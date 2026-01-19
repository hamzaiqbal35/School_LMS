const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true, // Client generated UUID
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'other'],
        default: 'cash',
    },
    remarks: {
        type: String,
    },
    offlineCreatedAt: {
        type: Date,
        required: true, // When transaction happened offline
    },
    syncedAt: {
        type: Date,
        default: Date.now,
    },
    invoiceId: {
        type: String,
        unique: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
