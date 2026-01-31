const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({
                user: null,
                isAuthenticated: false
            });
        }

        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            avatar: user.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);

            // Set Cookie
            const options = {
                httpOnly: true,
                secure: true, // Always true for cross-site (Render -> Vercel)
                sameSite: 'None' // Always None for cross-site
            };

            if (remember) {
                options.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            }

            res.cookie('token', token, options);

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                avatar: user.avatar,
                token // Include token for cross-site fallback
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Register a new Admin (Seed/Initial only usually, but good for dev)
// @route   POST /api/auth/register-admin
// @access  Public (Should be protected or removed in prod)
exports.registerAdmin = async (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            password,
            fullName,
            email,
            role: 'ADMIN'
        });

        if (user) {
            const token = generateToken(user._id);

            // Set Cookie
            const options = {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                httpOnly: true,
                secure: true, // Always true for cross-site (Render -> Vercel)
                sameSite: 'None' // Always None for cross-site
            };

            res.cookie('token', token, options);

            res.json({
                _id: user._id,
                username: user.username,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Teacher cannot change password


        // 2. Email Change Logic (Requires Current Password)
        if (req.body.email && req.body.email !== user.email) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change email.' });
            }
            if (!(await user.comparePassword(req.body.currentPassword))) {
                return res.status(401).json({ message: 'Invalid current password provided.' });
            }

            // Check if email is already taken
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Email address already in use.' });
            }

            user.email = req.body.email;
        }

        user.fullName = req.body.fullName || user.fullName;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            avatar: updatedUser.avatar,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // Frontend URL: http://localhost:3000/reset-password/:token
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below to reset your password: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id);

        // Set Cookie (Reuse logic from login/register)
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        };

        res.cookie('token', token, options);

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
