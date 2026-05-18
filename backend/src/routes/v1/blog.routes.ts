import { Router } from 'express';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
} from '../../controllers/blog.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);

// Admin
router.get('/admin/all', authenticate, authorize('super_admin', 'admin', 'editor'), getAllBlogsAdmin);

router.post('/', authenticate, authorize('super_admin', 'admin', 'editor'), createBlog);
router.put('/:id', authenticate, authorize('super_admin', 'admin', 'editor'), updateBlog);
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), deleteBlog);

export default router;
