import type { Category } from '../../../domain/entities/category.entity.js';
import { CategoryForbiddenError, CategoryNotFoundError } from '../../../domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../domain/repositories/category.repository.js';

export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new CategoryNotFoundError(categoryId);
    }

    if (category.userId !== userId) {
      throw new CategoryForbiddenError();
    }

    return category;
  }
}
