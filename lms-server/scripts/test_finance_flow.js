const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Student = require('../src/models/Student');
const { Class } = require('../src/models/ClassStructure');
const FeeChallan = require('../src/models/FeeChallan');
const feesController = require('../src/controllers/fees.controller');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_lms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection Error:', err);
        process.exit(1);
    }
};

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    await connectDB();

    try {
        // 1. Setup Data
        console.log('--- SETUP DATA ---');
        // Find or create class
        let cls = await Class.findOne({ name: 'FinanceTestClass' });
        if (!cls) {
            cls = await Class.create({ name: 'FinanceTestClass', fees: 5000 });
        }

        // Create Student
        const regNum = `FT-${Date.now()}`;
        const student = await Student.create({
            registrationNumber: regNum,
            fullName: 'Finance Tester',
            fatherName: 'Mr. Tester',
            dob: new Date('2010-01-01'),
            gender: 'Male',
            classId: cls._id,
            sectionId: cls._id, // Hack reusing ID for section as simpler
            monthlyFee: 5000,
            status: 'Active'
        });
        console.log(`Created Student: ${student.fullName} (${student._id})`);

        // 2. Generate Challan (First Time)
        console.log('\n--- GENERATE CHALLAN (1st Run) ---');
        const req1 = {
            body: {
                studentId: student._id.toString(),
                month: '2025-01',
                dueDate: new Date('2025-01-15')
            }
        };
        const res1 = mockRes();
        await feesController.generateChallan(req1, res1);
        console.log('Status:', res1.statusCode);
        console.log('Result:', JSON.stringify(res1.data, null, 2));

        if (res1.statusCode !== 200 || res1.data.errorCount > 0) {
            throw new Error('First generation failed');
        }

        // 3. Verify PDF
        const pdfPath = res1.data.results[0].pdfPath;
        const fullPath = path.join(__dirname, '../public', pdfPath);
        console.log(`\nChecking PDF at: ${fullPath}`);
        if (fs.existsSync(fullPath)) {
            console.log('✅ PDF Exists');
        } else {
            console.error('❌ PDF Missing');
        }

        // 4. Generate Challan (Second Time - Idempotency)
        console.log('\n--- GENERATE CHALLAN (2nd Run - Idempotency) ---');
        const res2 = mockRes();
        await feesController.generateChallan(req1, res2);
        console.log('Status:', res2.statusCode);
        console.log('Result:', JSON.stringify(res2.data, null, 2));

        const status2 = res2.data.results[0].status;
        if (status2 === 'EXISTING') {
            console.log('✅ Idempotency Verified (Status: EXISTING)');
        } else {
            console.error(`❌ Idempotency Failed (Status: ${status2})`);
        }

        // Cleanup
        await FeeChallan.deleteMany({ studentId: student._id });
        await Student.findByIdAndDelete(student._id);
        if (cls.name === 'FinanceTestClass') await Class.findByIdAndDelete(cls._id); // Cleanup only if we created it

        console.log('\n--- CLEANUP DONE ---');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
