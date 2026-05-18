import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  trackServiceClick,
  approveService,
  getTrendingServices,
  getSearchSuggestions,
} from '../../controllers/service.controller';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { searchLimiter } from '../../middleware/rateLimiter.middleware';
import { createServiceSchema, updateServiceSchema, serviceQuerySchema } from '../../validators/service.validator';

const router = Router();

// Public routes
router.get('/', optionalAuth, validate(serviceQuerySchema), getServices);
router.get('/trending', getTrendingServices);
router.get('/suggestions', searchLimiter, getSearchSuggestions);
router.get('/:id', optionalAuth, getServiceById);
router.post('/:id/click', optionalAuth, trackServiceClick);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin', 'editor'),
  validate(createServiceSchema),
  createService
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin', 'editor'),
  validate(updateServiceSchema),
  updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  deleteService
);

router.put(
  '/:id/approve',
  authenticate,
  authorize('super_admin', 'admin'),
  approveService
);

export default router;
