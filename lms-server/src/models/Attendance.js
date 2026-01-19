const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
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
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'absent',
        },
        remarks: String,
    }],
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    offlineCreatedAt: {
        type: Date,
    },
    syncedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Compound index to prevent duplicate attendance for same class/section/date
attendanceSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
