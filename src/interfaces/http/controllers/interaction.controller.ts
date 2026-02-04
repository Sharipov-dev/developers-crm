import type { Request, Response } from 'express';

import type {
  CreateInteractionDto,
  InteractionResponseDto,
  ListInteractionsQueryDto,
  UpdateInteractionDto,
} from '../../../application/dto/interaction.dto.js';
import type { CreateInteractionUseCase } from '../../../application/use-cases/interaction/create-interaction.use-case.js';
import type { DeleteInteractionUseCase } from '../../../application/use-cases/interaction/delete-interaction.use-case.js';
import type { GetInteractionUseCase } from '../../../application/use-cases/interaction/get-interaction.use-case.js';
import type { ListInteractionsUseCase } from '../../../application/use-cases/interaction/list-interactions.use-case.js';
import type { UpdateInteractionUseCase } from '../../../application/use-cases/interaction/update-interaction.use-case.js';
import type { Interaction } from '../../../domain/entities/interaction.entity.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toInteractionResponse(interaction: Interaction): InteractionResponseDto {
  return {
    id: interaction.id,
    userId: interaction.userId,
    type: interaction.type,
    occurredAt: interaction.occurredAt.toISOString(),
    summary: interaction.summary,
    contactId: interaction.contactId,
    companyId: interaction.companyId,
    dealId: interaction.dealId,
    createdAt: interaction.createdAt.toISOString(),
    updatedAt: interaction.updatedAt.toISOString(),
  };
}

export class InteractionController {
  constructor(
    private readonly createInteractionUseCase: CreateInteractionUseCase,
    private readonly getInteractionUseCase: GetInteractionUseCase,
    private readonly listInteractionsUseCase: ListInteractionsUseCase,
    private readonly updateInteractionUseCase: UpdateInteractionUseCase,
    private readonly deleteInteractionUseCase: DeleteInteractionUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateInteractionDto;
    const interaction = await this.createInteractionUseCase.execute(userId, body);
    sendCreated(res, toInteractionResponse(interaction));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const interaction = await this.getInteractionUseCase.execute(id, userId);
    sendSuccess(res, toInteractionResponse(interaction));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListInteractionsQueryDto;
    const result = await this.listInteractionsUseCase.execute(userId, query);

    sendSuccess(
      res,
      result.items.map(toInteractionResponse),
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
    const body = req.body as UpdateInteractionDto;
    const interaction = await this.updateInteractionUseCase.execute(id, userId, body);
    sendSuccess(res, toInteractionResponse(interaction));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteInteractionUseCase.execute(id, userId);
    sendNoContent(res);
  }
}
