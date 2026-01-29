import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetCompanyUseCase } from '../../../../../src/application/use-cases/company/get-company.use-case.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import { CompanyNotFoundError } from '../../../../../src/domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('GetCompanyUseCase', () => {
  let useCase: GetCompanyUseCase;
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

    useCase = new GetCompanyUseCase(mockCompanyRepository);
  });

  it('should return company when found and owned by user', async () => {
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(mockCompany);

    const result = await useCase.execute(mockCompanyId, mockUserId);

    expect(result).toEqual(mockCompany);
    expect(mockCompanyRepository.findByIdAndUserId).toHaveBeenCalledWith(mockCompanyId, mockUserId);
  });

  it('should throw CompanyNotFoundError when company not found', async () => {
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockCompanyId, mockUserId)).rejects.toThrow(CompanyNotFoundError);
  });

  it('should throw CompanyNotFoundError when company belongs to different user', async () => {
    vi.mocked(mockCompanyRepository.findByIdAndUserId).mockResolvedValue(null);

    await expect(useCase.execute(mockCompanyId, 'other-user')).rejects.toThrow(
      CompanyNotFoundError
    );
  });
});
