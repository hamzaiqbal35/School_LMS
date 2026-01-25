const express = require('express');
const { protect } = require('../middlewares/auth');
const { loginUser, registerAdmin, logoutUser, getMe, updateProfile } = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { loginSchema, registerAdminSchema } = require('../validations/auth.validation');

const r = express.Router();

r.post('/login', authLimiter, validate(loginSchema), loginUser);
r.post('/register-admin', validate(registerAdminSchema), registerAdmin); // Careful with this in prod
r.post('/logout', logoutUser);

r.get('/me', protect, getMe);
r.put('/update-profile', protect, updateProfile);

module.exports = r;
