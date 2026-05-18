import { Request, Response } from 'express';
import { Category } from '../models/Category.model';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { paginate, parsePaginationQuery } from '../utils/pagination';
import { IAuthRequest } from '../types';
import { ActivityLog } from '../models/ActivityLog.model';

// ─── Get All Categories ────────────────────────────────────────────────────────
export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const { flat, active } = req.query;

  if (flat === 'true') {
    const filter: Record<string, unknown> = {};
    if (active !== 'false') filter.isActive = true;

    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .select('-__v');

    return ApiResponse.success(res, categories, 'Categories retrieved');
  }

  // Paginated
  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);
  const filter: Record<string, unknown> = { parentCategory: null };

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  const result = await paginate({
    model: Category,
    query: filter,
    paginationQuery,
    populate: 'subcategories',
    sort: { order: 1, name: 1 },
  });

  return ApiResponse.paginated(res, result, 'Categories retrieved successfully');
});

// ─── Get Category by ID or Slug ────────────────────────────────────────────────
export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findOne({ $or: [{ _id: id }, { slug: id }] }).populate(
    'subcategories'
  );

  if (!category) throw new AppError('Category not found.', 404);

  return ApiResponse.success(res, category, 'Category retrieved successfully');
});

// ─── Create Category ───────────────────────────────────────────────────────────
export const createCategory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const category = await Category.create(req.body);

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'CREATE_CATEGORY',
    resource: 'category',
    resourceId: category._id.toString(),
    details: { name: category.name },
    ipAddress: req.ip,
  });

  return ApiResponse.created(res, category, 'Category created successfully');
});

// ─── Update Category ───────────────────────────────────────────────────────────
export const updateCategory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) throw new AppError('Category not found.', 404);

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'UPDATE_CATEGORY',
    resource: 'category',
    resourceId: id,
    details: { fields: Object.keys(req.body) },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, category, 'Category updated successfully');
});

// ─── Delete Category ───────────────────────────────────────────────────────────
export const deleteCategory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found.', 404);

  if (category.serviceCount > 0) {
    throw new AppError(
      `Cannot delete category with ${category.serviceCount} services. Reassign services first.`,
      400
    );
  }

  await Category.findByIdAndDelete(id);

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'DELETE_CATEGORY',
    resource: 'category',
    resourceId: id,
    details: { name: category.name },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, null, 'Category deleted successfully');
});
