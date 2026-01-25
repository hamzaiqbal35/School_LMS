const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        if (e instanceof ZodError) {
            // Support for Zod 3 (errors) and potential other structures (issues/array)
            const errors = e.errors || e.issues || (Array.isArray(e) ? e : []);

            return res.status(400).json({
                message: 'Validation Error',
                errors: errors.map((err) => ({
                    field: (err.path && Array.isArray(err.path)) ? err.path.join('.') : (err.path || 'unknown'),
                    message: err.message || 'Invalid input',
                })),
            });
        }
        console.error('Unexpected Validation Error:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = validate;
