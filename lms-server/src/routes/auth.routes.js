const express = require('express');
const { protect } = require('../middlewares/auth');
const { loginUser, registerAdmin, logoutUser, getMe, updateProfile } = require('../controllers/auth.controller');

const r = express.Router();

r.post('/login', loginUser);
r.post('/register-admin', registerAdmin); // Careful with this in prod
r.post('/logout', logoutUser);

r.get('/me', protect, getMe);
r.put('/update-profile', protect, updateProfile);

module.exports = r;
