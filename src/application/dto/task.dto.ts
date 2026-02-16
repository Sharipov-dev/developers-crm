import { z } from 'zod';

export const taskStatusSchema = z.enum(['open', 'done', 'canceled']);

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskSortSchema = z.enum(['dueAt_asc', 'dueAt_desc', 'createdAt_desc']).default('dueAt_asc');

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160, 'Title must be at most 160 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  dueAt: z.coerce.date().optional(),
  status: taskStatusSchema.default('open'),
  priority: taskPrioritySchema.default('medium'),
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  dealId: z.string().uuid('Invalid deal ID format').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160, 'Title must be at most 160 characters').optional(),
  description: z.string().max(2000, 'Description must be at most 2000 characters').nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  contactId: z.string().uuid('Invalid contact ID format').nullable().optional(),
  companyId: z.string().uuid('Invalid company ID format').nullable().optional(),
  dealId: z.string().uuid('Invalid deal ID format').nullable().optional(),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  contactId: z.string().uuid('Invalid contact ID format').optional(),
  companyId: z.string().uuid('Invalid company ID format').optional(),
  dealId: z.string().uuid('Invalid deal ID format').optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
  sort: taskSortSchema.default('dueAt_asc'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;

export interface TaskResponseDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  status: string;
  priority: string;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
