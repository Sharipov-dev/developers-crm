import { DealNotFoundError } from '../../../domain/errors/deal.errors.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';

export class DeleteDealUseCase {
  constructor(private readonly dealRepository: DealRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deal = await this.dealRepository.findByIdAndUserId(id, userId);

    if (!deal) {
      throw new DealNotFoundError(id);
    }

    await this.dealRepository.delete(id);
  }
}
