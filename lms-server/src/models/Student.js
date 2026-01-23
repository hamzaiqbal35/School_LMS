const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    // Identifiers
    registrationNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    // Personal Info
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },

    // Academic Placement
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
    campusId: {
        type: String,
        default: 'Main' // Can be expanded to reference if multiple branches exist
    },

    // Financial Structure (Authoritative Master Data)
    // Removed direct fee storage. Referenced via ClassFeeStructure.
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Status
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'PassedOut', 'Expelled'],
        default: 'Active'
    },

    admissionDate: {
        type: Date,
        default: Date.now
    },

    // Audit
    lastModifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
StudentSchema.pre('save', function () {
    this.lastModifiedAt = Date.now();
});

module.exports = mongoose.model('Student', StudentSchema);
