const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const feesController = require('../controllers/fees.controller');

router.use(protect);

router.get('/', feesController.getChallans); // Teachers might need to see this? Yes.

// Admin Only
router.post('/generate', adminOnly, feesController.generateChallan);
router.post('/verify/:id', adminOnly, feesController.verifyPayment);

module.exports = router;
