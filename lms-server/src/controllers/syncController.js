const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const User = require('../models/User');

// @desc    Sync offline data (Upload)
// @route   POST /api/sync/up
// @access  Private
const syncUp = async (req, res) => {
    const { payments, attendance } = req.body;
    const results = {
        payments: { success: [], failed: [] },
        attendance: { success: [], failed: [] },
    };

    try {
        // Process Payments
        if (payments && payments.length > 0) {
            for (const payment of payments) {
                try {
                    // Check if payment already exists by UUID
                    const existingPayment = await Payment.findOne({ uuid: payment.uuid });

                    if (existingPayment) {
                        // Already synced, skip or update if needed
                        results.payments.success.push(payment.uuid);
                        continue;
                    }

                    // Create new payment
                    await Payment.create({
                        ...payment,
                        createdBy: req.user.id,
                        syncedAt: Date.now(),
                    });
                    results.payments.success.push(payment.uuid);
                } catch (err) {
                    console.error(`Failed to sync payment ${payment.uuid}:`, err);
                    results.payments.failed.push({ uuid: payment.uuid, error: err.message });
                }
            }
        }

        // Process Attendance
        if (attendance && attendance.length > 0) {
            for (const att of attendance) {
                try {
                    // Check if attendance for this date/class/section already exists
                    const existingAttendance = await Attendance.findOne({
                        date: att.date,
                        class: att.class,
                        section: att.section
                    });

                    if (existingAttendance) {
                        // Admin wins logic: If server has it, we might want to keep server version
                        // OR merge. For now, let's assume server version is authoritative
                        results.attendance.success.push(att.uuid || att.date); // Use a unique ID if available
                        continue;
                    }

                    await Attendance.create({
                        ...att,
                        markedBy: req.user.id,
                        syncedAt: Date.now(),
                    });
                    results.attendance.success.push(att.uuid || att.date);
                } catch (err) {
                    console.error(`Failed to sync attendance:`, err);
                    results.attendance.failed.push({ date: att.date, error: err.message });
                }
            }
        }

        res.json({ message: 'Sync completed', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during Sync' });
    }
};

// @desc    Download latest data
// @route   GET /api/sync/down
// @access  Private
const syncDown = async (req, res) => {
    try {
        const lastSync = req.query.lastSync || 0;
        const date = new Date(lastSync);

        const students = await Student.find({ updatedAt: { $gt: date } });
        const fees = await Fee.find({ updatedAt: { $gt: date } });
        // Maybe send recent payments too provided they are relavant

        res.json({
            students,
            fees,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during Sync Down' });
    }
};

module.exports = {
    syncUp,
    syncDown,
};
