import type { Deal } from '../../../domain/entities/deal.entity.js';
import { DealNotFoundError, DealStageConflictError } from '../../../domain/errors/deal.errors.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';

export class MarkDealWonUseCase {
  constructor(private readonly dealRepository: DealRepository) {}

  async execute(id: string, userId: string): Promise<Deal> {
    const deal = await this.dealRepository.findByIdAndUserId(id, userId);

    if (!deal) {
      throw new DealNotFoundError(id);
    }

    if (deal.stage === 'won' || deal.stage === 'lost') {
      throw new DealStageConflictError(deal.stage);
    }

    return this.dealRepository.update(id, {
      stage: 'won',
      probability: 100,
      lostReason: null,
    });
  }
}
