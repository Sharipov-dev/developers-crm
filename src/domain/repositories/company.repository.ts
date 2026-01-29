import type {
  Company,
  CreateCompanyData,
  FindCompaniesOptions,
  UpdateCompanyData,
} from '../entities/company.entity.js';

export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Company | null>;
  findByNameAndUserId(name: string, userId: string): Promise<Company | null>;
  findAll(options: FindCompaniesOptions): Promise<Company[]>;
  count(options: FindCompaniesOptions): Promise<number>;
  create(data: CreateCompanyData): Promise<Company>;
  update(id: string, data: UpdateCompanyData): Promise<Company>;
  delete(id: string): Promise<void>;
  existsByNameAndUserId(name: string, userId: string): Promise<boolean>;
}
