import express from 'express';
import {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
