import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { Token } from '../models/token.model';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Helper function to get device info
const getDeviceInfo = (req: Request) => ({
  userAgent: req.headers['user-agent'] || 'unknown',
  ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
});

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Validate password strength
    if (!password || !passwordRegex.test(password)) {
      return next(
        new AppError(
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
          400,
        ),
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
    });

    // Generate tokens
    const { accessToken, refreshToken } = user.generateAuthToken();

    // Save refresh token
    await Token.create({
      userId: user._id,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Set secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(201).json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if account is locked
    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      return next(
        new AppError(`Account is locked. Try again after ${user.lockUntil.toLocaleString()}`, 401),
      );
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      await user.incrementFailedLoginAttempts();
      return next(new AppError('Incorrect email or password', 401));
    }

    // Reset failed login attempts on successful login
    await user.resetFailedLoginAttempts();

    // 3) Generate tokens
    const { accessToken, refreshToken } = user.generateAuthToken();

    // 4) Save refresh token
    await Token.create({
      userId: user._id,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // 5) Set secure cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6) Send response
    res.status(200).json({
      status: 'success',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Invalidate refresh token
      await Token.findOneAndUpdate({ refreshToken }, { isValid: false });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError('No refresh token provided', 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'secret-key') as {
      id: string;
    };

    // Check if token exists and is valid
    const tokenDoc = await Token.findOne({
      refreshToken,
      isValid: true,
      userId: decoded.id,
    });

    if (!tokenDoc) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = user.generateAuthToken();

    // Update refresh token
    tokenDoc.refreshToken = newRefreshToken;
    tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenDoc.save();

    // Set new refresh token cookie
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
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send email with reset token
    // For now, just return the token
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      resetToken, // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all refresh tokens
    await Token.updateMany({ userId: user._id }, { isValid: false });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
