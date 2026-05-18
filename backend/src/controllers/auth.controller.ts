import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { ActivityLog } from '../models/ActivityLog.model';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { IAuthRequest } from '../types';
import { ENV } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.IS_PRODUCTION,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Register ──────────────────────────────────────────────────────────────────
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email: email.toLowerCase(), password });

  const payload = { userId: user._id.toString(), email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return ApiResponse.created(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  }, 'Account created successfully');
});

// ─── Login ─────────────────────────────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const payload = { userId: user._id.toString(), email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokenPair(payload);

  // Update user login info
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  // Log activity
  await ActivityLog.create({
    user: user._id,
    action: 'LOGIN',
    resource: 'auth',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return ApiResponse.success(res, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
    },
    accessToken,
  }, 'Login successful');
});

// ─── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    throw new AppError('Refresh token is required.', 401);
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const payload = { userId: user._id.toString(), email: user.email, role: user.role };
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  return ApiResponse.success(res, { accessToken }, 'Token refreshed successfully');
});

// ─── Logout ────────────────────────────────────────────────────────────────────
export const logout = catchAsync(async (req: IAuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });

    await ActivityLog.create({
      user: req.user.userId,
      action: 'LOGOUT',
      resource: 'auth',
      ipAddress: req.ip,
    });
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  return ApiResponse.success(res, null, 'Logged out successfully');
});

// ─── Get Current User ──────────────────────────────────────────────────────────
export const getMe = catchAsync(async (req: IAuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', 404);

  return ApiResponse.success(res, user, 'User profile retrieved');
});

// ─── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?.userId,
    { name, avatar },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError('User not found.', 404);

  return ApiResponse.success(res, user, 'Profile updated successfully');
});

// ─── Change Password ───────────────────────────────────────────────────────────
export const changePassword = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.userId).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 401);
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password changed successfully');
});
