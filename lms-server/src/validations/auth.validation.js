const { z } = require('zod');

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

const registerAdminSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        email: z.string().email('Invalid email address'),
        fullName: z.string().min(1, 'Full name is required'),
    }),
});

module.exports = {
    loginSchema,
    registerAdminSchema
};
