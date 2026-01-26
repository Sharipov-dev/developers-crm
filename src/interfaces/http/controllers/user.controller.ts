import type { Request, Response } from 'express';

import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../../application/dto/user.dto.js';
import type { CreateUserUseCase } from '../../../application/use-cases/user/create-user.use-case.js';
import type { DeleteUserUseCase } from '../../../application/use-cases/user/delete-user.use-case.js';
import type { GetUserByIdUseCase } from '../../../application/use-cases/user/get-user-by-id.use-case.js';
import type { ListUsersUseCase } from '../../../application/use-cases/user/list-users.use-case.js';
import type { UpdateUserUseCase } from '../../../application/use-cases/user/update-user.use-case.js';
import type { User } from '../../../domain/entities/user.entity.js';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../../shared/utils/response.js';

function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateUserDto;
    const user = await this.createUserUseCase.execute(body);
    sendCreated(res, toUserResponse(user));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await this.getUserByIdUseCase.execute(id);
    sendSuccess(res, toUserResponse(user));
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as { page: number; pageSize: number };
    const result = await this.listUsersUseCase.execute(query);
    sendPaginated(res, {
      items: result.users.map(toUserResponse),
      meta: result.meta,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const body = req.body as UpdateUserDto;
    const user = await this.updateUserUseCase.execute(id, body);
    sendSuccess(res, toUserResponse(user));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await this.deleteUserUseCase.execute(id);
    sendNoContent(res);
  }
}
