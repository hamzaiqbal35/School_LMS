const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const path = require('path');

// Connect to database
connectDB();

const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL, // Must specify in .env
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve Static Files (PDFs)
app.use('/challans', express.static(path.join(__dirname, '../public/challans')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/teacher', require('./routes/teacher.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/teacher-attendance', require('./routes/teacherAttendance.routes'));
app.use('/api/fees', require('./routes/fees.routes'));
app.use('/api/substitution', require('./routes/substitution.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use(require('./middlewares/errorMiddleware').notFound);
app.use(require('./middlewares/errorMiddleware').errorHandler);

module.exports = app;
