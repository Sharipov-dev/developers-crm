import type { Contact, ContactSort } from '../../../domain/entities/contact.entity.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { ContactSortDto, ListContactsQueryDto } from '../../dto/contact.dto.js';

export interface ListContactsResult {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

function parseSortOption(sort: ContactSortDto): ContactSort {
  const [field, order] = sort.split('_') as [string, string];
  return {
    field: field as 'createdAt' | 'lastContactedAt' | 'name',
    order: order as 'asc' | 'desc',
  };
}

export class ListContactsUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(userId: string, query: ListContactsQueryDto): Promise<ListContactsResult> {
    const { page, pageSize, sort, q, status, companyId, source } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const options = {
      userId,
      filters: {
        q,
        status,
        companyId,
        source,
      },
      sort: parseSortOption(sort),
      skip,
      take,
    };

    const [items, total] = await Promise.all([
      this.contactRepository.findAll(options),
      this.contactRepository.count(options),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
