import { CompanyNotFoundError } from '../../../domain/errors/company.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const company = await this.companyRepository.findByIdAndUserId(id, userId);

    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    await this.companyRepository.delete(id);
  }
}
