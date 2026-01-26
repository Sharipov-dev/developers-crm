import type { CreateUserData, UpdateUserData, User } from '../entities/user.entity.js';

export interface FindAllOptions {
  skip?: number | undefined;
  take?: number | undefined;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options?: FindAllOptions): Promise<User[]>;
  count(): Promise<number>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
