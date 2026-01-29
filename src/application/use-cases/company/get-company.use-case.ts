import type { Company } from '../../../domain/entities/company.entity.js';
import { CompanyNotFoundError } from '../../../domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';

export class GetCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string, userId: string): Promise<Company> {
    const company = await this.companyRepository.findByIdAndUserId(id, userId);

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    return company;
  }
}
