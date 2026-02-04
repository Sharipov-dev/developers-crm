import type { Interaction } from '../../../domain/entities/interaction.entity.js';
import { InteractionNotFoundError } from '../../../domain/errors/interaction.errors.js';
import type { InteractionRepository } from '../../../domain/repositories/interaction.repository.js';

export class GetInteractionUseCase {
  constructor(private readonly interactionRepository: InteractionRepository) {}

  async execute(id: string, userId: string): Promise<Interaction> {
    const interaction = await this.interactionRepository.findByIdAndUserId(id, userId);

    if (!interaction) {
      throw new InteractionNotFoundError(id);
    }

    return interaction;
  }
}
