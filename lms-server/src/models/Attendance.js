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
    subjectId: { // Optional: if subject-wise attendance
        type: Schema.Types.ObjectId,
        ref: 'Subject'
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Late'],
        required: true,
        default: 'Absent'
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

// Unique attendance per student per day (per subject if used)
AttendanceSchema.index({ date: 1, studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
