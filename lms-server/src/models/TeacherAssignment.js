const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherAssignmentSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    timeSlotId: {
        type: Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Clash Detection Indices
// 1. Prevent multiple teachers for same class-section-subject-slot
TeacherAssignmentSchema.index({ classId: 1, sectionId: 1, timeSlotId: 1 }, { unique: true, partialFilterExpression: { active: true } });

// 2. Prevent same teacher in two places at same time
TeacherAssignmentSchema.index({ teacherId: 1, timeSlotId: 1 }, { unique: true, partialFilterExpression: { active: true } });

module.exports = mongoose.model('TeacherAssignment', TeacherAssignmentSchema);
