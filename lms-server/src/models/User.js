const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher'],
    default: 'teacher',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Teacher specific fields
  subjects: [{
    type: String
  }],
  qualification: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
