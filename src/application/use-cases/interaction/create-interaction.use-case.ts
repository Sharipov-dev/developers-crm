import type { Interaction } from '../../../domain/entities/interaction.entity.js';
import {
  InteractionCompanyAccessDeniedError,
  InteractionContactAccessDeniedError,
  InteractionDealAccessDeniedError,
  InteractionMissingAssociationError,
} from '../../../domain/errors/interaction.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { InteractionRepository } from '../../../domain/repositories/interaction.repository.js';
import type { CreateInteractionDto } from '../../dto/interaction.dto.js';

export class CreateInteractionUseCase {
  constructor(
    private readonly interactionRepository: InteractionRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dealRepository: DealRepository
  ) {}

  async execute(userId: string, data: CreateInteractionDto): Promise<Interaction> {
    if (!data.contactId && !data.companyId && !data.dealId) {
      throw new InteractionMissingAssociationError();
    }

    if (data.contactId) {
      const contact = await this.contactRepository.findByIdAndUserId(data.contactId, userId);
      if (!contact) {
        throw new InteractionContactAccessDeniedError(data.contactId);
      }
    }

    if (data.companyId) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);
      if (!company) {
        throw new InteractionCompanyAccessDeniedError(data.companyId);
      }
    }

    if (data.dealId) {
      const deal = await this.dealRepository.findByIdAndUserId(data.dealId, userId);
      if (!deal) {
        throw new InteractionDealAccessDeniedError(data.dealId);
      }
    }

    return this.interactionRepository.create({
      userId,
      type: data.type,
      occurredAt: data.occurredAt,
      summary: data.summary,
      contactId: data.contactId,
      companyId: data.companyId,
      dealId: data.dealId,
    });
  }
}
