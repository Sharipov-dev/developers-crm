import type { Interaction } from '../../../domain/entities/interaction.entity.js';
import type { InteractionRepository } from '../../../domain/repositories/interaction.repository.js';
import type { ListInteractionsQueryDto } from '../../dto/interaction.dto.js';

export interface ListInteractionsResult {
  items: Interaction[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListInteractionsUseCase {
  constructor(private readonly interactionRepository: InteractionRepository) {}

  async execute(userId: string, query: ListInteractionsQueryDto): Promise<ListInteractionsResult> {
    const { page, pageSize, contactId, companyId, dealId, type, from, to } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const options = {
      userId,
      filters: {
        contactId,
        companyId,
        dealId,
        type,
        from,
        to,
      },
      skip,
      take,
    };

    const [items, total] = await Promise.all([
      this.interactionRepository.findAll(options),
      this.interactionRepository.count(options),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
