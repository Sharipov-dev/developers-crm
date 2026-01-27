import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateCategoryUseCase } from '../../../src/application/use-cases/category/create-category.use-case.js';
import type { Category } from '../../../src/domain/entities/category.entity.js';
import {
  CategoryForbiddenError,
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from '../../../src/domain/errors/category.errors.js';
import type { CategoryRepository } from '../../../src/domain/repositories/category.repository.js';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let mockCategoryRepository: CategoryRepository;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const parentId = '223e4567-e89b-12d3-a456-426614174000';

  const mockCategory: Category = {
    id: '323e4567-e89b-12d3-a456-426614174000',
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

    useCase = new CreateCategoryUseCase(mockCategoryRepository);
  });

  it('should create a category successfully when name does not exist', async () => {
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
    vi.mocked(mockCategoryRepository.create).mockResolvedValue(mockCategory);

    const input = { name: 'Groceries', sortOrder: 0, icon: 'shopping-cart', color: '#FF5733' };
    const result = await useCase.execute(userId, input);

    expect(mockCategoryRepository.findByUserIdAndName).toHaveBeenCalledWith(userId, input.name);
    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      userId,
      name: input.name,
      parentId: null,
      sortOrder: input.sortOrder,
      icon: input.icon,
      color: input.color,
    });
    expect(result).toEqual(mockCategory);
  });

  it('should create a category with parentId when parent exists and belongs to user', async () => {
    const categoryWithParent = { ...mockCategory, parentId };
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockParentCategory);
    vi.mocked(mockCategoryRepository.create).mockResolvedValue(categoryWithParent);

    const input = { name: 'Groceries', parentId };
    const result = await useCase.execute(userId, input);

    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(parentId);
    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      userId,
      name: input.name,
      parentId,
      sortOrder: 0,
      icon: null,
      color: null,
    });
    expect(result).toEqual(categoryWithParent);
  });

  it('should throw CategoryNameAlreadyExistsError when name exists', async () => {
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(mockCategory);

    const input = { name: 'Groceries' };

    await expect(useCase.execute(userId, input)).rejects.toThrow(CategoryNameAlreadyExistsError);
    expect(mockCategoryRepository.create).not.toHaveBeenCalled();
  });

  it('should throw CategoryNotFoundError when parent does not exist', async () => {
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

    const input = { name: 'Groceries', parentId };

    await expect(useCase.execute(userId, input)).rejects.toThrow(CategoryNotFoundError);
    expect(mockCategoryRepository.create).not.toHaveBeenCalled();
  });

  it('should throw CategoryForbiddenError when parent belongs to different user', async () => {
    const otherUserParent = { ...mockParentCategory, userId: '999e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(otherUserParent);

    const input = { name: 'Groceries', parentId };

    await expect(useCase.execute(userId, input)).rejects.toThrow(CategoryForbiddenError);
    expect(mockCategoryRepository.create).not.toHaveBeenCalled();
  });
});
