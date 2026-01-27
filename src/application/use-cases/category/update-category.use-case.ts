import type { Category, UpdateCategoryData } from '../../../domain/entities/category.entity.js';
import {
  CategoryCycleError,
  CategoryForbiddenError,
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
  CategorySelfReferenceError,
} from '../../../domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../domain/repositories/category.repository.js';
import type { UpdateCategoryDto } from '../../dto/category.dto.js';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new CategoryNotFoundError(categoryId);
    }

    if (category.userId !== userId) {
      throw new CategoryForbiddenError();
    }

    // Validate parentId is not equal to id
    if (data.parentId === categoryId) {
      throw new CategorySelfReferenceError();
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await this.categoryRepository.findByUserIdAndName(userId, data.name);
      if (existingCategory && existingCategory.id !== categoryId) {
        throw new CategoryNameAlreadyExistsError(data.name);
      }
    }

    // Validate parent exists and belongs to user if parentId is being updated
    if (data.parentId !== undefined && data.parentId !== null) {
      const parent = await this.categoryRepository.findById(data.parentId);
      if (!parent) {
        throw new CategoryNotFoundError(data.parentId);
      }
      if (parent.userId !== userId) {
        throw new CategoryForbiddenError();
      }

      // Check for cycles: ensure the new parent is not a descendant of this category
      const ancestors = await this.categoryRepository.findAncestors(categoryId);
      if (ancestors.some((ancestor) => ancestor.id === data.parentId)) {
        throw new CategoryCycleError();
      }
    }

    const updateData: UpdateCategoryData = {};
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

    return this.categoryRepository.update(categoryId, updateData);
  }
}
