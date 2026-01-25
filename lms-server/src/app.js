const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const hpp = require('hpp');
const { limiter } = require('./middlewares/rateLimiter');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Headers (Helmet)
app.use(helmet());

// Rate Limiting
app.use('/api', limiter);

// Middleware: CORS
const allowedOrigins = [process.env.CLIENT_URL.replace(/\/$/, '')]; // remove trailing slash if any
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON
app.use(express.json());
app.use(cookieParser());

// Security Middleware (Mongo Sanitize)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    };
    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);
    next();
});

app.use(hpp());

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
