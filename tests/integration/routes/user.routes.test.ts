import type { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import { CreateUserUseCase } from '../../../src/application/use-cases/user/create-user.use-case.js';
import { DeleteUserUseCase } from '../../../src/application/use-cases/user/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../../../src/application/use-cases/user/get-user-by-id.use-case.js';
import { ListUsersUseCase } from '../../../src/application/use-cases/user/list-users.use-case.js';
import { UpdateUserUseCase } from '../../../src/application/use-cases/user/update-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';
import { HealthController } from '../../../src/interfaces/http/controllers/health.controller.js';
import { UserController } from '../../../src/interfaces/http/controllers/user.controller.js';
import { createApp } from '../../../src/main/app.js';

describe('User Routes', () => {
  let app: Express;
  let mockUserRepository: UserRepository;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeAll(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsById: vi.fn(),
      existsByEmail: vi.fn(),
    };

    const createUserUseCase = new CreateUserUseCase(mockUserRepository);
    const getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository);
    const listUsersUseCase = new ListUsersUseCase(mockUserRepository);
    const updateUserUseCase = new UpdateUserUseCase(mockUserRepository);
    const deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);

    const userController = new UserController(
      createUserUseCase,
      getUserByIdUseCase,
      listUsersUseCase,
      updateUserUseCase,
      deleteUserUseCase
    );

    const healthController = new HealthController();

    app = createApp({ healthController, userController });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should create a user and return 201', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', name: 'Test User' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.name).toBe('Test User');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'invalid-email', name: 'Test User' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/users/${mockUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockUser.id);
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid uuid', async () => {
      const response = await request(app)
        .get('/api/users/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users', () => {
    it('should return paginated users', async () => {
      vi.mocked(mockUserRepository.findAll).mockResolvedValue([mockUser]);
      vi.mocked(mockUserRepository.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalCount).toBe(1);
    });

    it('should accept pagination parameters', async () => {
      vi.mocked(mockUserRepository.findAll).mockResolvedValue([]);
      vi.mocked(mockUserRepository.count).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/users?page=2&pageSize=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ skip: 10, take: 10 });
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch(`/api/users/${mockUser.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user and return 204', async () => {
      vi.mocked(mockUserRepository.existsById).mockResolvedValue(true);
      vi.mocked(mockUserRepository.delete).mockResolvedValue(undefined);

      await request(app)
        .delete(`/api/users/${mockUser.id}`)
        .expect(204);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
