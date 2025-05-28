import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { User } from '../models/user.model';

interface JwtPayload {
  id: string;
  iat: number;
}

// Extend Express Request type
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (user.isPasswordChangedAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // 5) Grant access to protected route
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    next(error);
  }
};
