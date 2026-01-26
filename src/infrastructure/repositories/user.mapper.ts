import type { User as PrismaUser } from '@prisma/client';

import type { User } from '../../domain/entities/user.entity.js';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  static toDomainList(prismaUsers: PrismaUser[]): User[] {
    return prismaUsers.map(UserMapper.toDomain);
  }
}
