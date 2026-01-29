import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  Company,
  CreateCompanyData,
  FindCompaniesOptions,
  UpdateCompanyData,
} from '../../domain/entities/company.entity.js';
import type { CompanyRepository } from '../../domain/repositories/company.repository.js';

import { CompanyMapper, mapSizeToPrisma } from './company.mapper.js';

export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Company | null> {
    const company = await this.prisma.company.findFirst({
      where: { id, userId },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findByNameAndUserId(name: string, userId: string): Promise<Company | null> {
    const company = await this.prisma.company.findFirst({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findAll(options: FindCompaniesOptions): Promise<Company[]> {
    const { userId, filters, sort, skip = 0, take = 20 } = options;

    const where = this.buildWhereClause(userId, filters);
    const orderBy = this.buildOrderByClause(sort);

    const companies = await this.prisma.company.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return CompanyMapper.toDomainList(companies);
  }

  async count(options: FindCompaniesOptions): Promise<number> {
    const { userId, filters } = options;

    const where = this.buildWhereClause(userId, filters);

    return this.prisma.company.count({ where });
  }

  async create(data: CreateCompanyData): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        userId: data.userId,
        name: data.name,
        website: data.website ?? null,
        industry: data.industry ?? null,
        size: mapSizeToPrisma(data.size),
        notes: data.notes ?? null,
      },
    });

    return CompanyMapper.toDomain(company);
  }

  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    const updateData: Prisma.CompanyUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.website !== undefined) {
      updateData.website = data.website;
    }
    if (data.industry !== undefined) {
      updateData.industry = data.industry;
    }
    if (data.size !== undefined) {
      updateData.size = mapSizeToPrisma(data.size);
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateData,
    });

    return CompanyMapper.toDomain(company);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({
      where: { id },
    });
  }

  async existsByNameAndUserId(name: string, userId: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return count > 0;
  }

  private buildWhereClause(
    userId: string,
    filters?: FindCompaniesOptions['filters']
  ): Prisma.CompanyWhereInput {
    const where: Prisma.CompanyWhereInput = { userId };

    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { website: { contains: filters.q, mode: 'insensitive' } },
        { industry: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters?.industry) {
      where.industry = { equals: filters.industry, mode: 'insensitive' };
    }

    if (filters?.size) {
      where.size = mapSizeToPrisma(filters.size);
    }

    return where;
  }

  private buildOrderByClause(
    sort?: FindCompaniesOptions['sort']
  ): Prisma.CompanyOrderByWithRelationInput {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    return { [sort.field]: sort.order };
  }
}
