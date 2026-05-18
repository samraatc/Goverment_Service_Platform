import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IAuthRequest extends Request {
  user?: ITokenPayload;
}

// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user';

export const USER_ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
};

// ─── Service Status ───────────────────────────────────────────────────────────
export type ServiceStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type VerificationStatus = 'unverified' | 'verified' | 'broken';

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

// ─── User Document ────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  loginCount: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Category Document ────────────────────────────────────────────────────────
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: Types.ObjectId;
  isActive: boolean;
  serviceCount: number;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Service Document ─────────────────────────────────────────────────────────
export interface IService extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  officialUrl: string;
  category: Types.ObjectId;
  country: string;
  countryCode: string;
  state?: string;
  status: ServiceStatus;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  isSponsored: boolean;
  tags: string[];
  clickCount: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImage?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  lastVerifiedAt?: Date;
  lastClickedAt?: Date;
  sponsorPriority: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Blog Document ────────────────────────────────────────────────────────────
export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: Types.ObjectId;
  category?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  isFeature: boolean;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Analytics Document ───────────────────────────────────────────────────────
export interface IAnalytics extends Document {
  _id: Types.ObjectId;
  type: 'click' | 'search' | 'view' | 'pageview';
  service?: Types.ObjectId;
  searchQuery?: string;
  country?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  page?: string;
  sessionId?: string;
  userId?: Types.ObjectId;
  createdAt: Date;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
