import { z } from 'zod';

export const interactionTypeSchema = z.enum([
  'call',
  'meeting',
  'email',
  'message',
  'demo',
  'note',
]);

export const createInteractionSchema = z.object({
  type: interactionTypeSchema,
  occurredAt: z.coerce.date(),
  summary: z.string().min(1, 'Summary is required').max(2000, 'Summary must be at most 2000 characters'),
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  dealId: z.string().uuid('Invalid deal ID format').optional(),
});

export const updateInteractionSchema = z.object({
  type: interactionTypeSchema.optional(),
  occurredAt: z.coerce.date().optional(),
  summary: z.string().min(1, 'Summary is required').max(2000, 'Summary must be at most 2000 characters').optional(),
  contactId: z.string().uuid('Invalid contact ID format').nullable().optional(),
  companyId: z.string().uuid('Invalid company ID format').nullable().optional(),
  dealId: z.string().uuid('Invalid deal ID format').nullable().optional(),
});

export const listInteractionsQuerySchema = z.object({
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  dealId: z.string().uuid('Invalid deal ID format').optional(),
  type: interactionTypeSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInteractionDto = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionDto = z.infer<typeof updateInteractionSchema>;
export type ListInteractionsQueryDto = z.infer<typeof listInteractionsQuerySchema>;

export interface InteractionResponseDto {
  id: string;
  userId: string;
  type: string;
  occurredAt: string;
  summary: string;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
}
