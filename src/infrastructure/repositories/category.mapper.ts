import type { Category as PrismaCategory } from '@prisma/client';

import type { Category } from '../../domain/entities/category.entity.js';

export class CategoryMapper {
  static toDomain(prismaCategory: PrismaCategory): Category {
    return {
      id: prismaCategory.id,
      userId: prismaCategory.userId,
      name: prismaCategory.name,
      parentId: prismaCategory.parentId,
      sortOrder: prismaCategory.sortOrder,
      icon: prismaCategory.icon,
      color: prismaCategory.color,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    };
  }

  static toDomainList(prismaCategories: PrismaCategory[]): Category[] {
    return prismaCategories.map(CategoryMapper.toDomain);
  }
}
