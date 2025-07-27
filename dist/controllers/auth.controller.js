"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const user_model_1 = require("../models/user.model");
const token_model_1 = require("../models/token.model");
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getDeviceInfo = (req) => ({
    userAgent: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
});
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return next(new errorHandler_1.AppError('Please provide a valid email address', 400));
        }
        if (!password || !passwordRegex.test(password)) {
            return next(new errorHandler_1.AppError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character', 400));
        }
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            return next(new errorHandler_1.AppError('Email already registered', 400));
        }
        const user = await user_model_1.User.create({
            email,
            password,
        });
        const { accessToken, refreshToken } = user.generateAuthToken();
        await token_model_1.Token.create({
            userId: user._id,
            refreshToken,
            deviceInfo: getDeviceInfo(req),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            status: 'success',
            accessToken,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandler_1.AppError('Please provide email and password', 400));
        }
        const user = await user_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            return next(new errorHandler_1.AppError('Incorrect email or password', 401));
        }
        if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
            return next(new errorHandler_1.AppError(`Account is locked. Try again after ${user.lockUntil.toLocaleString()}`, 401));
        }
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            await user.incrementFailedLoginAttempts();
            return next(new errorHandler_1.AppError('Incorrect email or password', 401));
        }
        await user.resetFailedLoginAttempts();
        const { accessToken, refreshToken } = user.generateAuthToken();
        await token_model_1.Token.create({
            userId: user._id,
            refreshToken,
            deviceInfo: getDeviceInfo(req),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: 'success',
            accessToken,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await token_model_1.Token.findOneAndUpdate({ refreshToken }, { isValid: false });
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({
            status: 'success',
            message: 'Successfully logged out',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return next(new errorHandler_1.AppError('No refresh token provided', 401));
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'secret-key');
        const tokenDoc = await token_model_1.Token.findOne({
            refreshToken,
            isValid: true,
            userId: decoded.id,
            expiresAt: { $gt: new Date() }
        });
        if (!tokenDoc) {
            return next(new errorHandler_1.AppError('Invalid or expired refresh token', 401));
        }
        const user = await user_model_1.User.findById(decoded.id);
        if (!user) {
            return next(new errorHandler_1.AppError('User no longer exists', 401));
        }
        if (user.isPasswordChangedAfter(decoded.iat)) {
            return next(new errorHandler_1.AppError('User recently changed password! Please log in again.', 401));
        }
        const { accessToken, refreshToken: newRefreshToken } = user.generateAuthToken();
        tokenDoc.refreshToken = newRefreshToken;
        tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await tokenDoc.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: 'success',
            accessToken,
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.AppError('Refresh token has expired. Please log in again.', 401));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError('Invalid refresh token. Please log in again.', 401));
        }
        next(error);
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            return next(new errorHandler_1.AppError('No user found with that email address', 404));
        }
        const resetToken = user.generatePasswordResetToken();
        await user.save();
        res.status(200).json({
            status: 'success',
            message: 'Password reset token sent to email',
            resetToken,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await user_model_1.User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            return next(new errorHandler_1.AppError('Token is invalid or has expired', 400));
        }
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        await token_model_1.Token.updateMany({ userId: user._id }, { isValid: false });
        res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map