const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check by Email
        const email = 'admin@school.com';
        const adminExists = await User.findOne({ email });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const admin = await User.create({
            username: 'admin',
            email: email,
            password: 'password123',
            fullName: 'System Administrator',
            role: 'ADMIN'
        });

        console.log(`Admin created: ${admin.email} / password123`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
