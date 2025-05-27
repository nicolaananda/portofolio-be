import express from 'express';
import {
  createPortfolio,
  getAllPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolio.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllPortfolios);
router.get('/:id', getPortfolio);

// Protected routes
router.use(protect);
router.post('/', createPortfolio);
router.patch('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);

export default router;
