import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateCompanyDto } from '../../../../../src/application/dto/company.dto.js';
import { CreateCompanyUseCase } from '../../../../../src/application/use-cases/company/create-company.use-case.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import { CompanyNameAlreadyExistsError } from '../../../../../src/domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('CreateCompanyUseCase', () => {
  let useCase: CreateCompanyUseCase;
  let mockCompanyRepository: CompanyRepository;

  const mockUserId = 'user-123';
  const mockCompany: Company = {
    id: 'company-123',
    userId: mockUserId,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '51-200',
    notes: 'Test company',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
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

    useCase = new CreateCompanyUseCase(mockCompanyRepository);
  });

  it('should create a company when name is unique', async () => {
    const input: CreateCompanyDto = {
      name: 'Acme Corp',
      website: 'https://acme.com',
      industry: 'Technology',
      size: '51-200',
      notes: 'Test company',
    };

    vi.mocked(mockCompanyRepository.existsByNameAndUserId).mockResolvedValue(false);
    vi.mocked(mockCompanyRepository.create).mockResolvedValue(mockCompany);

    const result = await useCase.execute(mockUserId, input);

    expect(result).toEqual(mockCompany);
    expect(mockCompanyRepository.existsByNameAndUserId).toHaveBeenCalledWith(
      'acme corp',
      mockUserId
    );
    expect(mockCompanyRepository.create).toHaveBeenCalledWith({
      userId: mockUserId,
      name: input.name,
      website: input.website,
      industry: input.industry,
      size: input.size,
      notes: input.notes,
    });
  });

  it('should throw CompanyNameAlreadyExistsError when name exists for user', async () => {
    const input: CreateCompanyDto = {
      name: 'Acme Corp',
    };

    vi.mocked(mockCompanyRepository.existsByNameAndUserId).mockResolvedValue(true);

    await expect(useCase.execute(mockUserId, input)).rejects.toThrow(CompanyNameAlreadyExistsError);
    expect(mockCompanyRepository.create).not.toHaveBeenCalled();
  });

  it('should create company with minimal required fields', async () => {
    const input: CreateCompanyDto = {
      name: 'Minimal Corp',
    };

    const minimalCompany: Company = {
      id: 'company-456',
      userId: mockUserId,
      name: 'Minimal Corp',
      website: null,
      industry: null,
      size: null,
      notes: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    vi.mocked(mockCompanyRepository.existsByNameAndUserId).mockResolvedValue(false);
    vi.mocked(mockCompanyRepository.create).mockResolvedValue(minimalCompany);

    const result = await useCase.execute(mockUserId, input);

    expect(result).toEqual(minimalCompany);
    expect(mockCompanyRepository.create).toHaveBeenCalledWith({
      userId: mockUserId,
      name: input.name,
      website: undefined,
      industry: undefined,
      size: undefined,
      notes: undefined,
    });
  });
});
