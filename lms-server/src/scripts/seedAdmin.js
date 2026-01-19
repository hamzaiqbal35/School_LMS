require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        const existingAdmin = await User.findOne({ email: 'admin@school.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            name: 'Super Admin',
            email: 'admin@school.com',
            password: hashedPassword,
            role: 'admin',
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@school.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAdmin();
