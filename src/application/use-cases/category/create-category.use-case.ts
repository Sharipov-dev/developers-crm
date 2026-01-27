import type { Category } from '../../../domain/entities/category.entity.js';
import {
  CategoryForbiddenError,
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from '../../../domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../domain/repositories/category.repository.js';
import type { CreateCategoryDto } from '../../dto/category.dto.js';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, data: CreateCategoryDto): Promise<Category> {
    // Check for duplicate name (case-insensitive)
    const existingCategory = await this.categoryRepository.findByUserIdAndName(userId, data.name);
    if (existingCategory) {
      throw new CategoryNameAlreadyExistsError(data.name);
    }

    // Validate parentId exists and belongs to user if provided
    if (data.parentId) {
      const parent = await this.categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new CategoryNotFoundError(data.parentId);
      }
      if (parent.userId !== userId) {
        throw new CategoryForbiddenError();
      }
    }

    return this.categoryRepository.create({
      userId,
      name: data.name,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
      icon: data.icon ?? null,
      color: data.color ?? null,
    });
  }
}
