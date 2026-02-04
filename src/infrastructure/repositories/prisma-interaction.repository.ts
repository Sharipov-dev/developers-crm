import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  CreateInteractionData,
  FindInteractionsOptions,
  Interaction,
  UpdateInteractionData,
} from '../../domain/entities/interaction.entity.js';
import type { InteractionRepository } from '../../domain/repositories/interaction.repository.js';

import { InteractionMapper, mapTypeToPrisma } from './interaction.mapper.js';

export class PrismaInteractionRepository implements InteractionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdAndUserId(id: string, userId: string): Promise<Interaction | null> {
    const interaction = await this.prisma.interaction.findFirst({
      where: { id, userId },
    });

    return interaction ? InteractionMapper.toDomain(interaction) : null;
  }

  async findAll(options: FindInteractionsOptions): Promise<Interaction[]> {
    const { userId, filters, skip = 0, take = 20 } = options;

    const where = this.buildWhereClause(userId, filters);

    const interactions = await this.prisma.interaction.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip,
      take,
    });

    return InteractionMapper.toDomainList(interactions);
  }

  async count(options: FindInteractionsOptions): Promise<number> {
    const { userId, filters } = options;

    const where = this.buildWhereClause(userId, filters);

    return this.prisma.interaction.count({ where });
  }

  async create(data: CreateInteractionData): Promise<Interaction> {
    const interaction = await this.prisma.interaction.create({
      data: {
        userId: data.userId,
        type: mapTypeToPrisma(data.type),
        occurredAt: data.occurredAt,
        summary: data.summary,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        dealId: data.dealId ?? null,
      },
    });

    return InteractionMapper.toDomain(interaction);
  }

  async update(id: string, data: UpdateInteractionData): Promise<Interaction> {
    const updateData: Prisma.InteractionUpdateInput = {};

    if (data.type !== undefined) {
      updateData.type = mapTypeToPrisma(data.type);
    }
    if (data.occurredAt !== undefined) {
      updateData.occurredAt = data.occurredAt;
    }
    if (data.summary !== undefined) {
      updateData.summary = data.summary;
    }
    if (data.contactId !== undefined) {
      updateData.contact = data.contactId
        ? { connect: { id: data.contactId } }
        : { disconnect: true };
    }
    if (data.companyId !== undefined) {
      updateData.company = data.companyId
        ? { connect: { id: data.companyId } }
        : { disconnect: true };
    }
    if (data.dealId !== undefined) {
      updateData.deal = data.dealId
        ? { connect: { id: data.dealId } }
        : { disconnect: true };
    }

    const interaction = await this.prisma.interaction.update({
      where: { id },
      data: updateData,
    });

    return InteractionMapper.toDomain(interaction);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.interaction.delete({
      where: { id },
    });
  }

  private buildWhereClause(
    userId: string,
    filters?: FindInteractionsOptions['filters']
  ): Prisma.InteractionWhereInput {
    const where: Prisma.InteractionWhereInput = { userId };

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.dealId) {
      where.dealId = filters.dealId;
    }

    if (filters?.type) {
      where.type = mapTypeToPrisma(filters.type);
    }

    if (filters?.from !== undefined || filters?.to !== undefined) {
      where.occurredAt = {};
      if (filters.from !== undefined) {
        where.occurredAt.gte = filters.from;
      }
      if (filters.to !== undefined) {
        where.occurredAt.lte = filters.to;
      }
    }

    return where;
  }
}
