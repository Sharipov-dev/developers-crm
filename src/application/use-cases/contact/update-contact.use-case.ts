import type { Contact } from '../../../domain/entities/contact.entity.js';
import {
  ContactCompanyAccessDeniedError,
  ContactEmailAlreadyExistsError,
  ContactNotFoundError,
} from '../../../domain/errors/contact.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { UpdateContactDto } from '../../dto/contact.dto.js';

export class UpdateContactUseCase {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(id: string, userId: string, data: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.findByIdAndUserId(id, userId);

    if (!contact) {
      throw new ContactNotFoundError(id);
    }

    if (
      data.email !== undefined &&
      data.email !== null &&
      data.email.toLowerCase() !== contact.email?.toLowerCase()
    ) {
      const emailExists = await this.contactRepository.existsByEmailAndUserId(
        data.email.toLowerCase(),
        userId
      );

      if (emailExists) {
        throw new ContactEmailAlreadyExistsError(data.email);
      }
    }

    if (data.companyId !== undefined && data.companyId !== null) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);

      if (!company) {
        throw new ContactCompanyAccessDeniedError(data.companyId);
      }
    }

    return this.contactRepository.update(id, {
      companyId: data.companyId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      title: data.title,
      source: data.source,
      status: data.status,
    });
  }
}
