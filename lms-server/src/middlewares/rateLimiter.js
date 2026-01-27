const rateLimit = require('express-rate-limit');

// General Limiter: 100 requests per 15 mins
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    skip: (req) => req.method === 'OPTIONS'
});

// Strict Limiter for Auth: 10 requests per hour
// Strict Limiter for Auth
// Increased to accommodate schools with shared IPs (e.g. computer labs)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow 50 login attempts per IP per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    skip: (req) => req.method === 'OPTIONS'
});

module.exports = { limiter, authLimiter };
