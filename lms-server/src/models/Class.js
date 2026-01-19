const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        periods: [{
            subject: String,
            startTime: String,
            endTime: String,
            teacherId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
