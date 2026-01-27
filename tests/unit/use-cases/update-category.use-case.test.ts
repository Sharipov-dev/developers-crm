import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UpdateCategoryUseCase } from '../../../src/application/use-cases/category/update-category.use-case.js';
import type { Category } from '../../../src/domain/entities/category.entity.js';
import {
  CategoryCycleError,
  CategoryForbiddenError,
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
  CategorySelfReferenceError,
} from '../../../src/domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../src/domain/repositories/category.repository.js';

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let mockCategoryRepository: CategoryRepository;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const otherUserId = '999e4567-e89b-12d3-a456-426614174000';
  const categoryId = '323e4567-e89b-12d3-a456-426614174000';
  const parentId = '223e4567-e89b-12d3-a456-426614174000';
  const childId = '423e4567-e89b-12d3-a456-426614174000';

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

  const mockParentCategory: Category = {
    id: parentId,
    userId,
    name: 'Food',
    parentId: null,
    sortOrder: 0,
    icon: null,
    color: null,
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

    useCase = new UpdateCategoryUseCase(mockCategoryRepository);
  });

  it('should update category successfully', async () => {
    const updatedCategory = { ...mockCategory, name: 'Updated Groceries', color: '#00FF00' };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
    vi.mocked(mockCategoryRepository.update).mockResolvedValue(updatedCategory);

    const input = { name: 'Updated Groceries', color: '#00FF00' };
    const result = await useCase.execute(userId, categoryId, input);

    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
    expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, input);
    expect(result).toEqual(updatedCategory);
  });

  it('should throw CategoryNotFoundError when category not found', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

    const input = { name: 'Updated Groceries' };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategoryNotFoundError);
  });

  it('should throw CategoryForbiddenError when category belongs to different user', async () => {
    const otherUserCategory = { ...mockCategory, userId: otherUserId };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(otherUserCategory);

    const input = { name: 'Updated Groceries' };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategoryForbiddenError);
  });

  it('should throw CategorySelfReferenceError when parentId equals category id', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);

    const input = { parentId: categoryId };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategorySelfReferenceError);
  });

  it('should throw CategoryNameAlreadyExistsError when name already exists', async () => {
    const existingCategory = { ...mockCategory, id: '999e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(existingCategory);

    const input = { name: 'Existing Name' };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategoryNameAlreadyExistsError);
  });

  it('should not throw error when name is same (case-insensitive)', async () => {
    const updatedCategory = { ...mockCategory };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.update).mockResolvedValue(updatedCategory);

    const input = { name: 'groceries' }; // lowercase
    const result = await useCase.execute(userId, categoryId, input);

    expect(result).toEqual(updatedCategory);
  });

  it('should throw CategoryCycleError when parent is a descendant', async () => {
    const childCategory = { ...mockCategory, id: childId, parentId: categoryId };
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
    vi.mocked(mockCategoryRepository.findAncestors).mockResolvedValue([childCategory]);

    const input = { parentId: childId };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategoryCycleError);
  });

  it('should throw CategoryForbiddenError when parent belongs to different user', async () => {
    const otherUserParent = { ...mockParentCategory, userId: otherUserId };
    vi.mocked(mockCategoryRepository.findById)
      .mockResolvedValueOnce(mockCategory)
      .mockResolvedValueOnce(otherUserParent);

    const input = { parentId };
    await expect(useCase.execute(userId, categoryId, input)).rejects.toThrow(CategoryForbiddenError);
  });
});
