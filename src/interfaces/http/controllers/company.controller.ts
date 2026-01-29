import type { Request, Response } from 'express';

import type {
  CompanyResponseDto,
  CreateCompanyDto,
  ListCompaniesQueryDto,
  UpdateCompanyDto,
} from '../../../application/dto/company.dto.js';
import type { CreateCompanyUseCase } from '../../../application/use-cases/company/create-company.use-case.js';
import type { DeleteCompanyUseCase } from '../../../application/use-cases/company/delete-company.use-case.js';
import type { GetCompanyUseCase } from '../../../application/use-cases/company/get-company.use-case.js';
import type { ListCompaniesUseCase } from '../../../application/use-cases/company/list-companies.use-case.js';
import type { UpdateCompanyUseCase } from '../../../application/use-cases/company/update-company.use-case.js';
import type { Company } from '../../../domain/entities/company.entity.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toCompanyResponse(company: Company): CompanyResponseDto {
  return {
    id: company.id,
    userId: company.userId,
    name: company.name,
    website: company.website,
    industry: company.industry,
    size: company.size,
    notes: company.notes,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateCompanyDto;
    const company = await this.createCompanyUseCase.execute(userId, body);
    sendCreated(res, toCompanyResponse(company));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const company = await this.getCompanyUseCase.execute(id, userId);
    sendSuccess(res, toCompanyResponse(company));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListCompaniesQueryDto;
    const result = await this.listCompaniesUseCase.execute(userId, query);

    sendSuccess(
      res,
      result.items.map(toCompanyResponse),
      200,
      {
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      }
    );
  }

  async update(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as UpdateCompanyDto;
    const company = await this.updateCompanyUseCase.execute(id, userId, body);
    sendSuccess(res, toCompanyResponse(company));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteCompanyUseCase.execute(id, userId);
    sendNoContent(res);
  }
}
