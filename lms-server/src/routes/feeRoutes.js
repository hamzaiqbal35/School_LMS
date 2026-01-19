const express = require('express');
const router = express.Router();
const { getFees, createFee, recordPayment } = require('../controllers/feeController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, getFees);
router.post('/', protect, admin, createFee);
router.post('/payment', protect, recordPayment);

module.exports = router;
