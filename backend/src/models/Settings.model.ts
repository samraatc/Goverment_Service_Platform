import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  group: string;
  label: string;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      default: 'string',
    },
    group: {
      type: String,
      required: true,
      trim: true,
      default: 'general',
    },
    label: {
      type: String,
      required: true,
    },
    description: { type: String },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// key unique index is declared inline via `unique: true` on the field.
SettingsSchema.index({ group: 1 });
SettingsSchema.index({ isPublic: 1 });

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
