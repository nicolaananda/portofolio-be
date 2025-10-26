import { Router } from 'express';
import { uploadImage, upload } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Upload endpoint with authentication and file upload middleware
router.post('/', protect, upload.single('image'), uploadImage);

export default router;
