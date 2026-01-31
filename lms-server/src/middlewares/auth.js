const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token

            // Verify token
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET not defined in environment');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (!req.user.isActive) {
                return res.status(403).json({ message: 'User account is inactive' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const protectOptional = async (req, res, next) => {
    let token;

    token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            if (!process.env.JWT_SECRET) {
                // If secret is missing, we can't verify, but for optional protect we just proceed without user
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            // If user not found or inactive, we just proceed without attaching req.user
            // The controller will handle the missing user
            next();

        } catch (error) {
            // Token failed? Just proceed without user
            // console.error("Optional Auth Token Failed:", error.message); // Optional logging
            next();
        }
    } else {
        // No token? Just proceed
        next();
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'TEACHER') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a teacher' });
    }
};

module.exports = { protect, protectOptional, adminOnly, teacherOnly };
