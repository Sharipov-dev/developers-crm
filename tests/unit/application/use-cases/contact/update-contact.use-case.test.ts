import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpdateContactDto } from '../../../../../src/application/dto/contact.dto.js';
import { UpdateContactUseCase } from '../../../../../src/application/use-cases/contact/update-contact.use-case.js';
import type { Contact } from '../../../../../src/domain/entities/contact.entity.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import {
  ContactCompanyAccessDeniedError,
  ContactEmailAlreadyExistsError,
  ContactNotFoundError,
} from '../../../../../src/domain/errors/contact.errors.js';
import type { ContactRepository } from '../../../../../src/domain/repositories/contact.repository.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('UpdateContactUseCase', () => {
  let useCase: UpdateContactUseCase;
  let mockContactRepository: ContactRepository;
  let mockCompanyRepository: CompanyRepository;

  const mockUserId = 'user-123';
  const mockContactId = 'contact-123';
  const mockCompanyId = 'company-123';
  const mockContact: Contact = {
    id: mockContactId,
    userId: mockUserId,
    companyId: mockCompanyId,
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

  const mockCompany: Company = {
    id: mockCompanyId,
    userId: mockUserId,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '51-200',
    notes: null,
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

    mockCompanyRepository = {
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByNameAndUserId: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByNameAndUserId: vi.fn(),
    };

    useCase = new UpdateContactUseCase(mockContactRepository, mockCompanyRepository);
  });

  it('should update contact with valid data', async () => {
    const input: UpdateContactDto = {
      firstName: 'Jane',
      status: 'contacted',
    };

    const updatedContact: Contact = {
      ...mockContact,
      firstName: 'Jane',
      status: 'contacted',
      updatedAt: new Date('2024-01-02'),
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.update).mockResolvedValue(updatedContact);

    const result = await useCase.execute(mockContactId, mockUserId, input);

    expect(result.firstName).toBe('Jane');
    expect(result.status).toBe('contacted');
    expect(mockContactRepository.update).toHaveBeenCalledWith(mockContactId, input);
  });

  it('should throw ContactNotFoundError when contact not found', async () => {
    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', mockUserId, { firstName: 'Jane' })
    ).rejects.toThrow(ContactNotFoundError);

    expect(mockContactRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ContactEmailAlreadyExistsError when changing to existing email', async () => {
    const input: UpdateContactDto = {
      email: 'existing@example.com',
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.existsByEmailAndUserId).mockResolvedValue(true);

    await expect(useCase.execute(mockContactId, mockUserId, input)).rejects.toThrow(
      ContactEmailAlreadyExistsError
    );

    expect(mockContactRepository.update).not.toHaveBeenCalled();
  });

  it('should allow keeping same email without uniqueness error', async () => {
    const input: UpdateContactDto = {
      email: 'john.doe@example.com', // Same as existing
    };

    const updatedContact = { ...mockContact };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.update).mockResolvedValue(updatedContact);

    await useCase.execute(mockContactId, mockUserId, input);

    expect(mockContactRepository.existsByEmailAndUserId).not.toHaveBeenCalled();
  });

  it('should throw ContactCompanyAccessDeniedError when company does not belong to user', async () => {
    const input: UpdateContactDto = {
      companyId: 'other-company-id',
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockContactId, mockUserId, input)).rejects.toThrow(
      ContactCompanyAccessDeniedError
    );

    expect(mockContactRepository.update).not.toHaveBeenCalled();
  });

  it('should allow updating companyId to valid company', async () => {
    const newCompanyId = 'new-company-id';
    const input: UpdateContactDto = {
      companyId: newCompanyId,
    };

    const newCompany: Company = {
      ...mockCompany,
      id: newCompanyId,
    };

    const updatedContact: Contact = {
      ...mockContact,
      companyId: newCompanyId,
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(newCompany);
    vi.mocked(mockContactRepository.update).mockResolvedValue(updatedContact);

    const result = await useCase.execute(mockContactId, mockUserId, input);

    expect(result.companyId).toBe(newCompanyId);
  });

  it('should allow setting companyId to null', async () => {
    const input: UpdateContactDto = {
      companyId: null,
    };

    const updatedContact: Contact = {
      ...mockContact,
      companyId: null,
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.update).mockResolvedValue(updatedContact);

    const result = await useCase.execute(mockContactId, mockUserId, input);

    expect(result.companyId).toBeNull();
    expect(mockCompanyRepository.findByIdAndUserId).not.toHaveBeenCalled();
  });

  it('should allow setting email to null', async () => {
    const input: UpdateContactDto = {
      email: null,
    };

    const updatedContact: Contact = {
      ...mockContact,
      email: null,
    };

    vi.mocked(mockContactRepository.findByIdAndUserId).mockResolvedValue(mockContact);
    vi.mocked(mockContactRepository.update).mockResolvedValue(updatedContact);

    const result = await useCase.execute(mockContactId, mockUserId, input);

    expect(result.email).toBeNull();
    expect(mockContactRepository.existsByEmailAndUserId).not.toHaveBeenCalled();
  });
});
