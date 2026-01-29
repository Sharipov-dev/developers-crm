import type { Company } from '../../../domain/entities/company.entity.js';
import {
  CompanyNameAlreadyExistsError,
  CompanyNotFoundError,
} from '../../../domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { UpdateCompanyDto } from '../../dto/company.dto.js';

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string, userId: string, data: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.findByIdAndUserId(id, userId);

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    if (data.name && data.name.toLowerCase() !== company.name.toLowerCase()) {
      const nameExists = await this.companyRepository.existsByNameAndUserId(
        data.name.toLowerCase(),
        userId
      );

      if (nameExists) {
        throw new CompanyNameAlreadyExistsError(data.name);
      }
    }

    return this.companyRepository.update(id, {
      name: data.name,
      website: data.website,
      industry: data.industry,
      size: data.size,
      notes: data.notes,
    });
  }
}
