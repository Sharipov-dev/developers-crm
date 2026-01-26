import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UpdateProfileUseCase } from '../../../src/application/use-cases/user/update-profile.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
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

    useCase = new UpdateProfileUseCase(mockUserRepository);
  });

  it('should update user displayName', async () => {
    const updatedUser = { ...mockUser, displayName: 'New Name' };
    vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser);

    const result = await useCase.execute(mockUser.id, { displayName: 'New Name' });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { displayName: 'New Name' });
    expect(result).toEqual(updatedUser);
  });

  it('should throw UserNotFoundError when user not found', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id', { displayName: 'New Name' })).rejects.toThrow(UserNotFoundError);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
