import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      enum: ['click', 'search', 'view', 'pageview'],
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
    searchQuery: {
      type: String,
      trim: true,
      lowercase: true,
    },
    country: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    referrer: { type: String },
    page: { type: String },
    sessionId: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

AnalyticsSchema.index({ type: 1 });
AnalyticsSchema.index({ service: 1 });
AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ country: 1 });
AnalyticsSchema.index({ searchQuery: 1 });
// TTL index: auto-delete analytics older than 1 year
AnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
