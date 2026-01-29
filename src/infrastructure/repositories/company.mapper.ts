import type { Company as PrismaCompany, CompanySize as PrismaCompanySize } from '@prisma/client';

import type { Company, CompanySize } from '../../domain/entities/company.entity.js';

function mapSize(size: PrismaCompanySize | null): CompanySize | null {
  if (!size) {
    return null;
  }

  const sizeMap: Record<PrismaCompanySize, CompanySize> = {
    solo: 'solo',
    size_1_10: '1-10',
    size_11_50: '11-50',
    size_51_200: '51-200',
    size_200_plus: '200+',
  };

  return sizeMap[size];
}

export function mapSizeToPrisma(size: CompanySize | null | undefined): PrismaCompanySize | null {
  if (!size) {
    return null;
  }

  const sizeMap: Record<CompanySize, PrismaCompanySize> = {
    solo: 'solo',
    '1-10': 'size_1_10',
    '11-50': 'size_11_50',
    '51-200': 'size_51_200',
    '200+': 'size_200_plus',
  };

  return sizeMap[size];
}

export class CompanyMapper {
  static toDomain(prismaCompany: PrismaCompany): Company {
    return {
      id: prismaCompany.id,
      userId: prismaCompany.userId,
      name: prismaCompany.name,
      website: prismaCompany.website,
      industry: prismaCompany.industry,
      size: mapSize(prismaCompany.size),
      notes: prismaCompany.notes,
      createdAt: prismaCompany.createdAt,
      updatedAt: prismaCompany.updatedAt,
    };
  }

  static toDomainList(prismaCompanies: PrismaCompany[]): Company[] {
    return prismaCompanies.map(CompanyMapper.toDomain);
  }
}
