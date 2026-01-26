import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DisableAccountUseCase } from '../../../src/application/use-cases/user/disable-account.use-case.js';
import type { User } from '../../../src/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../src/domain/errors/user.errors.js';
import type { UserRepository } from '../../../src/domain/repositories/user.repository.js';

describe('DisableAccountUseCase', () => {
  let useCase: DisableAccountUseCase;
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

    useCase = new DisableAccountUseCase(mockUserRepository);
  });

  it('should disable user account', async () => {
    const disabledUser = { ...mockUser, status: 'disabled' as const };
    vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(mockUserRepository.updateStatus).mockResolvedValue(disabledUser);

    const result = await useCase.execute(mockUser.id);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(mockUserRepository.updateStatus).toHaveBeenCalledWith(mockUser.id, 'disabled');
    expect(result).toEqual(disabledUser);
  });

  it('should throw UserNotFoundError when user not found', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(UserNotFoundError);
    expect(mockUserRepository.updateStatus).not.toHaveBeenCalled();
  });
});
