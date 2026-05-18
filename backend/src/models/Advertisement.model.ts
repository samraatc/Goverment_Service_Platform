import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdvertisement extends Document {
  _id: Types.ObjectId;
  name: string;
  type: 'banner' | 'sidebar' | 'inline' | 'featured' | 'sponsored';
  imageUrl?: string;
  targetUrl: string;
  htmlCode?: string;
  placement: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  impressionCount: number;
  clickCount: number;
  priority: number;
  countries?: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    name: {
      type: String,
      required: [true, 'Advertisement name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['banner', 'sidebar', 'inline', 'featured', 'sponsored'],
      required: true,
    },
    imageUrl: { type: String },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
    },
    htmlCode: { type: String },
    placement: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    impressionCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    countries: [{ type: String }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

AdvertisementSchema.index({ isActive: 1, type: 1 });
AdvertisementSchema.index({ placement: 1 });
AdvertisementSchema.index({ priority: -1 });

export const Advertisement = mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
