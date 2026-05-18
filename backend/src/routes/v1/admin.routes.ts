import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  getAnalytics,
  getActivityLogs,
  getSettings,
  updateSettings,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getContactMessages,
  updateContactStatus,
} from '../../controllers/admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getUsers);
router.post('/users', authorize('super_admin', 'admin'), createUser);
router.put('/users/:id/role', authorize('super_admin'), updateUserRole);
router.put('/users/:id/toggle', authorize('super_admin'), toggleUserStatus);

// Analytics
router.get('/analytics', getAnalytics);

// Activity Logs
router.get('/logs', getActivityLogs);

// Settings
router.get('/settings', getSettings);
router.put('/settings', authorize('super_admin'), updateSettings);

// Advertisements
router.get('/advertisements', getAdvertisements);
router.post('/advertisements', createAdvertisement);
router.put('/advertisements/:id', updateAdvertisement);
router.delete('/advertisements/:id', authorize('super_admin'), deleteAdvertisement);

// Contact Messages
router.get('/messages', getContactMessages);
router.put('/messages/:id', updateContactStatus);

export default router;
