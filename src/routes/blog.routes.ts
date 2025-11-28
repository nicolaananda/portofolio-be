import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
} from '../controllers/blog.controller';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlog);

router.use(protect);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.patch('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;

