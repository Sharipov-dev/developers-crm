import type { Request, Response } from 'express';

import type {
  CreateDealDto,
  DealResponseDto,
  ListDealsQueryDto,
  MarkLostDto,
  UpdateDealDto,
} from '../../../application/dto/deal.dto.js';
import type { CreateDealUseCase } from '../../../application/use-cases/deal/create-deal.use-case.js';
import type { DeleteDealUseCase } from '../../../application/use-cases/deal/delete-deal.use-case.js';
import type { GetDealUseCase } from '../../../application/use-cases/deal/get-deal.use-case.js';
import type { ListDealsUseCase } from '../../../application/use-cases/deal/list-deals.use-case.js';
import type { MarkDealLostUseCase } from '../../../application/use-cases/deal/mark-deal-lost.use-case.js';
import type { MarkDealWonUseCase } from '../../../application/use-cases/deal/mark-deal-won.use-case.js';
import type { UpdateDealUseCase } from '../../../application/use-cases/deal/update-deal.use-case.js';
import type { Deal } from '../../../domain/entities/deal.entity.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toDealResponse(deal: Deal): DealResponseDto {
  return {
    id: deal.id,
    userId: deal.userId,
    title: deal.title,
    contactId: deal.contactId,
    companyId: deal.companyId,
    stage: deal.stage,
    valueCents: deal.valueCents,
    currency: deal.currency,
    probability: deal.probability,
    expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
    lostReason: deal.lostReason,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  };
}

export class DealController {
  constructor(
    private readonly createDealUseCase: CreateDealUseCase,
    private readonly getDealUseCase: GetDealUseCase,
    private readonly listDealsUseCase: ListDealsUseCase,
    private readonly updateDealUseCase: UpdateDealUseCase,
    private readonly deleteDealUseCase: DeleteDealUseCase,
    private readonly markDealWonUseCase: MarkDealWonUseCase,
    private readonly markDealLostUseCase: MarkDealLostUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateDealDto;
    const deal = await this.createDealUseCase.execute(userId, body);
    sendCreated(res, toDealResponse(deal));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const deal = await this.getDealUseCase.execute(id, userId);
    sendSuccess(res, toDealResponse(deal));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListDealsQueryDto;
    const result = await this.listDealsUseCase.execute(userId, query);

    sendSuccess(
      res,
      result.items.map(toDealResponse),
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
    const body = req.body as UpdateDealDto;
    const deal = await this.updateDealUseCase.execute(id, userId, body);
    sendSuccess(res, toDealResponse(deal));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteDealUseCase.execute(id, userId);
    sendNoContent(res);
  }

  async markWon(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const deal = await this.markDealWonUseCase.execute(id, userId);
    sendSuccess(res, toDealResponse(deal));
  }

  async markLost(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as MarkLostDto;
    const deal = await this.markDealLostUseCase.execute(id, userId, body);
    sendSuccess(res, toDealResponse(deal));
  }
}
