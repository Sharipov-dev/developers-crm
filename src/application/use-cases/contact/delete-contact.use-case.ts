import { ContactNotFoundError } from '../../../domain/errors/contact.errors.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';

export class DeleteContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const contact = await this.contactRepository.findByIdAndUserId(id, userId);

    if (!contact) {
      throw new ContactNotFoundError(id);
    }

    await this.contactRepository.delete(id);
  }
}
