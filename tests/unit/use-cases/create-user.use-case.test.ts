import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CreateUserUseCase } from '../../../src/application/use-cases/user/create-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserEmailAlreadyExistsError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: UserRepository;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
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

    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create a user successfully when email does not exist', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

    const input = { email: 'test@example.com', name: 'Test User' };
    const result = await useCase.execute(input);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: input.email,
      name: input.name,
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw UserEmailAlreadyExistsError when email exists', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);

    const input = { email: 'test@example.com', name: 'Test User' };

    await expect(useCase.execute(input)).rejects.toThrow(UserEmailAlreadyExistsError);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should throw the exact error with correct email', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);

    const input = { email: 'existing@example.com', name: 'Test User' };

    try {
      await useCase.execute(input);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(UserEmailAlreadyExistsError);
      expect((error as UserEmailAlreadyExistsError).message).toContain('existing@example.com');
    }
  });
});
