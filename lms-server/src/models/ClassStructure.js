const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CLASS SCHEMA (e.g., 9th, 10th)
const ClassSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: { type: Date, default: Date.now }
});

// SECTION SCHEMA (e.g., A, B, Green)
const SectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: { type: Date, default: Date.now }
});
// Ensure uniqueness if needed, but names like 'A' are reused across classes usually. 
// If we want global uniqueness, we'd enable it. For now, just simplistic.

// SUBJECT SCHEMA (e.g., Physics, Math)
const SubjectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allow nulls if code not provided
    },
    classes: [{
        type: Schema.Types.ObjectId,
        ref: 'Class'
    }],
    description: String,
    createdAt: { type: Date, default: Date.now }
});

// TIME SLOT SCHEMA (e.g., "Monday-09:00", "Period 1")
const TimeSlotSchema = new Schema({
    name: {
        type: String, // e.g., "09:00 AM - 10:00 AM" or "Period 1"
        required: true,
        trim: true
    },
    day: {
        type: String, // e.g. Monday
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:00"
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
// Compound unique index to prevent duplicate slots on same day/time if needed?
// implementation decision: simpler uniqueness on name for now, or just day+startTime.
// Let's stick to unique 'name' for simplicity in dropdowns, OR usage of ID.

module.exports = {
    Class: mongoose.model('Class', ClassSchema),
    Section: mongoose.model('Section', SectionSchema),
    Subject: mongoose.model('Subject', SubjectSchema),
    TimeSlot: mongoose.model('TimeSlot', TimeSlotSchema)
};
