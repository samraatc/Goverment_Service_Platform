import { Router } from 'express';
import authRoutes from './auth.routes';
import serviceRoutes from './service.routes';
import categoryRoutes from './category.routes';
import adminRoutes from './admin.routes';
import blogRoutes from './blog.routes';
import { submitContact } from '../../controllers/contact.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/blogs', blogRoutes);
router.post('/contact', submitContact);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'GovServices API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
