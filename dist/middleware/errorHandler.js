"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const multer_1 = __importDefault(require("multer"));
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                status: 'fail',
                message: 'File too large. Maximum file size is 5MB',
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                status: 'fail',
                message: 'Unexpected file field. Use "image" as the field name',
            });
        }
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'File upload error',
        });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map