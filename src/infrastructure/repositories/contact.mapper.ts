import type {
  Contact as PrismaContact,
  ContactSource as PrismaContactSource,
  ContactStatus as PrismaContactStatus,
} from '@prisma/client';

import type { Contact, ContactSource, ContactStatus } from '../../domain/entities/contact.entity.js';

function mapSource(source: PrismaContactSource | null): ContactSource | null {
  if (!source) {
    return null;
  }
  return source as ContactSource;
}

function mapStatus(status: PrismaContactStatus): ContactStatus {
  return status as ContactStatus;
}

export function mapSourceToPrisma(source: ContactSource | null | undefined): PrismaContactSource | null {
  if (!source) {
    return null;
  }
  return source as PrismaContactSource;
}

export function mapStatusToPrisma(status: ContactStatus): PrismaContactStatus {
  return status as PrismaContactStatus;
}

export class ContactMapper {
  static toDomain(prismaContact: PrismaContact): Contact {
    return {
      id: prismaContact.id,
      userId: prismaContact.userId,
      companyId: prismaContact.companyId,
      firstName: prismaContact.firstName,
      lastName: prismaContact.lastName,
      email: prismaContact.email,
      phone: prismaContact.phone,
      title: prismaContact.title,
      source: mapSource(prismaContact.source),
      status: mapStatus(prismaContact.status),
      lastContactedAt: prismaContact.lastContactedAt,
      createdAt: prismaContact.createdAt,
      updatedAt: prismaContact.updatedAt,
    };
  }

  static toDomainList(prismaContacts: PrismaContact[]): Contact[] {
    return prismaContacts.map(ContactMapper.toDomain);
  }
}
