import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email must be at most 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().max(80, 'Display name must be at most 80 characters').optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(80, 'Display name must be at most 80 characters').optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export interface UserResponseDto {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
