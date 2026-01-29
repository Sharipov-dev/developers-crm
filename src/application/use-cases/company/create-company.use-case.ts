import type { Company } from '../../../domain/entities/company.entity.js';
import { CompanyNameAlreadyExistsError } from '../../../domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { CreateCompanyDto } from '../../dto/company.dto.js';

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(userId: string, data: CreateCompanyDto): Promise<Company> {
    const nameExists = await this.companyRepository.existsByNameAndUserId(
      data.name.toLowerCase(),
      userId
    );

    if (nameExists) {
      throw new CompanyNameAlreadyExistsError(data.name);
    }

    return this.companyRepository.create({
      userId,
      name: data.name,
      website: data.website,
      industry: data.industry,
      size: data.size,
      notes: data.notes,
    });
  }
}
