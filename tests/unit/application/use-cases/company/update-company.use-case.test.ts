import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpdateCompanyDto } from '../../../../../src/application/dto/company.dto.js';
import { UpdateCompanyUseCase } from '../../../../../src/application/use-cases/company/update-company.use-case.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import {
  CompanyNameAlreadyExistsError,
  CompanyNotFoundError,
} from '../../../../../src/domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('UpdateCompanyUseCase', () => {
  let useCase: UpdateCompanyUseCase;
  let mockCompanyRepository: CompanyRepository;

  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockCompany: Company = {
    id: mockCompanyId,
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

    useCase = new UpdateCompanyUseCase(mockCompanyRepository);
  });

  it('should update company when name is not changed', async () => {
    const input: UpdateCompanyDto = {
      website: 'https://new-acme.com',
      notes: 'Updated notes',
    };

    const updatedCompany = {
      ...mockCompany,
      website: 'https://new-acme.com',
      notes: 'Updated notes',
      updatedAt: new Date('2024-01-02'),
    };

    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockCompanyRepository.update).mockResolvedValue(updatedCompany);

    const result = await useCase.execute(mockCompanyId, mockUserId, input);

    expect(result).toEqual(updatedCompany);
    expect(mockCompanyRepository.existsByNameAndUserId).not.toHaveBeenCalled();
    expect(mockCompanyRepository.update).toHaveBeenCalledWith(mockCompanyId, input);
  });

  it('should update company when name is changed to a unique name', async () => {
    const input: UpdateCompanyDto = {
      name: 'New Acme Corp',
    };

    const updatedCompany = {
      ...mockCompany,
      name: 'New Acme Corp',
      updatedAt: new Date('2024-01-02'),
    };

    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockCompanyRepository.existsByNameAndUserId).mockResolvedValue(false);
    vi.mocked(mockCompanyRepository.update).mockResolvedValue(updatedCompany);

    const result = await useCase.execute(mockCompanyId, mockUserId, input);

    expect(result).toEqual(updatedCompany);
    expect(mockCompanyRepository.existsByNameAndUserId).toHaveBeenCalledWith(
      'new acme corp',
      mockUserId
    );
  });

  it('should allow updating name with same name (case variations)', async () => {
    const input: UpdateCompanyDto = {
      name: 'ACME CORP',
    };

    const updatedCompany = {
      ...mockCompany,
      name: 'ACME CORP',
    };

    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockCompanyRepository.update).mockResolvedValue(updatedCompany);

    const result = await useCase.execute(mockCompanyId, mockUserId, input);

    expect(result).toEqual(updatedCompany);
    expect(mockCompanyRepository.existsByNameAndUserId).not.toHaveBeenCalled();
  });

  it('should throw CompanyNameAlreadyExistsError when new name already exists', async () => {
    const input: UpdateCompanyDto = {
      name: 'Existing Corp',
    };

    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockCompanyRepository.existsByNameAndUserId).mockResolvedValue(true);

    await expect(useCase.execute(mockCompanyId, mockUserId, input)).rejects.toThrow(
      CompanyNameAlreadyExistsError
    );
    expect(mockCompanyRepository.update).not.toHaveBeenCalled();
  });

  it('should throw CompanyNotFoundError when company not found', async () => {
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockCompanyId, mockUserId, { name: 'Test' })).rejects.toThrow(
      CompanyNotFoundError
    );
    expect(mockCompanyRepository.update).not.toHaveBeenCalled();
  });

  it('should allow setting fields to null', async () => {
    const input: UpdateCompanyDto = {
      website: null,
      industry: null,
      size: null,
      notes: null,
    };

    const updatedCompany = {
      ...mockCompany,
      website: null,
      industry: null,
      size: null,
      notes: null,
    };

    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);
    vi.mocked(mockCompanyRepository.update).mockResolvedValue(updatedCompany);

    const result = await useCase.execute(mockCompanyId, mockUserId, input);

    expect(result).toEqual(updatedCompany);
    expect(mockCompanyRepository.update).toHaveBeenCalledWith(mockCompanyId, input);
  });
});
