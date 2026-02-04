import type { Interaction } from '../../../domain/entities/interaction.entity.js';
import {
  InteractionCompanyAccessDeniedError,
  InteractionContactAccessDeniedError,
  InteractionDealAccessDeniedError,
  InteractionMissingAssociationError,
  InteractionNotFoundError,
} from '../../../domain/errors/interaction.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { InteractionRepository } from '../../../domain/repositories/interaction.repository.js';
import type { UpdateInteractionDto } from '../../dto/interaction.dto.js';

export class UpdateInteractionUseCase {
  constructor(
    private readonly interactionRepository: InteractionRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dealRepository: DealRepository
  ) {}

  async execute(id: string, userId: string, data: UpdateInteractionDto): Promise<Interaction> {
    const interaction = await this.interactionRepository.findByIdAndUserId(id, userId);

    if (!interaction) {
      throw new InteractionNotFoundError(id);
    }

    if (data.contactId !== undefined && data.contactId !== null) {
      const contact = await this.contactRepository.findByIdAndUserId(data.contactId, userId);
      if (!contact) {
        throw new InteractionContactAccessDeniedError(data.contactId);
      }
    }

    if (data.companyId !== undefined && data.companyId !== null) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);
      if (!company) {
        throw new InteractionCompanyAccessDeniedError(data.companyId);
      }
    }

    if (data.dealId !== undefined && data.dealId !== null) {
      const deal = await this.dealRepository.findByIdAndUserId(data.dealId, userId);
      if (!deal) {
        throw new InteractionDealAccessDeniedError(data.dealId);
      }
    }

    const resultingContactId = data.contactId !== undefined ? data.contactId : interaction.contactId;
    const resultingCompanyId = data.companyId !== undefined ? data.companyId : interaction.companyId;
    const resultingDealId = data.dealId !== undefined ? data.dealId : interaction.dealId;

    if (!resultingContactId && !resultingCompanyId && !resultingDealId) {
      throw new InteractionMissingAssociationError();
    }

    return this.interactionRepository.update(id, {
      type: data.type,
      occurredAt: data.occurredAt,
      summary: data.summary,
      contactId: data.contactId,
      companyId: data.companyId,
      dealId: data.dealId,
    });
  }
}
