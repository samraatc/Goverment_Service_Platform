// ─── MongoDB Initialization Script ───────────────────────────────────────────
// This script runs once when MongoDB is first initialized via Docker.
// It creates the application database user with the correct permissions.
// ─────────────────────────────────────────────────────────────────────────────

/* global db */
/* eslint-disable no-undef */

// Switch to the govservices database
db = db.getSiblingDB('govservices');

// Create application user with readWrite role
db.createUser({
  user: process.env.MONGO_APP_USER || 'govservices_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'govservices_pass_change_me',
  roles: [
    {
      role: 'readWrite',
      db: 'govservices',
    },
  ],
});

// ─── Create Core Collections with Validators ─────────────────────────────────

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'User full name - required string',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Valid email address - required',
        },
        role: {
          bsonType: 'string',
          enum: ['super_admin', 'admin', 'editor', 'user'],
          description: 'User role - must be one of the allowed values',
        },
        isActive: {
          bsonType: 'bool',
          description: 'Account active status',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'warn',
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100,
        },
        slug: {
          bsonType: 'string',
          pattern: '^[a-z0-9-]+$',
        },
        isActive: {
          bsonType: 'bool',
        },
        order: {
          bsonType: 'int',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'warn',
});

db.createCollection('services', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'url', 'country', 'category'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 200,
        },
        url: {
          bsonType: 'string',
          pattern: '^https?://',
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'approved', 'rejected'],
        },
        isVerified: {
          bsonType: 'bool',
        },
        isFeatured: {
          bsonType: 'bool',
        },
        isSponsored: {
          bsonType: 'bool',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'warn',
});

db.createCollection('blogs');
db.createCollection('analytics');
db.createCollection('activitylogs');
db.createCollection('advertisements');
db.createCollection('settings');
db.createCollection('contacts');

// ─── Create Indexes ───────────────────────────────────────────────────────────

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
db.users.createIndex({ role: 1, isActive: 1 }, { name: 'users_role_active' });
db.users.createIndex({ createdAt: -1 }, { name: 'users_created_desc' });

// Categories indexes
db.categories.createIndex({ slug: 1 }, { unique: true, name: 'categories_slug_unique' });
db.categories.createIndex({ isActive: 1, order: 1 }, { name: 'categories_active_order' });

// Services indexes
db.services.createIndex(
  { title: 'text', shortDescription: 'text', tags: 'text', description: 'text' },
  {
    weights: { title: 10, shortDescription: 5, tags: 3, description: 1 },
    name: 'services_text_search',
  }
);
db.services.createIndex({ slug: 1 }, { unique: true, name: 'services_slug_unique' });
db.services.createIndex({ country: 1, status: 1 }, { name: 'services_country_status' });
db.services.createIndex({ category: 1, status: 1 }, { name: 'services_category_status' });
db.services.createIndex({ status: 1, isFeatured: 1 }, { name: 'services_status_featured' });
db.services.createIndex({ status: 1, isSponsored: 1 }, { name: 'services_status_sponsored' });
db.services.createIndex({ clickCount: -1 }, { name: 'services_clicks_desc' });
db.services.createIndex({ viewCount: -1 }, { name: 'services_views_desc' });
db.services.createIndex({ createdAt: -1 }, { name: 'services_created_desc' });

// Analytics indexes
db.analytics.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000, name: 'analytics_ttl_1year' }
);
db.analytics.createIndex({ type: 1, createdAt: -1 }, { name: 'analytics_type_date' });
db.analytics.createIndex({ service: 1, type: 1 }, { name: 'analytics_service_type' });
db.analytics.createIndex({ country: 1, type: 1 }, { name: 'analytics_country_type' });

// Activity logs indexes
db.activitylogs.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000, name: 'activitylogs_ttl_90days' }
);
db.activitylogs.createIndex({ user: 1, createdAt: -1 }, { name: 'activitylogs_user_date' });

// Blogs indexes
db.blogs.createIndex({ slug: 1 }, { unique: true, name: 'blogs_slug_unique' });
db.blogs.createIndex({ status: 1, publishedAt: -1 }, { name: 'blogs_status_published' });
db.blogs.createIndex(
  { title: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, content: 1 }, name: 'blogs_text_search' }
);

// Settings indexes
db.settings.createIndex({ key: 1 }, { unique: true, name: 'settings_key_unique' });

// Contacts indexes
db.contacts.createIndex({ isRead: 1, createdAt: -1 }, { name: 'contacts_read_date' });
db.contacts.createIndex({ email: 1 }, { name: 'contacts_email' });

// Advertisements indexes
db.advertisements.createIndex({ placement: 1, isActive: 1 }, { name: 'ads_placement_active' });

print('✅ MongoDB initialization complete.');
print('   → Created database: govservices');
print('   → Created collections with validators');
print('   → Created all required indexes');
