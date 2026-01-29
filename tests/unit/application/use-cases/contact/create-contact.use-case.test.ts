import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateContactDto } from '../../../../../src/application/dto/contact.dto.js';
import { CreateContactUseCase } from '../../../../../src/application/use-cases/contact/create-contact.use-case.js';
import type { Contact } from '../../../../../src/domain/entities/contact.entity.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import {
  ContactCompanyAccessDeniedError,
  ContactEmailAlreadyExistsError,
} from '../../../../../src/domain/errors/contact.errors.js';
import type { ContactRepository } from '../../../../../src/domain/repositories/contact.repository.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('CreateContactUseCase', () => {
  let useCase: CreateContactUseCase;
  let mockContactRepository: ContactRepository;
  let mockCompanyRepository: CompanyRepository;

  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockContact: Contact = {
    id: 'contact-123',
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

    useCase = new CreateContactUseCase(mockContactRepository, mockCompanyRepository);
  });

  it('should create a contact when email is unique and company belongs to user', async () => {
    const input: CreateContactDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      title: 'CEO',
      companyId: mockCompanyId,
      source: 'linkedin',
      status: 'lead',
    };

    vi.mocked(mockContactRepository.existsByEmailAndUserId).mockResolvedValue(false);
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockContactRepository.create).mockResolvedValue(mockContact);

    const result = await useCase.execute(mockUserId, input);

    expect(result).toEqual(mockContact);
    expect(mockContactRepository.existsByEmailAndUserId).toHaveBeenCalledWith(
      'john.doe@example.com',
      mockUserId
    );
    expect(mockCompanyRepository.findByIdAndUserId).toHaveBeenCalledWith(mockCompanyId, mockUserId);
    expect(mockContactRepository.create).toHaveBeenCalledWith({
      userId: mockUserId,
      companyId: mockCompanyId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      title: 'CEO',
      source: 'linkedin',
      status: 'lead',
    });
  });

  it('should throw ContactEmailAlreadyExistsError when email exists for user', async () => {
    const input: CreateContactDto = {
      firstName: 'John',
      email: 'john.doe@example.com',
      status: 'lead',
    };

    vi.mocked(mockContactRepository.existsByEmailAndUserId).mockResolvedValue(true);

    await expect(useCase.execute(mockUserId, input)).rejects.toThrow(ContactEmailAlreadyExistsError);
    expect(mockContactRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ContactCompanyAccessDeniedError when company does not belong to user', async () => {
    const input: CreateContactDto = {
      firstName: 'John',
      companyId: 'other-company-id',
      status: 'lead',
    };

    vi.mocked(mockContactRepository.existsByEmailAndUserId).mockResolvedValue(false);
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockUserId, input)).rejects.toThrow(ContactCompanyAccessDeniedError);
    expect(mockContactRepository.create).not.toHaveBeenCalled();
  });

  it('should create contact without company', async () => {
    const input: CreateContactDto = {
      firstName: 'John',
      lastName: 'Doe',
      status: 'lead',
    };

    const contactWithoutCompany: Contact = {
      ...mockContact,
      companyId: null,
      email: null,
    };

    vi.mocked(mockContactRepository.create).mockResolvedValue(contactWithoutCompany);

    const result = await useCase.execute(mockUserId, input);

    expect(result.companyId).toBeNull();
    expect(mockCompanyRepository.findByIdAndUserId).not.toHaveBeenCalled();
  });

  it('should create contact without email (no uniqueness check)', async () => {
    const input: CreateContactDto = {
      firstName: 'John',
      status: 'lead',
    };

    const contactWithoutEmail: Contact = {
      ...mockContact,
      email: null,
    };

    vi.mocked(mockContactRepository.create).mockResolvedValue(contactWithoutEmail);

    await useCase.execute(mockUserId, input);

    expect(mockContactRepository.existsByEmailAndUserId).not.toHaveBeenCalled();
  });
});
