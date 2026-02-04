import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  CreateDealData,
  Deal,
  FindDealsOptions,
  UpdateDealData,
} from '../../domain/entities/deal.entity.js';
import type { DealRepository } from '../../domain/repositories/deal.repository.js';

import { DealMapper, mapStageToPrisma } from './deal.mapper.js';

export class PrismaDealRepository implements DealRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Deal | null> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
    });

    return deal ? DealMapper.toDomain(deal) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Deal | null> {
    const deal = await this.prisma.deal.findFirst({
      where: { id, userId },
    });

    return deal ? DealMapper.toDomain(deal) : null;
  }

  async findAll(options: FindDealsOptions): Promise<Deal[]> {
    const { userId, filters, sort, skip = 0, take = 20 } = options;

    const where = this.buildWhereClause(userId, filters);
    const orderBy = this.buildOrderByClause(sort);

    const deals = await this.prisma.deal.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return DealMapper.toDomainList(deals);
  }

  async count(options: FindDealsOptions): Promise<number> {
    const { userId, filters } = options;

    const where = this.buildWhereClause(userId, filters);

    return this.prisma.deal.count({ where });
  }

  async create(data: CreateDealData): Promise<Deal> {
    const deal = await this.prisma.deal.create({
      data: {
        userId: data.userId,
        title: data.title,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        stage: data.stage ? mapStageToPrisma(data.stage) : 'lead',
        valueCents: data.valueCents ?? null,
        currency: data.currency ?? 'CAD',
        probability: data.probability ?? null,
        expectedCloseDate: data.expectedCloseDate ?? null,
      },
    });

    return DealMapper.toDomain(deal);
  }

  async update(id: string, data: UpdateDealData): Promise<Deal> {
    const updateData: Prisma.DealUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
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
    if (data.stage !== undefined) {
      updateData.stage = mapStageToPrisma(data.stage);
    }
    if (data.valueCents !== undefined) {
      updateData.valueCents = data.valueCents;
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }
    if (data.probability !== undefined) {
      updateData.probability = data.probability;
    }
    if (data.expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = data.expectedCloseDate;
    }
    if (data.lostReason !== undefined) {
      updateData.lostReason = data.lostReason;
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateData,
    });

    return DealMapper.toDomain(deal);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deal.delete({
      where: { id },
    });
  }

  private buildWhereClause(
    userId: string,
    filters?: FindDealsOptions['filters']
  ): Prisma.DealWhereInput {
    const where: Prisma.DealWhereInput = { userId };

    if (filters?.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { lostReason: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters?.stage) {
      where.stage = mapStageToPrisma(filters.stage);
    }

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.minValueCents !== undefined || filters?.maxValueCents !== undefined) {
      where.valueCents = {};
      if (filters.minValueCents !== undefined) {
        where.valueCents.gte = filters.minValueCents;
      }
      if (filters.maxValueCents !== undefined) {
        where.valueCents.lte = filters.maxValueCents;
      }
    }

    if (filters?.expectedCloseFrom !== undefined || filters?.expectedCloseTo !== undefined) {
      where.expectedCloseDate = {};
      if (filters.expectedCloseFrom !== undefined) {
        where.expectedCloseDate.gte = filters.expectedCloseFrom;
      }
      if (filters.expectedCloseTo !== undefined) {
        where.expectedCloseDate.lte = filters.expectedCloseTo;
      }
    }

    return where;
  }

  private buildOrderByClause(
    sort?: FindDealsOptions['sort']
  ): Prisma.DealOrderByWithRelationInput {
    if (!sort) {
      return { updatedAt: 'desc' };
    }

    return { [sort.field]: sort.order };
  }
}
