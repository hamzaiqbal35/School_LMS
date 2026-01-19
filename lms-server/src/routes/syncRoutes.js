const express = require('express');
const router = express.Router();
const { syncUp, syncDown } = require('../controllers/syncController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/up', protect, syncUp);
router.get('/down', protect, syncDown);

module.exports = router;
