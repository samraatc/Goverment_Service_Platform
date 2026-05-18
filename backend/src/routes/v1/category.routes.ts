import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/category.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../../validators/category.validator';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post(
  '/',
  authenticate,
  authorize('super_admin', 'admin'),
  validate(createCategorySchema),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  deleteCategory
);

export default router;
