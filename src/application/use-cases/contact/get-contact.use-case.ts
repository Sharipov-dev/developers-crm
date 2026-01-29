import type { Contact } from '../../../domain/entities/contact.entity.js';
import { ContactNotFoundError } from '../../../domain/errors/contact.errors.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';

export class GetContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: string, userId: string): Promise<Contact> {
    const contact = await this.contactRepository.findByIdAndUserId(id, userId);

    if (!contact) {
      throw new ContactNotFoundError(id);
    }

    return contact;
  }
}
