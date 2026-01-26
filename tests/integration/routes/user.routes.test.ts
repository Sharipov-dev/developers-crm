import type { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import type { JwtService } from '../../../src/application/services/jwt.service.js';
import type { PasswordService } from '../../../src/application/services/password.service.js';
import { DisableAccountUseCase } from '../../../src/application/use-cases/user/disable-account.use-case.js';
import { GetCurrentUserUseCase } from '../../../src/application/use-cases/user/get-current-user.use-case.js';
import { LoginUserUseCase } from '../../../src/application/use-cases/user/login-user.use-case.js';
import { RegisterUserUseCase } from '../../../src/application/use-cases/user/register-user.use-case.js';
import { UpdateProfileUseCase } from '../../../src/application/use-cases/user/update-profile.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';
import { HealthController } from '../../../src/interfaces/http/controllers/health.controller.js';
import { UserController } from '../../../src/interfaces/http/controllers/user.controller.js';
import { createAuthMiddleware } from '../../../src/interfaces/http/middlewares/auth.middleware.js';
import { createApp } from '../../../src/main/app.js';

describe('User Routes', () => {
  let app: Express;
  let mockUserRepository: UserRepository;
  let mockPasswordService: PasswordService;
  let mockJwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    displayName: 'Test User',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeAll(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      existsByEmail: vi.fn(),
    };

    mockPasswordService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockPasswordService);
    const loginUserUseCase = new LoginUserUseCase(mockUserRepository, mockPasswordService, mockJwtService);
    const getCurrentUserUseCase = new GetCurrentUserUseCase(mockUserRepository);
    const updateProfileUseCase = new UpdateProfileUseCase(mockUserRepository);
    const disableAccountUseCase = new DisableAccountUseCase(mockUserRepository);

    const userController = new UserController(
      registerUserUseCase,
      loginUserUseCase,
      getCurrentUserUseCase,
      updateProfileUseCase,
      disableAccountUseCase
    );

    const healthController = new HealthController();
    const authMiddleware = createAuthMiddleware(mockJwtService);

    app = createApp({ healthController, userController }, { authMiddleware });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a user and return 201', async () => {
      vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(false);
      vi.mocked(mockPasswordService.hash).mockResolvedValue('hashed_password');
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'password123', displayName: 'Test User' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.displayName).toBe('Test User');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password too short', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'short' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 when email already exists', async () => {
      vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login and return token', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordService.compare).mockResolvedValue(true);
      vi.mocked(mockJwtService.sign).mockReturnValue('jwt_token');

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe('jwt_token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for wrong password', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordService.compare).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'wrong_password' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for disabled account', async () => {
      const disabledUser = { ...mockUser, status: 'disabled' as const };
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(disabledUser);
      vi.mocked(mockPasswordService.compare).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      vi.mocked(mockJwtService.verify).mockReturnValue({ userId: mockUser.id });
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.displayName).toBe('Test User');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      vi.mocked(mockJwtService.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update profile displayName', async () => {
      const updatedUser = { ...mockUser, displayName: 'New Name' };
      vi.mocked(mockJwtService.verify).mockReturnValue({ userId: mockUser.id });
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', 'Bearer valid_token')
        .send({ displayName: 'New Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe('New Name');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .send({ displayName: 'New Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/me/disable', () => {
    it('should disable user account', async () => {
      const disabledUser = { ...mockUser, status: 'disabled' as const };
      vi.mocked(mockJwtService.verify).mockReturnValue({ userId: mockUser.id });
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.updateStatus).mockResolvedValue(disabledUser);

      const response = await request(app)
        .post('/api/users/me/disable')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('disabled');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .post('/api/users/me/disable')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
