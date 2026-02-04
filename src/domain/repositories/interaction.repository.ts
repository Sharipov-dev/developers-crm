import type {
  CreateInteractionData,
  FindInteractionsOptions,
  Interaction,
  UpdateInteractionData,
} from '../entities/interaction.entity.js';

export interface InteractionRepository {
  findByIdAndUserId(id: string, userId: string): Promise<Interaction | null>;
  findAll(options: FindInteractionsOptions): Promise<Interaction[]>;
  count(options: FindInteractionsOptions): Promise<number>;
  create(data: CreateInteractionData): Promise<Interaction>;
  update(id: string, data: UpdateInteractionData): Promise<Interaction>;
  delete(id: string): Promise<void>;
}
