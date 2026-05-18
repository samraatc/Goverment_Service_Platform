import { Response } from 'express';
import { Service } from '../models/Service.model';
import { Analytics } from '../models/Analytics.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { Category } from '../models/Category.model';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { paginate, parsePaginationQuery } from '../utils/pagination';
import { IAuthRequest } from '../types';

// ─── Get All Services (Public) ─────────────────────────────────────────────────
export const getServices = catchAsync(async (req: IAuthRequest, res: Response) => {
  const {
    category, country, verificationStatus, isFeatured,
    isSponsored, status, search,
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};

  // Public users only see published services
  const isAdmin = ['super_admin', 'admin', 'editor'].includes(req.user?.role || '');
  if (!isAdmin) {
    filter.status = 'published';
  } else if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) filter.category = category;
  if (country) filter.countryCode = country.toUpperCase();
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isSponsored === 'true') filter.isSponsored = true;

  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);

  const result = await paginate({
    model: Service,
    query: filter,
    paginationQuery,
    populate: [{ path: 'category', select: 'name slug icon color' }],
    select: '-__v',
    sort: isSponsored === 'true'
      ? { sponsorPriority: -1, createdAt: -1 }
      : { createdAt: -1 },
  });

  // Track search analytics
  if (search) {
    await Analytics.create({
      type: 'search',
      searchQuery: search,
      country: req.headers['cf-ipcountry'] as string,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId,
    }).catch(() => null); // fire-and-forget
  }

  return ApiResponse.paginated(res, result, 'Services retrieved successfully');
});

// ─── Get Service by ID or Slug ─────────────────────────────────────────────────
export const getServiceById = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const service = await Service.findOne({
    $or: [{ _id: id }, { slug: id }],
  })
    .populate('category', 'name slug icon color')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');

  if (!service) throw new AppError('Service not found.', 404);

  const isAdmin = ['super_admin', 'admin', 'editor'].includes(req.user?.role || '');
  if (!isAdmin && service.status !== 'published') {
    throw new AppError('Service not found.', 404);
  }

  // Track view
  service.viewCount += 1;
  await service.save({ validateBeforeSave: false });

  await Analytics.create({
    type: 'view',
    service: service._id,
    country: req.headers['cf-ipcountry'] as string,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
  }).catch(() => null);

  return ApiResponse.success(res, service, 'Service retrieved successfully');
});

// ─── Track Click ───────────────────────────────────────────────────────────────
export const trackServiceClick = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const service = await Service.findByIdAndUpdate(
    id,
    { $inc: { clickCount: 1 }, lastClickedAt: new Date() },
    { new: true }
  );

  if (!service) throw new AppError('Service not found.', 404);

  await Analytics.create({
    type: 'click',
    service: service._id,
    country: req.headers['cf-ipcountry'] as string,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
  }).catch(() => null);

  return ApiResponse.success(res, { clickCount: service.clickCount }, 'Click tracked');
});

// ─── Create Service ────────────────────────────────────────────────────────────
export const createService = catchAsync(async (req: IAuthRequest, res: Response) => {
  const isEditor = req.user?.role === 'editor';

  const service = await Service.create({
    ...req.body,
    createdBy: req.user?.userId,
    status: isEditor ? 'draft' : req.body.status || 'draft',
  });

  // Update category service count
  await Category.findByIdAndUpdate(service.category, { $inc: { serviceCount: 1 } });

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'CREATE_SERVICE',
    resource: 'service',
    resourceId: service._id.toString(),
    details: { title: service.title },
    ipAddress: req.ip,
  });

  return ApiResponse.created(res, service, 'Service created successfully');
});

// ─── Update Service ────────────────────────────────────────────────────────────
export const updateService = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const isEditor = req.user?.role === 'editor';

  const service = await Service.findById(id);
  if (!service) throw new AppError('Service not found.', 404);

  // Editors cannot publish
  if (isEditor && req.body.status === 'published') {
    throw new AppError('Editors cannot publish services directly.', 403);
  }

  const updated = await Service.findByIdAndUpdate(
    id,
    { ...req.body, updatedBy: req.user?.userId },
    { new: true, runValidators: true }
  ).populate('category', 'name slug');

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'UPDATE_SERVICE',
    resource: 'service',
    resourceId: id,
    details: { fields: Object.keys(req.body) },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, updated, 'Service updated successfully');
});

// ─── Delete Service ────────────────────────────────────────────────────────────
export const deleteService = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  const service = await Service.findByIdAndDelete(id);
  if (!service) throw new AppError('Service not found.', 404);

  // Decrement category count
  await Category.findByIdAndUpdate(service.category, { $inc: { serviceCount: -1 } });

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'DELETE_SERVICE',
    resource: 'service',
    resourceId: id,
    details: { title: service.title },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, null, 'Service deleted successfully');
});

// ─── Approve/Reject Service ────────────────────────────────────────────────────
export const approveService = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' | 'reject'

  const status = action === 'approve' ? 'published' : 'rejected';

  const service = await Service.findByIdAndUpdate(
    id,
    {
      status,
      approvedBy: req.user?.userId,
      approvedAt: new Date(),
      updatedBy: req.user?.userId,
    },
    { new: true }
  );

  if (!service) throw new AppError('Service not found.', 404);

  await ActivityLog.create({
    user: req.user?.userId,
    action: action === 'approve' ? 'APPROVE_SERVICE' : 'REJECT_SERVICE',
    resource: 'service',
    resourceId: id,
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, service, `Service ${action}d successfully`);
});

// ─── Get Trending Services ─────────────────────────────────────────────────────
export const getTrendingServices = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const services = await Service.find({ status: 'published' })
    .sort({ clickCount: -1, viewCount: -1 })
    .limit(10)
    .populate('category', 'name slug icon')
    .select('title slug shortDescription country category clickCount viewCount verificationStatus');

  return ApiResponse.success(res, services, 'Trending services retrieved');
});

// ─── Search Suggestions ────────────────────────────────────────────────────────
export const getSearchSuggestions = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { q } = req.query as { q: string };

  if (!q || q.length < 2) {
    return ApiResponse.success(res, [], 'No suggestions');
  }

  const services = await Service.find({
    status: 'published',
    $text: { $search: q },
  })
    .limit(8)
    .select('title slug country category')
    .populate('category', 'name slug');

  return ApiResponse.success(res, services, 'Suggestions retrieved');
});
