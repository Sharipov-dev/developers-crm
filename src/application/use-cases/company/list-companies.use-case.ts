import type { Company, CompanySort } from '../../../domain/entities/company.entity.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { CompanySortDto, ListCompaniesQueryDto } from '../../dto/company.dto.js';

export interface ListCompaniesResult {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
}

function parseSortOption(sort: CompanySortDto): CompanySort {
  const [field, order] = sort.split('_') as [string, string];
  return {
    field: field as 'createdAt' | 'name',
    order: order as 'asc' | 'desc',
  };
}

export class ListCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, query: ListCompaniesQueryDto): Promise<ListCompaniesResult> {
    const { page, pageSize, sort, q, industry, size } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const options = {
      userId,
      filters: {
        q,
        industry,
        size,
      },
      sort: parseSortOption(sort),
      skip,
      take,
    };

    const [items, total] = await Promise.all([
      this.companyRepository.findAll(options),
      this.companyRepository.count(options),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
