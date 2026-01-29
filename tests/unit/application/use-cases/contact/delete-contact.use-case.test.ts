import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteContactUseCase } from '../../../../../src/application/use-cases/contact/delete-contact.use-case.js';
import type { Contact } from '../../../../../src/domain/entities/contact.entity.js';
import { ContactNotFoundError } from '../../../../../src/domain/errors/contact.errors.js';
import type { ContactRepository } from '../../../../../src/domain/repositories/contact.repository.js';

describe('DeleteContactUseCase', () => {
  let useCase: DeleteContactUseCase;
  let mockContactRepository: ContactRepository;

  const mockUserId = 'user-123';
  const mockContactId = 'contact-123';
  const mockContact: Contact = {
    id: mockContactId,
    userId: mockUserId,
    companyId: 'company-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    title: 'CEO',
    source: 'linkedin',
    status: 'lead',
    lastContactedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockContactRepository = {
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByEmailAndUserId: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEmailAndUserId: vi.fn(),
    };

    useCase = new DeleteContactUseCase(mockContactRepository);
  });

  it('should delete contact when found for user', async () => {
    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.delete).mockResolvedValue(undefined);

    await useCase.execute(mockContactId, mockUserId);

    expect(mockContactRepository.findByIdAndUserId).toHaveBeenCalledWith(mockContactId, mockUserId);
    expect(mockContactRepository.delete).toHaveBeenCalledWith(mockContactId);
  });

  it('should throw ContactNotFoundError when contact not found', async () => {
    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute('non-existent', mockUserId)).rejects.toThrow(ContactNotFoundError);

    expect(mockContactRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ContactNotFoundError when contact belongs to different user', async () => {
    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockContactId, 'other-user')).rejects.toThrow(ContactNotFoundError);

    expect(mockContactRepository.delete).not.toHaveBeenCalled();
  });
});
