const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherAttendanceSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming Teacher is a User with role TEACHER
        required: true
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
    reason: String,
    markedAt: {
        type: Date,
        default: Date.now
    },

    // Audit Trail
    history: [{
        status: String,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

// Unique attendance per teacher per day
TeacherAttendanceSchema.index({ date: 1, teacherId: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', TeacherAttendanceSchema);
