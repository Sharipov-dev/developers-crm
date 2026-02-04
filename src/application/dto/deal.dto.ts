import { z } from 'zod';

export const dealStageSchema = z.enum([
  'lead',
  'discovery',
  'proposal',
  'negotiation',
  'won',
  'lost',
]);

export const createDealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  stage: dealStageSchema.default('lead'),
  valueCents: z.number().int('Value must be an integer').min(0, 'Value must be >= 0').optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter uppercase code')
    .default('CAD'),
  probability: z
    .number()
    .int('Probability must be an integer')
    .min(0, 'Probability must be >= 0')
    .max(100, 'Probability must be <= 100')
    .optional(),
  expectedCloseDate: z.coerce.date().optional(),
});

export const updateDealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be at most 120 characters').optional(),
  contactId: z.string().uuid('Invalid contact ID format').nullable().optional(),
  companyId: z.string().uuid('Invalid company ID format').nullable().optional(),
  stage: dealStageSchema.optional(),
  valueCents: z.number().int('Value must be an integer').min(0, 'Value must be >= 0').nullable().optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter uppercase code')
    .optional(),
  probability: z
    .number()
    .int('Probability must be an integer')
    .min(0, 'Probability must be >= 0')
    .max(100, 'Probability must be <= 100')
    .nullable()
    .optional(),
  expectedCloseDate: z.coerce.date().nullable().optional(),
  lostReason: z.string().max(300, 'Lost reason must be at most 300 characters').nullable().optional(),
});

export const markLostSchema = z.object({
  lostReason: z
    .string()
    .min(3, 'Lost reason must be at least 3 characters')
    .max(300, 'Lost reason must be at most 300 characters'),
});

export const dealSortSchema = z.enum([
  'updatedAt_desc',
  'createdAt_desc',
  'value_desc',
  'expectedCloseDate_asc',
]);

export const listDealsQuerySchema = z.object({
  q: z.string().optional(),
  stage: dealStageSchema.optional(),
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  minValueCents: z.coerce.number().int().min(0).optional(),
  maxValueCents: z.coerce.number().int().min(0).optional(),
  expectedCloseFrom: z.coerce.date().optional(),
  expectedCloseTo: z.coerce.date().optional(),
  sort: dealSortSchema.default('updatedAt_desc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export type UpdateDealDto = z.infer<typeof updateDealSchema>;
export type MarkLostDto = z.infer<typeof markLostSchema>;
export type ListDealsQueryDto = z.infer<typeof listDealsQuerySchema>;
export type DealSortDto = z.infer<typeof dealSortSchema>;

export interface DealResponseDto {
  id: string;
  userId: string;
  title: string;
  contactId: string | null;
  companyId: string | null;
  stage: string;
  valueCents: number | null;
  currency: string;
  probability: number | null;
  expectedCloseDate: string | null;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
}
