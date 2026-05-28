// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string | null;
  isActive: boolean;
  serviceCount: number;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export type ServiceStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type VerificationStatus = 'unverified' | 'verified' | 'broken';

export interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  officialUrl: string;
  category: Category | string;
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
  createdBy?: Partial<User>;
  approvedBy?: Partial<User>;
  approvedAt?: string;
  lastVerifiedAt?: string;
  sponsorPriority: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: Partial<User>;
  category?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  isFeature: boolean;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Advertisement ────────────────────────────────────────────────────────────
export interface Advertisement {
  _id: string;
  name: string;
  type: 'banner' | 'sidebar' | 'inline' | 'featured' | 'sponsored';
  imageUrl?: string;
  targetUrl: string;
  htmlCode?: string;
  placement: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  impressionCount: number;
  clickCount: number;
  priority: number;
  countries?: string[];
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
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

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  stats: {
    totalServices: number;
    publishedServices: number;
    pendingServices: number;
    totalUsers: number;
    totalCategories: number;
    totalBlogs: number;
    brokenLinks: number;
    unreadMessages: number;
    clicksLast7Days: number;
    searchesLast7Days: number;
  };
  recentServices: Service[];
  topServices: Service[];
}

// ─── Filter Params ────────────────────────────────────────────────────────────
export interface ServiceFilters extends PaginationParams {
  category?: string;
  country?: string;
  status?: string;
  verificationStatus?: string;
  isFeatured?: boolean;
  isSponsored?: boolean;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark' | 'system';
