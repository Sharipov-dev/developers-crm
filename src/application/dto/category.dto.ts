import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  parentId: z.string().uuid('Invalid parentId format').nullable().optional(),
  sortOrder: z.number().int().min(0, 'Sort order must be at least 0').default(0),
  icon: z.string().max(50, 'Icon must be at most 50 characters').optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Color must be a valid hex color (#RRGGBB)').optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').optional(),
  parentId: z.string().uuid('Invalid parentId format').nullable().optional(),
  sortOrder: z.number().int().min(0, 'Sort order must be at least 0').optional(),
  icon: z.string().max(50, 'Icon must be at most 50 characters').optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Color must be a valid hex color (#RRGGBB)').optional().nullable(),
});

export const listCategoriesQuerySchema = z.object({
  parentId: z.string().uuid('Invalid parentId format').nullable().optional(),
  includeChildren: z.coerce.boolean().default(false),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQueryDto = z.infer<typeof listCategoriesQuerySchema>;

export interface CategoryResponseDto {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  children?: CategoryResponseDto[];
}

export interface PaginatedCategoriesResponseDto {
  items: CategoryResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}
