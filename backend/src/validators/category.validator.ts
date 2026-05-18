import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    parentCategory: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    order: z.number().min(0).optional().default(0),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    parentCategory: z.string().optional(),
    isActive: z.boolean().optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    order: z.number().min(0).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
