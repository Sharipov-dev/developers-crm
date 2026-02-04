import type { Deal } from '../../../domain/entities/deal.entity.js';
import { DealNotFoundError } from '../../../domain/errors/deal.errors.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';

export class GetDealUseCase {
  constructor(private readonly dealRepository: DealRepository) {}

  async execute(id: string, userId: string): Promise<Deal> {
    const deal = await this.dealRepository.findByIdAndUserId(id, userId);

    if (!deal) {
      throw new DealNotFoundError(id);
    }

    return deal;
  }
}
