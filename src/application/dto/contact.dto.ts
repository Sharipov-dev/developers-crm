import { z } from 'zod';

export const contactSourceSchema = z.enum([
  'freelance',
  'inbound',
  'referral',
  'linkedin',
  'cold',
  'other',
]);

export const contactStatusSchema = z.enum([
  'lead',
  'contacted',
  'qualified',
  'customer',
  'inactive',
]);

export const createContactSchema = z.object({
  companyId: z.string().uuid('Invalid company ID format').optional(),
  firstName: z.string().max(60, 'First name must be at most 60 characters').optional(),
  lastName: z.string().max(60, 'Last name must be at most 60 characters').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email must be at most 255 characters').optional(),
  phone: z.string().max(40, 'Phone must be at most 40 characters').optional(),
  title: z.string().max(80, 'Title must be at most 80 characters').optional(),
  source: contactSourceSchema.optional(),
  status: contactStatusSchema.default('lead'),
});

export const updateContactSchema = z.object({
  companyId: z.string().uuid('Invalid company ID format').nullable().optional(),
  firstName: z.string().max(60, 'First name must be at most 60 characters').nullable().optional(),
  lastName: z.string().max(60, 'Last name must be at most 60 characters').nullable().optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .nullable()
    .optional(),
  phone: z.string().max(40, 'Phone must be at most 40 characters').nullable().optional(),
  title: z.string().max(80, 'Title must be at most 80 characters').nullable().optional(),
  source: contactSourceSchema.nullable().optional(),
  status: contactStatusSchema.optional(),
});

export const contactSortSchema = z.enum([
  'createdAt_desc',
  'createdAt_asc',
  'lastContactedAt_desc',
  'name_asc',
  'name_desc',
]);

export const listContactsQuerySchema = z.object({
  q: z.string().optional(),
  status: contactStatusSchema.optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  source: contactSourceSchema.optional(),
  sort: contactSortSchema.default('createdAt_desc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateContactDto = z.infer<typeof createContactSchema>;
export type UpdateContactDto = z.infer<typeof updateContactSchema>;
export type ListContactsQueryDto = z.infer<typeof listContactsQuerySchema>;
export type ContactSortDto = z.infer<typeof contactSortSchema>;

export interface ContactResponseDto {
  id: string;
  userId: string;
  companyId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  source: string | null;
  status: string;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContactsResponseDto {
  items: ContactResponseDto[];
  page: number;
  pageSize: number;
  total: number;
}
