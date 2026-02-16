import type { Request, Response } from 'express';

import type {
  CreateTaskDto,
  ListTasksQueryDto,
  TaskResponseDto,
  UpdateTaskDto,
} from '../../../application/dto/task.dto.js';
import type { CompleteTaskUseCase } from '../../../application/use-cases/task/complete-task.use-case.js';
import type { CreateTaskUseCase } from '../../../application/use-cases/task/create-task.use-case.js';
import type { DeleteTaskUseCase } from '../../../application/use-cases/task/delete-task.use-case.js';
import type { GetTaskUseCase } from '../../../application/use-cases/task/get-task.use-case.js';
import type { ListTasksUseCase } from '../../../application/use-cases/task/list-tasks.use-case.js';
import type { ReopenTaskUseCase } from '../../../application/use-cases/task/reopen-task.use-case.js';
import type { UpdateTaskUseCase } from '../../../application/use-cases/task/update-task.use-case.js';
import type { Task } from '../../../domain/entities/task.entity.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toTaskResponse(task: Task): TaskResponseDto {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
    status: task.status,
    priority: task.priority,
    contactId: task.contactId,
    companyId: task.companyId,
    dealId: task.dealId,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase,
    private readonly reopenTaskUseCase: ReopenTaskUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateTaskDto;
    const task = await this.createTaskUseCase.execute(userId, body);
    sendCreated(res, toTaskResponse(task));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const task = await this.getTaskUseCase.execute(id, userId);
    sendSuccess(res, toTaskResponse(task));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListTasksQueryDto;
    const result = await this.listTasksUseCase.execute(userId, query);

    sendSuccess(
      res,
      result.items.map(toTaskResponse),
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
    const body = req.body as UpdateTaskDto;
    const task = await this.updateTaskUseCase.execute(id, userId, body);
    sendSuccess(res, toTaskResponse(task));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteTaskUseCase.execute(id, userId);
    sendNoContent(res);
  }

  async complete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const task = await this.completeTaskUseCase.execute(id, userId);
    sendSuccess(res, toTaskResponse(task));
  }

  async reopen(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const task = await this.reopenTaskUseCase.execute(id, userId);
    sendSuccess(res, toTaskResponse(task));
  }
}
