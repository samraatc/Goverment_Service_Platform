import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IBlog } from '../types';

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFeature: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      maxlength: [70, 'SEO title cannot exceed 70 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// slug unique index is declared inline via `unique: true` on the field
BlogSchema.index({ status: 1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ isFeature: 1 });
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

BlogSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();
  let slug = slugify(this.title, { lower: true, strict: true });
  const BlogModel = mongoose.model('Blog');
  const count = await BlogModel.countDocuments({ slug: new RegExp(`^${slug}`) });
  if (count > 0) slug = `${slug}-${count + 1}`;
  this.slug = slug;
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
