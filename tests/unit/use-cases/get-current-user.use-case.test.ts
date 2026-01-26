import { describe, it, expect, beforeEach, vi } from 'vitest';

import { GetCurrentUserUseCase } from '../../../src/application/use-cases/user/get-current-user.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let mockUserRepository: UserRepository;

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

    useCase = new GetCurrentUserUseCase(mockUserRepository);
  });

  it('should return user by id', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

    const result = await useCase.execute(mockUser.id);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(mockUser);
  });

  it('should throw UserNotFoundError when user not found', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(UserNotFoundError);
  });
});
