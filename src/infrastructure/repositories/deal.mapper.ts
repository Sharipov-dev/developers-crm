import type {
  Deal as PrismaDeal,
  DealStage as PrismaDealStage,
} from '@prisma/client';

import type { Deal, DealStage } from '../../domain/entities/deal.entity.js';

function mapStage(stage: PrismaDealStage): DealStage {
  return stage as DealStage;
}

export function mapStageToPrisma(stage: DealStage): PrismaDealStage {
  return stage as PrismaDealStage;
}

export class DealMapper {
  static toDomain(prismaDeal: PrismaDeal): Deal {
    return {
      id: prismaDeal.id,
      userId: prismaDeal.userId,
      title: prismaDeal.title,
      contactId: prismaDeal.contactId,
      companyId: prismaDeal.companyId,
      stage: mapStage(prismaDeal.stage),
      valueCents: prismaDeal.valueCents,
      currency: prismaDeal.currency,
      probability: prismaDeal.probability,
      expectedCloseDate: prismaDeal.expectedCloseDate,
      lostReason: prismaDeal.lostReason,
      createdAt: prismaDeal.createdAt,
      updatedAt: prismaDeal.updatedAt,
    };
  }

  static toDomainList(prismaDeals: PrismaDeal[]): Deal[] {
    return prismaDeals.map(DealMapper.toDomain);
  }
}
