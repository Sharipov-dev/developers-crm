import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ListCategoriesUseCase } from '../../../src/application/use-cases/category/list-categories.use-case.js';
import type { Category } from '../../../src/domain/entities/category.entity.js';
import type { CategoryRepository } from '../../../src/domain/repositories/category.repository.js';

describe('ListCategoriesUseCase', () => {
  let useCase: ListCategoriesUseCase;
  let mockCategoryRepository: CategoryRepository;

  const userId = '123e4567-e89b-12d3-a456-426614174000';

  const mockCategories: Category[] = [
    {
      id: '323e4567-e89b-12d3-a456-426614174000',
      userId,
      name: 'Groceries',
      parentId: null,
      sortOrder: 0,
      icon: 'shopping-cart',
      color: '#FF5733',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174000',
      userId,
      name: 'Bills',
      parentId: null,
      sortOrder: 1,
      icon: 'receipt',
      color: '#33FF57',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

    useCase = new ListCategoriesUseCase(mockCategoryRepository);
  });

  it('should return categories with total count', async () => {
    vi.mocked(mockCategoryRepository.findAll).mockResolvedValue(mockCategories);
    vi.mocked(mockCategoryRepository.count).mockResolvedValue(2);

    const query = { page: 1, pageSize: 20 };
    const result = await useCase.execute(userId, query);

    expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
      userId,
      parentId: undefined,
      includeChildren: false,
    });
    expect(mockCategoryRepository.count).toHaveBeenCalledWith({
      userId,
      parentId: undefined,
      includeChildren: false,
    });
    expect(result.items).toEqual(mockCategories);
    expect(result.total).toBe(2);
  });

  it('should filter by parentId when provided', async () => {
    const parentId = '223e4567-e89b-12d3-a456-426614174000';
    vi.mocked(mockCategoryRepository.findAll).mockResolvedValue(mockCategories);
    vi.mocked(mockCategoryRepository.count).mockResolvedValue(2);

    const query = { page: 1, pageSize: 20, parentId };
    await useCase.execute(userId, query);

    expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
      userId,
      parentId,
      includeChildren: false,
    });
  });

  it('should include children when includeChildren is true', async () => {
    vi.mocked(mockCategoryRepository.findAll).mockResolvedValue(mockCategories);
    vi.mocked(mockCategoryRepository.count).mockResolvedValue(2);

    const query = { page: 1, pageSize: 20, includeChildren: true };
    await useCase.execute(userId, query);

    expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
      userId,
      parentId: undefined,
      includeChildren: true,
    });
  });
});
