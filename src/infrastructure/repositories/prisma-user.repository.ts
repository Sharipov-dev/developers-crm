import type { PrismaClient } from '@prisma/client';

import type { CreateUserData, UpdateUserData, User, UserStatus } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

import { UserMapper } from './user.mapper.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
      },
    });

    return UserMapper.toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
      },
    });

    return UserMapper.toDomain(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return UserMapper.toDomain(user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }
}
