const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, markAttendance);
router.get('/', protect, getAttendance);

module.exports = router;
