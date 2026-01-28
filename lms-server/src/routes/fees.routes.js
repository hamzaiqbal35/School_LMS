const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const feesController = require('../controllers/fees.controller');

router.use(protect);

router.get('/', feesController.getChallans); // Teachers might need to see this? Yes.

// Admin Only
// Fee Structure Routes
const feeStructureController = require('../controllers/admin/feeStructure.controller');
router.get('/structures', adminOnly, feeStructureController.getAllFeeStructures);
router.get('/structures/:classId', adminOnly, feeStructureController.getFeeStructureByClass);
router.post('/structures', adminOnly, feeStructureController.saveFeeStructure);

// Challan Routes
router.get('/download/:id', feesController.downloadChallan);
router.post('/generate', adminOnly, feesController.generateChallan);
router.post('/verify/:id', adminOnly, feesController.verifyPayment);
router.delete('/:id', adminOnly, feesController.deleteChallan);

module.exports = router;
