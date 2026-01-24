const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary using buffer stream
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'school_lms/avatars',
                width: 300,
                crop: "scale"
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: 'Cloudinary upload failed' });
                }
                res.status(200).json({ url: result.secure_url });
            }
        );

        Readable.from(req.file.buffer).pipe(stream);

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

module.exports = {
    uploadMiddleware: upload.single('file'), // Expecting form-data key 'file'
    uploadAvatar
};
