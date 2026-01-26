import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').optional(),
}).refine((data) => data.email !== undefined || data.name !== undefined, {
  message: 'At least one field must be provided',
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
