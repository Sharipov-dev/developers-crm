import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { PasswordService } from '../../../src/application/services/password.service.js';
import { RegisterUserUseCase } from '../../../src/application/use-cases/user/register-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: UserRepository;
  let mockPasswordService: PasswordService;

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

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordService);
  });

  it('should register a user successfully when email does not exist', async () => {
    vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(mockPasswordService.hash).mockResolvedValue('hashed_password');
    vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

    const input = { email: 'test@example.com', password: 'password123', displayName: 'Test User' };
    const result = await useCase.execute(input);

    expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPasswordService.hash).toHaveBeenCalledWith(input.password);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: input.email,
      passwordHash: 'hashed_password',
      displayName: input.displayName,
    });
    expect(result).toEqual(mockUser);
  });

  it('should register a user without displayName', async () => {
    const userWithoutName = { ...mockUser, displayName: null };
    vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(false);
    vi.mocked(mockPasswordService.hash).mockResolvedValue('hashed_password');
    vi.mocked(mockUserRepository.create).mockResolvedValue(userWithoutName);

    const input = { email: 'test@example.com', password: 'password123' };
    const result = await useCase.execute(input);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: input.email,
      passwordHash: 'hashed_password',
      displayName: undefined,
    });
    expect(result).toEqual(userWithoutName);
  });

  it('should throw UserEmailAlreadyExistsError when email exists', async () => {
    vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(true);

    const input = { email: 'test@example.com', password: 'password123' };

    await expect(useCase.execute(input)).rejects.toThrow(UserEmailAlreadyExistsError);
    expect(mockPasswordService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
