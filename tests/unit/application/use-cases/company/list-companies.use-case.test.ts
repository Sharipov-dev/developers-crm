import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ListCompaniesQueryDto } from '../../../../../src/application/dto/company.dto.js';
import { ListCompaniesUseCase } from '../../../../../src/application/use-cases/company/list-companies.use-case.js';
import type { Company } from '../../../../../src/domain/entities/company.entity.js';
import type { CompanyRepository } from '../../../../../src/domain/repositories/company.repository.js';

describe('ListCompaniesUseCase', () => {
  let useCase: ListCompaniesUseCase;
  let mockCompanyRepository: CompanyRepository;

  const mockUserId = 'user-123';
  const mockCompanies: Company[] = [
    {
      id: 'company-1',
      userId: mockUserId,
      name: 'Acme Corp',
      website: 'https://acme.com',
      industry: 'Technology',
      size: '51-200',
      notes: null,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'company-2',
      userId: mockUserId,
      name: 'Beta Inc',
      website: null,
      industry: 'Finance',
      size: '1-10',
      notes: 'Startup',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

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

    useCase = new ListCompaniesUseCase(mockCompanyRepository);
  });

  it('should return paginated companies with default options', async () => {
    const query: ListCompaniesQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue(mockCompanies);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(2);

    const result = await useCase.execute(mockUserId, query);

    expect(result).toEqual({
      items: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
    });

    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith({
      userId: mockUserId,
      filters: {
        q: undefined,
        industry: undefined,
        size: undefined,
      },
      sort: { field: 'createdAt', order: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('should apply search filter', async () => {
    const query: ListCompaniesQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      q: 'tech',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue([mockCompanies[0]]);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(1);

    const result = await useCase.execute(mockUserId, query);

    expect(result.items).toHaveLength(1);
    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ q: 'tech' }),
      })
    );
  });

  it('should apply industry filter', async () => {
    const query: ListCompaniesQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      industry: 'Technology',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue([mockCompanies[0]]);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ industry: 'Technology' }),
      })
    );
  });

  it('should apply size filter', async () => {
    const query: ListCompaniesQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      size: '1-10',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue([mockCompanies[1]]);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ size: '1-10' }),
      })
    );
  });

  it('should sort by name ascending', async () => {
    const query: ListCompaniesQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'name_asc',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue(mockCompanies);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(2);

    await useCase.execute(mockUserId, query);

    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { field: 'name', order: 'asc' },
      })
    );
  });

  it('should calculate correct pagination offset', async () => {
    const query: ListCompaniesQueryDto = {
      page: 3,
      pageSize: 10,
      sort: 'createdAt_desc',
    };

    vi.mocked(mockCompanyRepository.findAll).mockResolvedValue([]);
    vi.mocked(mockCompanyRepository.count).mockResolvedValue(25);

    await useCase.execute(mockUserId, query);

    expect(mockCompanyRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    );
  });
});
