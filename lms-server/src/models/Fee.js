const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., "Tuition Fee 2024", "Reg Fee"
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['one-time', 'recurring'],
        required: true,
    },
    frequency: {
        type: String, // 'monthly', 'quarterly', 'yearly'
        required: function () { return this.type === 'recurring'; }
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
