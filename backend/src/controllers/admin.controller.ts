import { Response } from 'express';
import { User } from '../models/User.model';
import { Service } from '../models/Service.model';
import { Category } from '../models/Category.model';
import { Analytics } from '../models/Analytics.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { Blog } from '../models/Blog.model';
import { Advertisement } from '../models/Advertisement.model';
import { Settings } from '../models/Settings.model';
import { ContactMessage } from '../models/ContactMessage.model';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { paginate, parsePaginationQuery } from '../utils/pagination';
import { IAuthRequest, UserRole } from '../types';

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const [
    totalServices,
    publishedServices,
    pendingServices,
    totalUsers,
    totalCategories,
    totalBlogs,
    recentServices,
    brokenLinks,
    unreadMessages,
  ] = await Promise.all([
    Service.countDocuments(),
    Service.countDocuments({ status: 'published' }),
    Service.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Blog.countDocuments({ status: 'published' }),
    Service.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .select('title status verificationStatus clickCount createdAt'),
    Service.countDocuments({ verificationStatus: 'broken' }),
    ContactMessage.countDocuments({ status: 'unread' }),
  ]);

  // Top services by clicks (last 30 days)
  const topServices = await Service.find({ status: 'published' })
    .sort({ clickCount: -1 })
    .limit(5)
    .select('title slug clickCount viewCount country');

  // Analytics: last 7 days clicks
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const clicksLast7Days = await Analytics.countDocuments({
    type: 'click',
    createdAt: { $gte: sevenDaysAgo },
  });

  const searchesLast7Days = await Analytics.countDocuments({
    type: 'search',
    createdAt: { $gte: sevenDaysAgo },
  });

  return ApiResponse.success(res, {
    stats: {
      totalServices,
      publishedServices,
      pendingServices,
      totalUsers,
      totalCategories,
      totalBlogs,
      brokenLinks,
      unreadMessages,
      clicksLast7Days,
      searchesLast7Days,
    },
    recentServices,
    topServices,
  }, 'Dashboard stats retrieved');
});

// ─── Get All Users ─────────────────────────────────────────────────────────────
export const getUsers = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { role, isActive, search } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);

  const result = await paginate({
    model: User,
    query: filter,
    paginationQuery,
    select: '-password -refreshToken -__v',
    sort: { createdAt: -1 },
  });

  return ApiResponse.paginated(res, result, 'Users retrieved successfully');
});

// ─── Create User (admin/super_admin only) ─────────────────────────────────────
export const createUser = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }

  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor', 'user'];
  const assignedRole: UserRole = validRoles.includes(role) ? role : 'user';

  // Only super_admin can create other super_admins
  if (assignedRole === 'super_admin' && req.user?.role !== 'super_admin') {
    throw new AppError('Only a super admin can create another super admin.', 403);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('A user with this email already exists.', 409);

  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: assignedRole,
    isActive: true,
    isEmailVerified: true, // Admin-created users are pre-verified
  });

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'CREATE_USER',
    resource: 'user',
    resourceId: newUser._id,
    details: { email: newUser.email, role: newUser.role },
    ipAddress: req.ip,
  });

  const userObj = newUser.toJSON();
  return ApiResponse.created(res, userObj, 'User created successfully');
});

// ─── Update User Role ──────────────────────────────────────────────────────────
export const updateUserRole = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles: UserRole[] = ['super_admin', 'admin', 'editor', 'user'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role specified.', 400);
  }

  // Prevent changing own role
  if (id === req.user?.userId) {
    throw new AppError('You cannot change your own role.', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) throw new AppError('User not found.', 404);

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'UPDATE_USER_ROLE',
    resource: 'user',
    resourceId: id,
    details: { newRole: role, userEmail: user.email },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, user, 'User role updated successfully');
});

