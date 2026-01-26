import type { User as PrismaUser, UserStatus as PrismaUserStatus } from '@prisma/client';

import type { User, UserStatus } from '../../domain/entities/user.entity.js';

function mapStatus(status: PrismaUserStatus): UserStatus {
  return status === 'active' ? 'active' : 'disabled';
}

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      displayName: prismaUser.displayName,
      status: mapStatus(prismaUser.status),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  static toDomainList(prismaUsers: PrismaUser[]): User[] {
    return prismaUsers.map(UserMapper.toDomain);
  }
}
