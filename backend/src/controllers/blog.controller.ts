import { Request, Response } from 'express';
import { Blog } from '../models/Blog.model';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { paginate, parsePaginationQuery } from '../utils/pagination';
import { IAuthRequest } from '../types';

// ─── Get All Published Blogs (Public) ──────────────────────────────────────────
export const getBlogs = catchAsync(async (req: Request, res: Response) => {
  const { category, tag, search } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);

  const result = await paginate({
    model: Blog,
    query: filter,
    paginationQuery,
    populate: [{ path: 'author', select: 'name avatar' }],
    select: '-content',
    sort: { publishedAt: -1 },
  });

  return ApiResponse.paginated(res, result, 'Blogs retrieved successfully');
});

// ─── Get Blog by Slug ──────────────────────────────────────────────────────────
export const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' }).populate(
    'author',
    'name avatar'
  );

  if (!blog) throw new AppError('Blog post not found.', 404);

  blog.viewCount += 1;
  await blog.save({ validateBeforeSave: false });

  return ApiResponse.success(res, blog, 'Blog retrieved successfully');
});

// ─── Create Blog ───────────────────────────────────────────────────────────────
export const createBlog = catchAsync(async (req: IAuthRequest, res: Response) => {
  const blog = await Blog.create({ ...req.body, author: req.user?.userId });
  return ApiResponse.created(res, blog, 'Blog created successfully');
});

// ─── Update Blog ───────────────────────────────────────────────────────────────
export const updateBlog = catchAsync(async (req: IAuthRequest, res: Response) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!blog) throw new AppError('Blog not found.', 404);
  return ApiResponse.success(res, blog, 'Blog updated successfully');
});

// ─── Delete Blog ───────────────────────────────────────────────────────────────
export const deleteBlog = catchAsync(async (req: IAuthRequest, res: Response) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new AppError('Blog not found.', 404);
  return ApiResponse.success(res, null, 'Blog deleted successfully');
});

// ─── Get All Blogs (Admin) ─────────────────────────────────────────────────────
export const getAllBlogsAdmin = catchAsync(async (req: IAuthRequest, res: Response) => {
  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);
  const result = await paginate({
    model: Blog,
    query: {},
    paginationQuery,
    populate: [{ path: 'author', select: 'name email' }],
    sort: { createdAt: -1 },
  });
  return ApiResponse.paginated(res, result, 'All blogs retrieved');
});
