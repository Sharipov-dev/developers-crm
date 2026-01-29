import { z } from 'zod';

export const companySizeSchema = z.enum(['solo', '1-10', '11-50', '51-200', '200+']);

const urlSchema = z
  .string()
  .max(255, 'Website must be at most 255 characters')
  .refine(
    (val) => {
      if (!val) {
        return true;
      }
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL format' }
  )
  .optional();

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  website: urlSchema,
  industry: z.string().max(80, 'Industry must be at most 80 characters').optional(),
  size: companySizeSchema.optional(),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
});

export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(120, 'Name must be at most 120 characters')
    .optional(),
  website: z
    .string()
    .max(255, 'Website must be at most 255 characters')
    .refine(
      (val) => {
        if (!val) {
          return true;
        }
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL format' }
    )
    .nullable()
    .optional(),
  industry: z.string().max(80, 'Industry must be at most 80 characters').nullable().optional(),
  size: companySizeSchema.nullable().optional(),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').nullable().optional(),
});

export const companySortSchema = z.enum([
  'createdAt_desc',
  'createdAt_asc',
  'name_asc',
  'name_desc',
]);

export const listCompaniesQuerySchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
  size: companySizeSchema.optional(),
  sort: companySortSchema.default('createdAt_desc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQueryDto = z.infer<typeof listCompaniesQuerySchema>;
export type CompanySortDto = z.infer<typeof companySortSchema>;

export interface CompanyResponseDto {
  id: string;
  userId: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCompaniesResponseDto {
  items: CompanyResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}
