import '../config/env';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { ENV } from '../config/env';
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { Settings } from '../models/Settings.model';
import { logger } from './logger';

// Slugs are pre-computed here because findOneAndUpdate bypasses Mongoose
// pre-save hooks, so the auto-slug middleware on the model never fires.
const makeSlug = (name: string) => slugify(name, { lower: true, strict: true });

const CATEGORIES = [
  { name: 'Healthcare',      slug: makeSlug('Healthcare'),      icon: 'heart-pulse',    color: '#EF4444', description: 'Health and medical services', order: 1 },
  { name: 'Education',       slug: makeSlug('Education'),       icon: 'graduation-cap', color: '#3B82F6', description: 'Educational services and scholarships', order: 2 },
  { name: 'Taxation',        slug: makeSlug('Taxation'),        icon: 'receipt',        color: '#F59E0B', description: 'Tax filing and revenue services', order: 3 },
  { name: 'Immigration',     slug: makeSlug('Immigration'),     icon: 'plane',          color: '#8B5CF6', description: 'Visa, passport and immigration services', order: 4 },
  { name: 'Employment',      slug: makeSlug('Employment'),      icon: 'briefcase',      color: '#10B981', description: 'Job search and employment services', order: 5 },
  { name: 'Housing',         slug: makeSlug('Housing'),         icon: 'home',           color: '#F97316', description: 'Housing, property and real estate services', order: 6 },
  { name: 'Transportation',  slug: makeSlug('Transportation'),  icon: 'car',            color: '#06B6D4', description: 'Driving, transit and transport services', order: 7 },
  { name: 'Social Security', slug: makeSlug('Social Security'), icon: 'shield',         color: '#6366F1', description: 'Social security and welfare services', order: 8 },
  { name: 'Business',        slug: makeSlug('Business'),        icon: 'building',       color: '#84CC16', description: 'Business registration and licensing', order: 9 },
  { name: 'Environment',     slug: makeSlug('Environment'),     icon: 'leaf',           color: '#22C55E', description: 'Environmental and sustainability services', order: 10 },
  { name: 'Legal',           slug: makeSlug('Legal'),           icon: 'scale',          color: '#64748B', description: 'Legal aid and court services', order: 11 },
  { name: 'Finance',         slug: makeSlug('Finance'),         icon: 'landmark',       color: '#0EA5E9', description: 'Banking and financial services', order: 12 },
];

const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'GovServices Platform', type: 'string', group: 'general', label: 'Site Name', isPublic: true },
  { key: 'site_description', value: 'Your centralized hub for verified government services', type: 'string', group: 'general', label: 'Site Description', isPublic: true },
  { key: 'site_url', value: 'https://govservices.com', type: 'string', group: 'general', label: 'Site URL', isPublic: true },
  { key: 'contact_email', value: 'contact@govservices.com', type: 'string', group: 'general', label: 'Contact Email', isPublic: true },
  { key: 'services_per_page', value: 12, type: 'number', group: 'display', label: 'Services Per Page', isPublic: true },
  { key: 'enable_adsense', value: false, type: 'boolean', group: 'monetization', label: 'Enable Google AdSense', isPublic: false },
  { key: 'adsense_publisher_id', value: '', type: 'string', group: 'monetization', label: 'AdSense Publisher ID', isPublic: false },
  { key: 'maintenance_mode', value: false, type: 'boolean', group: 'system', label: 'Maintenance Mode', isPublic: false },
  { key: 'allow_registration', value: true, type: 'boolean', group: 'auth', label: 'Allow Public Registration', isPublic: false },
  { key: 'google_analytics_id', value: '', type: 'string', group: 'seo', label: 'Google Analytics ID', isPublic: true },
];

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding...');

    // Upsert super admin — always sync name, role, and password to the current
    // .env values so re-running the seeder after changing SUPER_ADMIN_PASSWORD
    // works correctly. We use findOne + save() so the bcrypt pre-save hook fires.
    const existingAdmin = await User.findOne({ email: ENV.SUPER_ADMIN_EMAIL }).select('+password');
    if (!existingAdmin) {
      await User.create({
        name: ENV.SUPER_ADMIN_NAME || 'Super Admin',
        email: ENV.SUPER_ADMIN_EMAIL,
        password: ENV.SUPER_ADMIN_PASSWORD,
        role: 'super_admin',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`Super admin created: ${ENV.SUPER_ADMIN_EMAIL}`);
    } else {
      // Always update password/role to match current env — triggers bcrypt hook
      existingAdmin.name = ENV.SUPER_ADMIN_NAME || 'Super Admin';
      existingAdmin.password = ENV.SUPER_ADMIN_PASSWORD;
      existingAdmin.role = 'super_admin';
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      logger.info(`Super admin updated: ${ENV.SUPER_ADMIN_EMAIL}`);
    }

    // Seed categories — use $set so findOneAndUpdate doesn't replace the document,
    // and setDefaultsOnInsert so default fields (isActive, serviceCount, etc.) are
    // populated on first insert.
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: cat },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info(`${CATEGORIES.length} categories seeded`);

    // Seed settings
    for (const setting of DEFAULT_SETTINGS) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        { $set: setting },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info(`${DEFAULT_SETTINGS.length} settings seeded`);

    logger.info('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error}`);
    process.exit(1);
  }
};

seed();
