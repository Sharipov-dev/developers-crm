import type { Contact } from '../../../domain/entities/contact.entity.js';
import {
  ContactCompanyAccessDeniedError,
  ContactEmailAlreadyExistsError,
} from '../../../domain/errors/contact.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { CreateContactDto } from '../../dto/contact.dto.js';

export class CreateContactUseCase {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(userId: string, data: CreateContactDto): Promise<Contact> {
    if (data.email) {
      const emailExists = await this.contactRepository.existsByEmailAndUserId(
        data.email.toLowerCase(),
        userId
      );

      if (emailExists) {
        throw new ContactEmailAlreadyExistsError(data.email);
      }
    }

    if (data.companyId) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);

      if (!company) {
        throw new ContactCompanyAccessDeniedError(data.companyId);
      }
    }

    return this.contactRepository.create({
      userId,
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
