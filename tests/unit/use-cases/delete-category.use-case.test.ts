import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DeleteCategoryUseCase } from '../../../src/application/use-cases/category/delete-category.use-case.js';
import type { Category } from '../../../src/domain/entities/category.entity.js';
import { CategoryForbiddenError, CategoryNotFoundError } from '../../../src/domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../src/domain/repositories/category.repository.js';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockCategoryRepository: CategoryRepository;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const otherUserId = '999e4567-e89b-12d3-a456-426614174000';
  const categoryId = '323e4567-e89b-12d3-a456-426614174000';

  const mockCategory: Category = {
    id: categoryId,
    userId,
    name: 'Groceries',
    parentId: null,
    sortOrder: 0,
    icon: 'shopping-cart',
    color: '#FF5733',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockCategoryRepository = {
      findById: vi.fn(),
      findByUserIdAndName: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAncestors: vi.fn(),
      existsById: vi.fn(),
    };

    useCase = new DeleteCategoryUseCase(mockCategoryRepository);
  });

  it('should delete category successfully', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.delete).mockResolvedValue();

    await useCase.execute(userId, categoryId);

    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
    expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
  });

  it('should throw CategoryNotFoundError when category not found', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(userId, categoryId)).rejects.toThrow(CategoryNotFoundError);
    expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw CategoryForbiddenError when category belongs to different user', async () => {
    const otherUserCategory = { ...mockCategory, userId: otherUserId };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(otherUserCategory);

    await expect(useCase.execute(userId, categoryId)).rejects.toThrow(CategoryForbiddenError);
    expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
  });
});
