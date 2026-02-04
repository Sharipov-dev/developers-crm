import { InteractionNotFoundError } from '../../../domain/errors/interaction.errors.js';
import type { InteractionRepository } from '../../../domain/repositories/interaction.repository.js';

export class DeleteInteractionUseCase {
  constructor(private readonly interactionRepository: InteractionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const interaction = await this.interactionRepository.findByIdAndUserId(id, userId);

    if (!interaction) {
      throw new InteractionNotFoundError(id);
    }

    await this.interactionRepository.delete(id);
  }
}
