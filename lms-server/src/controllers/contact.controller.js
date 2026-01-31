const sendEmail = require('../utils/sendEmail');

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
exports.sendMessage = async (req, res, next) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const fullName = `${firstName} ${lastName}`;
        const emailSubject = `Contact Form: ${subject || 'General Inquiry'} - ${fullName}`;
        const emailMessage = `
            You have received a new message from the contact form.

            Name: ${fullName}
            Email: ${email}
            Subject: ${subject}

            Message:
            ${message}
        `;

        await sendEmail({
            email: process.env.SMTP_EMAIL || 'oxfordsgrammerschool@gmail.com', // Send to admin
            subject: emailSubject,
            message: emailMessage
        });

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
};
