const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
    originalTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    substituteTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed'],
        default: 'Confirmed'
    }
}, { timestamps: true });

module.exports = mongoose.model('Substitution', substitutionSchema);
