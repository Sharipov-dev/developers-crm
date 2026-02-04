import type { Deal } from '../../../domain/entities/deal.entity.js';
import {
  DealCompanyAccessDeniedError,
  DealContactAccessDeniedError,
  DealMissingAssociationError,
  DealNotFoundError,
  DealStageConflictError,
} from '../../../domain/errors/deal.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { UpdateDealDto } from '../../dto/deal.dto.js';

export class UpdateDealUseCase {
  constructor(
    private readonly dealRepository: DealRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(id: string, userId: string, data: UpdateDealDto): Promise<Deal> {
    const deal = await this.dealRepository.findByIdAndUserId(id, userId);

    if (!deal) {
      throw new DealNotFoundError(id);
    }

    if (deal.stage === 'won' || deal.stage === 'lost') {
      throw new DealStageConflictError(deal.stage);
    }

    if (data.contactId !== undefined && data.contactId !== null) {
      const contact = await this.contactRepository.findByIdAndUserId(data.contactId, userId);
      if (!contact) {
        throw new DealContactAccessDeniedError(data.contactId);
      }
    }

    if (data.companyId !== undefined && data.companyId !== null) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);
      if (!company) {
        throw new DealCompanyAccessDeniedError(data.companyId);
      }
    }

    const resultingContactId = data.contactId !== undefined ? data.contactId : deal.contactId;
    const resultingCompanyId = data.companyId !== undefined ? data.companyId : deal.companyId;

    if (!resultingContactId && !resultingCompanyId) {
      throw new DealMissingAssociationError();
    }

    return this.dealRepository.update(id, {
      title: data.title,
      contactId: data.contactId,
      companyId: data.companyId,
      stage: data.stage,
      valueCents: data.valueCents,
      currency: data.currency,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate,
      lostReason: data.lostReason,
    });
  }
}
