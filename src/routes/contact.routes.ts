import express from 'express';
import {
  submitContact,
  getAllContacts,
  getContact,
  markAsRead,
  deleteContact,
} from '../controllers/contact.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public route for submitting contact form
router.post('/', submitContact);

// Protected routes (admin only)
router.use(protect);
router.get('/', getAllContacts);
router.get('/:id', getContact);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteContact);

export default router;
