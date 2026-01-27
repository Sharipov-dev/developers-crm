import type { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import type { CategoryRepository } from '../../../src/domain/repositories/category.repository.js';
import type { JwtService } from '../../../src/application/services/jwt.service.js';
import { CreateCategoryUseCase } from '../../../src/application/use-cases/category/create-category.use-case.js';
import { DeleteCategoryUseCase } from '../../../src/application/use-cases/category/delete-category.use-case.js';
import { GetCategoryUseCase } from '../../../src/application/use-cases/category/get-category.use-case.js';
import { ListCategoriesUseCase } from '../../../src/application/use-cases/category/list-categories.use-case.js';
import { UpdateCategoryUseCase } from '../../../src/application/use-cases/category/update-category.use-case.js';
import type { Category } from '../../../src/domain/entities/category.entity.js';
import { HealthController } from '../../../src/interfaces/http/controllers/health.controller.js';
import { CategoryController } from '../../../src/interfaces/http/controllers/category.controller.js';
import { UserController } from '../../../src/interfaces/http/controllers/user.controller.js';
import { createAuthMiddleware } from '../../../src/interfaces/http/middlewares/auth.middleware.js';
import { createApp } from '../../../src/main/app.js';

describe('Category Routes', () => {
  let app: Express;
  let mockCategoryRepository: CategoryRepository;
  let mockJwtService: JwtService;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const categoryId = '323e4567-e89b-12d3-a456-426614174000';

  const mockCategory: Category = {
    id: categoryId,
    userId,
    name: 'Groceries',
    parentId: null,
    sortOrder: 0,
    icon: 'shopping-cart',
    color: '#FF5733',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeAll(() => {
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

    mockJwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    const createCategoryUseCase = new CreateCategoryUseCase(mockCategoryRepository);
    const getCategoryUseCase = new GetCategoryUseCase(mockCategoryRepository);
    const listCategoriesUseCase = new ListCategoriesUseCase(mockCategoryRepository);
    const updateCategoryUseCase = new UpdateCategoryUseCase(mockCategoryRepository);
    const deleteCategoryUseCase = new DeleteCategoryUseCase(mockCategoryRepository);

    const categoryController = new CategoryController(
      createCategoryUseCase,
      getCategoryUseCase,
      listCategoriesUseCase,
      updateCategoryUseCase,
      deleteCategoryUseCase
    );

    const healthController = new HealthController();
    // Create a minimal userController for the app structure (not used in these tests)
    const userController = new UserController(
      vi.fn() as any,
      vi.fn() as any,
      vi.fn() as any,
      vi.fn() as any,
      vi.fn() as any
    );
    const authMiddleware = createAuthMiddleware(mockJwtService);

    app = createApp({ healthController, userController, categoryController }, { authMiddleware });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockJwtService.verify).mockReturnValue({ userId });
  });

  describe('POST /api/categories', () => {
    it('should create a category and return 201', async () => {
      vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
      vi.mocked(mockCategoryRepository.create).mockResolvedValue(mockCategory);

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Groceries', icon: 'shopping-cart', color: '#FF5733' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Groceries');
      expect(response.body.data.icon).toBe('shopping-cart');
      expect(response.body.data.color).toBe('#FF5733');
    });

    it('should return 400 for invalid name (too long)', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'A'.repeat(51) })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid color format', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Groceries', color: 'invalid-color' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app).post('/api/categories').send({ name: 'Groceries' }).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 409 when category name already exists', async () => {
      vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(mockCategory);

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Groceries' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return category by id', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);

      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(categoryId);
      expect(response.body.data.name).toBe('Groceries');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app).get(`/api/categories/${categoryId}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when category not found', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/categories', () => {
    it('should return paginated categories', async () => {
      vi.mocked(mockCategoryRepository.findAll).mockResolvedValue([mockCategory]);
      vi.mocked(mockCategoryRepository.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .query({ page: 1, pageSize: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.pageSize).toBe(20);
      expect(response.body.meta.totalCount).toBe(1);
    });

    it('should filter by parentId', async () => {
      const parentId = '223e4567-e89b-12d3-a456-426614174000';
      vi.mocked(mockCategoryRepository.findAll).mockResolvedValue([]);
      vi.mocked(mockCategoryRepository.count).mockResolvedValue(0);

      await request(app)
        .get('/api/categories')
        .set('Authorization', 'Bearer valid_token')
        .query({ parentId })
        .expect(200);

      expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ parentId })
      );
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('should update category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Groceries', color: '#00FF00' };
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(mockCategoryRepository.findByUserIdAndName).mockResolvedValue(null);
      vi.mocked(mockCategoryRepository.update).mockResolvedValue(updatedCategory);

      const response = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Updated Groceries', color: '#00FF00' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Groceries');
      expect(response.body.data.color).toBe('#00FF00');
    });

    it('should return 400 for invalid color format', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);

      const response = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .send({ color: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when category not found', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category and return 204', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(mockCategory);
      vi.mocked(mockCategoryRepository.delete).mockResolvedValue();

      await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(204);
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app).delete(`/api/categories/${categoryId}`).expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when category not found', async () => {
      vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
