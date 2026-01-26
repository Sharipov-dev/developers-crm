import type { PrismaClient } from '@prisma/client';

import type { CreateUserData, UpdateUserData, User } from '../../domain/entities/user.entity.js';
import type { FindAllOptions, UserRepository } from '../../domain/repositories/user.repository.js';

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

  async findAll(options?: FindAllOptions): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      ...(options?.skip !== undefined && { skip: options.skip }),
      ...(options?.take !== undefined && { take: options.take }),
      orderBy: { createdAt: 'desc' },
    });

    return UserMapper.toDomainList(users);
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(data: CreateUserData): Promise<User> {
    // Example of transaction usage (even though single operation here)
    // This demonstrates the pattern for more complex operations
    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });
    });

    return UserMapper.toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    return UserMapper.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });

    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }
}
