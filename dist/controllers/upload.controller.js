"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const errorHandler_1 = require("../middleware/errorHandler");
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new errorHandler_1.AppError('Only image files are allowed', 400));
        }
    },
});
const getS3Client = () => {
    return new client_s3_1.S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
    });
};
const uploadToR2 = async (file, filename) => {
    const s3Client = getS3Client();
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'portfolio-images',
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
    });
    await s3Client.send(command);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    return publicUrl;
};
const uploadImage = async (req, res) => {
    var _a, _b;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }
        const fileExtension = req.file.originalname.split('.').pop();
        const filename = `${(0, uuid_1.v4)()}.${fileExtension}`;
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
            console.warn('R2 not configured, returning mock URL for development');
            const mockUrl = `http://localhost:5002/uploads/${filename}`;
            return res.json({
                success: true,
                url: mockUrl,
                message: 'Image uploaded successfully (mock URL - R2 not configured)',
            });
        }
        const publicUrl = await uploadToR2(req.file, filename);
        return res.json({
            success: true,
            url: publicUrl,
            message: 'Image uploaded successfully',
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        let errorMessage = 'Failed to upload image';
        if (error.code === 'EPROTO' || ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('SSL'))) {
            errorMessage = 'SSL connection error. Please check R2 configuration.';
        }
        else if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('credentials')) {
            errorMessage = 'Invalid R2 credentials. Please check environment variables.';
        }
        return res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=upload.controller.js.map