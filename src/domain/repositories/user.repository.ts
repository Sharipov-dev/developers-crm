import type { CreateUserData, UpdateUserData, User, UserStatus } from '../entities/user.entity.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  updateStatus(id: string, status: UserStatus): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
}
