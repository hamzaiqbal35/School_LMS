const express = require('express');
const { sendMessage } = require('../controllers/contact.controller');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/', authLimiter, sendMessage);

module.exports = router;
