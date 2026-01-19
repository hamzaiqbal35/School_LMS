const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Half Day'],
        required: true
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

// Ensure one record per teacher per day
teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
