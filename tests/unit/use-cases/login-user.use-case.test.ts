import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { JwtService } from '../../../src/application/services/jwt.service.js';
import type { PasswordService } from '../../../src/application/services/password.service.js';
import { LoginUserUseCase } from '../../../src/application/use-cases/user/login-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { InvalidCredentialsError, UserDisabledError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepository: UserRepository;
  let mockPasswordService: PasswordService;
  let mockJwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    displayName: 'Test User',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
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

    useCase = new LoginUserUseCase(mockUserRepository, mockPasswordService, mockJwtService);
  });

  it('should login successfully with valid credentials', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordService.compare).mockResolvedValue(true);
    vi.mocked(mockJwtService.sign).mockReturnValue('jwt_token');

    const input = { email: 'test@example.com', password: 'password123' };
    const result = await useCase.execute(input);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPasswordService.compare).toHaveBeenCalledWith(input.password, mockUser.passwordHash);
    expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id });
    expect(result.accessToken).toBe('jwt_token');
    expect(result.user).toEqual(mockUser);
  });

  it('should throw InvalidCredentialsError when user not found', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    const input = { email: 'nonexistent@example.com', password: 'password123' };

    await expect(useCase.execute(input)).rejects.toThrow(InvalidCredentialsError);
    expect(mockPasswordService.compare).not.toHaveBeenCalled();
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when password is incorrect', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordService.compare).mockResolvedValue(false);

    const input = { email: 'test@example.com', password: 'wrong_password' };

    await expect(useCase.execute(input)).rejects.toThrow(InvalidCredentialsError);
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw UserDisabledError when user is disabled', async () => {
    const disabledUser = { ...mockUser, status: 'disabled' as const };
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(disabledUser);
    vi.mocked(mockPasswordService.compare).mockResolvedValue(true);

    const input = { email: 'test@example.com', password: 'password123' };

    await expect(useCase.execute(input)).rejects.toThrow(UserDisabledError);
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });
});
