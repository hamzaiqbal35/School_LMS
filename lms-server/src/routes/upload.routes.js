const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadAvatar } = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth');

router.post('/avatar', protect, uploadMiddleware, uploadAvatar);

module.exports = router;
