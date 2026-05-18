import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    shortDescription: z.string().max(300).optional(),
    officialUrl: z.string().url('Please provide a valid URL'),
    category: z.string().min(1, 'Category is required'),
    country: z.string().min(1, 'Country is required'),
    countryCode: z.string().min(2).max(3).toUpperCase(),
    state: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    seoKeywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional().or(z.literal('')),
    isFeatured: z.boolean().optional().default(false),
    isSponsored: z.boolean().optional().default(false),
    sponsorPriority: z.number().min(0).optional().default(0),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    shortDescription: z.string().max(300).optional(),
    officialUrl: z.string().url().optional(),
    category: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().min(2).max(3).toUpperCase().optional(),
    state: z.string().optional(),
    status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']).optional(),
    verificationStatus: z.enum(['unverified', 'verified', 'broken']).optional(),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    seoKeywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isSponsored: z.boolean().optional(),
    sponsorPriority: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const serviceQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    country: z.string().optional(),
    status: z.string().optional(),
    verificationStatus: z.string().optional(),
    isFeatured: z.string().optional(),
    isSponsored: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
