import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 50000000, // 100 requests in production, 5000 in development
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
