import { CategoryForbiddenError, CategoryNotFoundError } from '../../../domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../domain/repositories/category.repository.js';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new CategoryNotFoundError(categoryId);
    }

    if (category.userId !== userId) {
      throw new CategoryForbiddenError();
    }

    // The repository implementation will handle setting expenses.categoryId to null
    // via the database foreign key constraint (ON DELETE SET NULL)
    await this.categoryRepository.delete(categoryId);
  }
}
