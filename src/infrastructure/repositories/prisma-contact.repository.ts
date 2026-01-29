import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  Contact,
  CreateContactData,
  FindContactsOptions,
  UpdateContactData,
} from '../../domain/entities/contact.entity.js';
import type { ContactRepository } from '../../domain/repositories/contact.repository.js';

import { ContactMapper, mapSourceToPrisma, mapStatusToPrisma } from './contact.mapper.js';

export class PrismaContactRepository implements ContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Contact | null> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    return contact ? ContactMapper.toDomain(contact) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Contact | null> {
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId },
    });

    return contact ? ContactMapper.toDomain(contact) : null;
  }

  async findByEmailAndUserId(email: string, userId: string): Promise<Contact | null> {
    const contact = await this.prisma.contact.findFirst({
      where: {
        userId,
        email: { equals: email, mode: 'insensitive' },
      },
    });

    return contact ? ContactMapper.toDomain(contact) : null;
  }

  async findAll(options: FindContactsOptions): Promise<Contact[]> {
    const { userId, filters, sort, skip = 0, take = 20 } = options;

    const where = this.buildWhereClause(userId, filters);
    const orderBy = this.buildOrderByClause(sort);

    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return ContactMapper.toDomainList(contacts);
  }

  async count(options: FindContactsOptions): Promise<number> {
    const { userId, filters } = options;

    const where = this.buildWhereClause(userId, filters);

    return this.prisma.contact.count({ where });
  }

  async create(data: CreateContactData): Promise<Contact> {
    const contact = await this.prisma.contact.create({
      data: {
        userId: data.userId,
        companyId: data.companyId ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        title: data.title ?? null,
        source: mapSourceToPrisma(data.source),
        status: data.status ? mapStatusToPrisma(data.status) : 'lead',
      },
    });

    return ContactMapper.toDomain(contact);
  }

  async update(id: string, data: UpdateContactData): Promise<Contact> {
    const updateData: Prisma.ContactUpdateInput = {};

    if (data.companyId !== undefined) {
      updateData.company = data.companyId
        ? { connect: { id: data.companyId } }
        : { disconnect: true };
    }
    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.source !== undefined) {
      updateData.source = mapSourceToPrisma(data.source);
    }
    if (data.status) {
      updateData.status = mapStatusToPrisma(data.status);
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateData,
    });

    return ContactMapper.toDomain(contact);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact.delete({
      where: { id },
    });
  }

  async existsByEmailAndUserId(email: string, userId: string): Promise<boolean> {
    const count = await this.prisma.contact.count({
      where: {
        userId,
        email: { equals: email, mode: 'insensitive' },
      },
    });

    return count > 0;
  }

  private buildWhereClause(
    userId: string,
    filters?: FindContactsOptions['filters']
  ): Prisma.ContactWhereInput {
    const where: Prisma.ContactWhereInput = { userId };

    if (filters?.q) {
      where.OR = [
        { firstName: { contains: filters.q, mode: 'insensitive' } },
        { lastName: { contains: filters.q, mode: 'insensitive' } },
        { email: { contains: filters.q, mode: 'insensitive' } },
        { phone: { contains: filters.q, mode: 'insensitive' } },
        { title: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.source) {
      where.source = mapSourceToPrisma(filters.source);
    }

    return where;
  }

  private buildOrderByClause(
    sort?: FindContactsOptions['sort']
  ): Prisma.ContactOrderByWithRelationInput | Prisma.ContactOrderByWithRelationInput[] {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    if (sort.field === 'name') {
      return [{ lastName: sort.order }, { firstName: sort.order }];
    }

    return { [sort.field]: sort.order };
  }
}