// ─── Toggle User Status ────────────────────────────────────────────────────────
export const toggleUserStatus = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;

  if (id === req.user?.userId) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found.', 404);

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    user: req.user?.userId,
    action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    resource: 'user',
    resourceId: id,
    ipAddress: req.ip,
  });

  return ApiResponse.success(
    res,
    { isActive: user.isActive },
    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

// ─── Get Analytics ─────────────────────────────────────────────────────────────
export const getAnalytics = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { period = '7d', type } = req.query as Record<string, string>;

  const periodMap: Record<string, number> = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = periodMap[period] || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const filter: Record<string, unknown> = { createdAt: { $gte: startDate } };
  if (type) filter.type = type;

  // Daily analytics breakdown
  const dailyStats = await Analytics.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Top search queries
  const topSearches = await Analytics.aggregate([
    { $match: { ...filter, type: 'search', searchQuery: { $exists: true } } },
    { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Country breakdown
  const countryStats = await Analytics.aggregate([
    { $match: { ...filter, country: { $exists: true } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Top services by clicks
  const topServiceClicks = await Analytics.aggregate([
    { $match: { ...filter, type: 'click', service: { $exists: true } } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'service',
      },
    },
    { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    { $project: { count: 1, 'service.title': 1, 'service.slug': 1 } },
  ]);

  return ApiResponse.success(res, {
    dailyStats,
    topSearches,
    countryStats,
    topServiceClicks,
  }, 'Analytics retrieved successfully');
});

// ─── Get Activity Logs ─────────────────────────────────────────────────────────
export const getActivityLogs = catchAsync(async (req: IAuthRequest, res: Response) => {
  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);

  const result = await paginate({
    model: ActivityLog,
    query: {},
    paginationQuery,
    populate: [{ path: 'user', select: 'name email role' }],
    sort: { createdAt: -1 },
  });

  return ApiResponse.paginated(res, result, 'Activity logs retrieved');
});

// ─── Settings CRUD ─────────────────────────────────────────────────────────────
export const getSettings = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { group } = req.query as { group?: string };
  const filter: Record<string, unknown> = {};
  if (group) filter.group = group;

  const settings = await Settings.find(filter);
  return ApiResponse.success(res, settings, 'Settings retrieved');
});

export const updateSettings = catchAsync(async (req: IAuthRequest, res: Response) => {
  const updates = req.body as Array<{ key: string; value: unknown }>;

  const results = await Promise.all(
    updates.map(({ key, value }) =>
      Settings.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: false }
      )
    )
  );

  await ActivityLog.create({
    user: req.user?.userId,
    action: 'UPDATE_SETTINGS',
    resource: 'settings',
    details: { keys: updates.map((u) => u.key) },
    ipAddress: req.ip,
  });

  return ApiResponse.success(res, results, 'Settings updated successfully');
});

// ─── Advertisement CRUD ────────────────────────────────────────────────────────
export const getAdvertisements = catchAsync(async (req: IAuthRequest, res: Response) => {
  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);
  const result = await paginate({
    model: Advertisement,
    query: {},
    paginationQuery,
    sort: { priority: -1, createdAt: -1 },
  });
  return ApiResponse.paginated(res, result, 'Advertisements retrieved');
});

export const createAdvertisement = catchAsync(async (req: IAuthRequest, res: Response) => {
  const ad = await Advertisement.create({ ...req.body, createdBy: req.user?.userId });
  return ApiResponse.created(res, ad, 'Advertisement created successfully');
});

export const updateAdvertisement = catchAsync(async (req: IAuthRequest, res: Response) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ad) throw new AppError('Advertisement not found.', 404);
  return ApiResponse.success(res, ad, 'Advertisement updated successfully');
});

export const deleteAdvertisement = catchAsync(async (req: IAuthRequest, res: Response) => {
  const ad = await Advertisement.findByIdAndDelete(req.params.id);
  if (!ad) throw new AppError('Advertisement not found.', 404);
  return ApiResponse.success(res, null, 'Advertisement deleted successfully');
});

// ─── Contact Messages ──────────────────────────────────────────────────────────
export const getContactMessages = catchAsync(async (req: IAuthRequest, res: Response) => {
  const paginationQuery = parsePaginationQuery(req.query as Record<string, string>);
  const result = await paginate({
    model: ContactMessage,
    query: {},
    paginationQuery,
    sort: { createdAt: -1 },
  });
  return ApiResponse.paginated(res, result, 'Contact messages retrieved');
});

export const updateContactStatus = catchAsync(async (req: IAuthRequest, res: Response) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, repliedBy: req.user?.userId, repliedAt: new Date() },
    { new: true }
  );
  if (!msg) throw new AppError('Message not found.', 404);
  return ApiResponse.success(res, msg, 'Message status updated');
});
