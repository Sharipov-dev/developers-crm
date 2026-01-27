import type { PrismaClient } from '@prisma/client';

import type { CreateCategoryData, UpdateCategoryData, Category } from '../../domain/entities/category.entity.js';
import type { CategoryRepository, FindCategoriesOptions } from '../../domain/repositories/category.repository.js';

import { CategoryMapper } from './category.mapper.js';

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return category ? CategoryMapper.toDomain(category) : null;
  }

  async findByUserIdAndName(userId: string, name: string): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return category ? CategoryMapper.toDomain(category) : null;
  }

  async findAll(options: FindCategoriesOptions): Promise<Category[]> {
    const where: any = {
      userId: options.userId,
    };

    if (options.parentId !== undefined) {
      where.parentId = options.parentId;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    const mappedCategories = CategoryMapper.toDomainList(categories);

    // If includeChildren is true and we're getting root categories, build tree structure
    if (options.includeChildren && options.parentId === null) {
      return this.buildCategoryTree(mappedCategories);
    }

    return mappedCategories;
  }

  async count(options: FindCategoriesOptions): Promise<number> {
    const where: any = {
      userId: options.userId,
    };

    if (options.parentId !== undefined) {
      where.parentId = options.parentId;
    }

    return this.prisma.category.count({ where });
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
        icon: data.icon ?? null,
        color: data.color ?? null,
      },
    });

    return CategoryMapper.toDomain(category);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    if (data.color !== undefined) {
      updateData.color = data.color;
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    return CategoryMapper.toDomain(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findAncestors(id: string): Promise<Category[]> {
    const ancestors: Category[] = [];
    const visited = new Set<string>();
    let currentCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!currentCategory) {
      return ancestors;
    }

    // Traverse up the tree from the current category's parent
    let parentId: string | null = currentCategory.parentId;

    while (parentId && !visited.has(parentId)) {
      visited.add(parentId);
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        break;
      }

      ancestors.push(CategoryMapper.toDomain(parent));
      parentId = parent.parentId;
    }

    return ancestors;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { id },
    });

    return count > 0;
  }

  private buildCategoryTree(categories: Category[]): Category[] {
    // For now, return flat list - tree building with children can be done in controller if needed
    // This keeps the repository simple and the domain model clean
    return categories;
  }
}
