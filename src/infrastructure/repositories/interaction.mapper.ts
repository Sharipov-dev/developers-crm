import type {
  Interaction as PrismaInteraction,
  InteractionType as PrismaInteractionType,
} from '@prisma/client';

import type { Interaction, InteractionType } from '../../domain/entities/interaction.entity.js';

function mapType(type: PrismaInteractionType): InteractionType {
  return type as InteractionType;
}

export function mapTypeToPrisma(type: InteractionType): PrismaInteractionType {
  return type as PrismaInteractionType;
}

export class InteractionMapper {
  static toDomain(prismaInteraction: PrismaInteraction): Interaction {
    return {
      id: prismaInteraction.id,
      userId: prismaInteraction.userId,
      type: mapType(prismaInteraction.type),
      occurredAt: prismaInteraction.occurredAt,
      summary: prismaInteraction.summary,
      contactId: prismaInteraction.contactId,
      companyId: prismaInteraction.companyId,
      dealId: prismaInteraction.dealId,
      createdAt: prismaInteraction.createdAt,
      updatedAt: prismaInteraction.updatedAt,
    };
  }

  static toDomainList(prismaInteractions: PrismaInteraction[]): Interaction[] {
    return prismaInteractions.map(InteractionMapper.toDomain);
  }
}
