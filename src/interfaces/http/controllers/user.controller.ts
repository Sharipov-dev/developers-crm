import type { Request, Response } from 'express';

import type { LoginResponseDto, LoginUserDto, RegisterUserDto, UpdateProfileDto, UserResponseDto } from '../../../application/dto/user.dto.js';
import type { DisableAccountUseCase } from '../../../application/use-cases/user/disable-account.use-case.js';
import type { GetCurrentUserUseCase } from '../../../application/use-cases/user/get-current-user.use-case.js';
import type { LoginUserUseCase } from '../../../application/use-cases/user/login-user.use-case.js';
import type { RegisterUserUseCase } from '../../../application/use-cases/user/register-user.use-case.js';
import type { UpdateProfileUseCase } from '../../../application/use-cases/user/update-profile.use-case.js';
import type { User } from '../../../domain/entities/user.entity.js';
import { sendCreated, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly disableAccountUseCase: DisableAccountUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const body = req.body as RegisterUserDto;
    const user = await this.registerUserUseCase.execute(body);
    sendCreated(res, toUserResponse(user));
  }

  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as LoginUserDto;
    const result = await this.loginUserUseCase.execute(body);
    const response: LoginResponseDto = {
      accessToken: result.accessToken,
      user: toUserResponse(result.user),
    };
    sendSuccess(res, response);
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const user = await this.getCurrentUserUseCase.execute(userId);
    sendSuccess(res, toUserResponse(user));
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as UpdateProfileDto;
    const user = await this.updateProfileUseCase.execute(userId, body);
    sendSuccess(res, toUserResponse(user));
  }

  async disableAccount(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const user = await this.disableAccountUseCase.execute(userId);
    sendSuccess(res, toUserResponse(user));
  }
}
