import api from './axios';
import { PaginatedResponse, Service, ServiceFilters, ApiResponse } from '../types';

export const servicesApi = {
  getAll: (params?: ServiceFilters) =>
    api.get<PaginatedResponse<Service>>('/services', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Service>>(`/services/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Service>>(`/services/${slug}`),

  getTrending: () =>
    api.get<ApiResponse<Service[]>>('/services/trending'),

  getSuggestions: (q: string) =>
    api.get<ApiResponse<Service[]>>('/services/suggestions', { params: { q } }),

  trackClick: (id: string) =>
    api.post<ApiResponse>(`/services/${id}/click`),

  create: (data: Partial<Service>) =>
    api.post<ApiResponse<Service>>('/services', data),

  update: (id: string, data: Partial<Service>) =>
    api.put<ApiResponse<Service>>(`/services/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/services/${id}`),

  approve: (id: string, action: 'approve' | 'reject') =>
    api.put<ApiResponse<Service>>(`/services/${id}/approve`, { action }),
};

export const categoriesApi = {
  getAll: (params?: { flat?: boolean; active?: boolean }) =>
    api.get('/categories', { params }),

  getById: (id: string) =>
    api.get(`/categories/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/categories', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};

export const blogsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/blogs', { params }),

  getBySlug: (slug: string) =>
    api.get(`/blogs/slug/${slug}`),

  getAllAdmin: (params?: Record<string, unknown>) =>
    api.get('/blogs/admin/all', { params }),

  create: (data: Record<string, unknown>) =>
    api.post('/blogs', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/blogs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/blogs/${id}`),
};

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),

  createUser: (data: Record<string, unknown>) =>
    api.post('/admin/users', data),

  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),

  toggleUserStatus: (id: string) =>
    api.put(`/admin/users/${id}/toggle`),

  getAnalytics: (params?: Record<string, unknown>) =>
    api.get('/admin/analytics', { params }),

  getLogs: (params?: Record<string, unknown>) =>
    api.get('/admin/logs', { params }),

  getSettings: (group?: string) =>
    api.get('/admin/settings', { params: { group } }),

  updateSettings: (updates: Array<{ key: string; value: unknown }>) =>
    api.put('/admin/settings', updates),

  getAds: (params?: Record<string, unknown>) =>
    api.get('/admin/advertisements', { params }),

  createAd: (data: Record<string, unknown>) =>
    api.post('/admin/advertisements', data),

  updateAd: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/advertisements/${id}`, data),

  deleteAd: (id: string) =>
    api.delete(`/admin/advertisements/${id}`),

  getMessages: (params?: Record<string, unknown>) =>
    api.get('/admin/messages', { params }),

  updateMessageStatus: (id: string, status: string) =>
    api.put(`/admin/messages/${id}`, { status }),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    api.put('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  refresh: () =>
    api.post('/auth/refresh'),
};

export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact', data),
};
