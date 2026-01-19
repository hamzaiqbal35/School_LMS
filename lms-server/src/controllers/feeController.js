const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private
const getFees = async (req, res) => {
    try {
        const fees = await Fee.find({ isActive: true });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new fee
// @route   POST /api/fees
// @access  Private (Admin)
const createFee = async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json(fee);
    } catch (error) {
        res.status(400).json({ message: 'Invalid fee data' });
    }
};

// @desc    Record a payment
// @route   POST /api/fees/payment
// @access  Private
const recordPayment = async (req, res) => {
    try {
        // This endpoint is for ONLINE payments or real-time admin entry
        const { studentId, feeId, amountPaid, paymentMethod, remarks } = req.body;

        const payment = await Payment.create({
            uuid: uuidv4(),
            student: studentId,
            fee: feeId,
            amountPaid,
            paymentMethod,
            remarks,
            offlineCreatedAt: Date.now(),
            createdBy: req.user.id,
            invoiceId: `INV-${Date.now()}`,
        });

        res.status(201).json(payment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFees,
    createFee,
    recordPayment,
};
