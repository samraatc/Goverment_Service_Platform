import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IService } from '../types';

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    officialUrl: {
      type: String,
      required: [true, 'Official URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      uppercase: true,
      maxlength: 3,
    },
    state: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
      default: 'draft',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'broken'],
      default: 'unverified',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    clickCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    seoTitle: {
      type: String,
      maxlength: [70, 'SEO title cannot exceed 70 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
    seoKeywords: [{ type: String }],
    ogImage: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
    lastVerifiedAt: { type: Date },
    lastClickedAt: { type: Date },
    sponsorPriority: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance — slug unique index is declared inline via `unique: true`
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ country: 1 });
ServiceSchema.index({ countryCode: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ verificationStatus: 1 });
ServiceSchema.index({ isFeatured: 1 });
ServiceSchema.index({ isSponsored: 1, sponsorPriority: -1 });
ServiceSchema.index({ clickCount: -1 });
ServiceSchema.index({ createdAt: -1 });
ServiceSchema.index({ tags: 1 });

// Full-text search index
ServiceSchema.index(
  { title: 'text', description: 'text', shortDescription: 'text', tags: 'text' },
  { weights: { title: 10, shortDescription: 5, tags: 3, description: 1 } }
);

// Auto-generate unique slug
ServiceSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  let slug = slugify(this.title, { lower: true, strict: true });
  const ServiceModel = mongoose.model('Service');
  const existingCount = await ServiceModel.countDocuments({ slug: new RegExp(`^${slug}`) });
  if (existingCount > 0) {
    slug = `${slug}-${existingCount + 1}`;
  }
  this.slug = slug;
  next();
});

export const Service = mongoose.model<IService>('Service', ServiceSchema);
