"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const user_model_1 = require("../models/user.model");
const protect = async (req, _res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new errorHandler_1.AppError('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
        const user = await user_model_1.User.findById(decoded.id);
        if (!user) {
            return next(new errorHandler_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        if (user.isPasswordChangedAfter(decoded.iat)) {
            return next(new errorHandler_1.AppError('User recently changed password! Please log in again.', 401));
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.AppError('Your token has expired! Please log in again.', 401));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError('Invalid token. Please log in again!', 401));
        }
        next(error);
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map