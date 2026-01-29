const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    date: {
        type: Date,
        required: true,
        // Ensure date is stored as midnight UTC to avoid timezone dupes
    },
    isFrozen: {
        type: Boolean,
        default: false
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    sectionId: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    // Note: subjectId removed - attendance is now daily, not subject-wise
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Late', 'Not Marked'],
        required: true,
        default: 'Not Marked'
    },
    markedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    markedAt: {
        type: Date,
        default: Date.now
    },

    // Audit Trail for Overrides
    history: [{
        status: String,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

// Unique attendance per student per day (daily attendance, not subject-wise)
AttendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

