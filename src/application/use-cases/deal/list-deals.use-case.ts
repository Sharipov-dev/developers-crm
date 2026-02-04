import type { Deal, DealSort } from '../../../domain/entities/deal.entity.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { DealSortDto, ListDealsQueryDto } from '../../dto/deal.dto.js';

export interface ListDealsResult {
  items: Deal[];
  total: number;
  page: number;
  pageSize: number;
}

function parseSortOption(sort: DealSortDto): DealSort {
  switch (sort) {
    case 'updatedAt_desc':
      return { field: 'updatedAt', order: 'desc' };
    case 'createdAt_desc':
      return { field: 'createdAt', order: 'desc' };
    case 'value_desc':
      return { field: 'valueCents', order: 'desc' };
    case 'expectedCloseDate_asc':
      return { field: 'expectedCloseDate', order: 'asc' };
  }
}

export class ListDealsUseCase {
  constructor(private readonly dealRepository: DealRepository) {}

  async execute(userId: string, query: ListDealsQueryDto): Promise<ListDealsResult> {
    const {
      page,
      pageSize,
      sort,
      q,
      stage,
      contactId,
      companyId,
      minValueCents,
      maxValueCents,
      expectedCloseFrom,
      expectedCloseTo,
    } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const options = {
      userId,
      filters: {
        q,
        stage,
        contactId,
        companyId,
        minValueCents,
        maxValueCents,
        expectedCloseFrom,
        expectedCloseTo,
      },
      sort: parseSortOption(sort),
      skip,
      take,
    };

    const [items, total] = await Promise.all([
      this.dealRepository.findAll(options),
      this.dealRepository.count(options),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
