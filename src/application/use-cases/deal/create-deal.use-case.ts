import type { Deal } from '../../../domain/entities/deal.entity.js';
import {
  DealCompanyAccessDeniedError,
  DealContactAccessDeniedError,
  DealMissingAssociationError,
} from '../../../domain/errors/deal.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { CreateDealDto } from '../../dto/deal.dto.js';

export class CreateDealUseCase {
  constructor(
    private readonly dealRepository: DealRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(userId: string, data: CreateDealDto): Promise<Deal> {
    if (!data.contactId && !data.companyId) {
      throw new DealMissingAssociationError();
    }

    if (data.contactId) {
      const contact = await this.contactRepository.findByIdAndUserId(data.contactId, userId);
      if (!contact) {
        throw new DealContactAccessDeniedError(data.contactId);
      }
    }

    if (data.companyId) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);
      if (!company) {
        throw new DealCompanyAccessDeniedError(data.companyId);
      }
    }

    return this.dealRepository.create({
      userId,
      title: data.title,
      contactId: data.contactId,
      companyId: data.companyId,
      stage: data.stage,
      valueCents: data.valueCents,
      currency: data.currency,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate,
    });
  }
}
