const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { // Kept for display/legacy, but strictly not for login if email is used
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: { // Now the primary login identifier
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'TEACHER'],
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    qualifications: [{
        type: String
    }],
    qualifiedSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    phoneNumber: {
        type: String
    },
    avatar: {
        type: String, // URL to the image
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
