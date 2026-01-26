import { DisableAccountUseCase } from '../application/use-cases/user/disable-account.use-case.js';
import { GetCurrentUserUseCase } from '../application/use-cases/user/get-current-user.use-case.js';
import { LoginUserUseCase } from '../application/use-cases/user/login-user.use-case.js';
import { RegisterUserUseCase } from '../application/use-cases/user/register-user.use-case.js';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case.js';
import { prisma } from '../infrastructure/db/prisma.client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository.js';
import { JwtTokenService } from '../infrastructure/services/jwt.service.js';
import { BcryptPasswordService } from '../infrastructure/services/password.service.js';
import { HealthController } from '../interfaces/http/controllers/health.controller.js';
import { UserController } from '../interfaces/http/controllers/user.controller.js';
import { createAuthMiddleware } from '../interfaces/http/middlewares/auth.middleware.js';
import type { Controllers, Middlewares } from '../interfaces/http/routes/router.js';
import { env } from '../shared/config/env.config.js';

// Services
const passwordService = new BcryptPasswordService();
const jwtService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

// Repositories
const userRepository = new PrismaUserRepository(prisma);

// Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordService);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordService, jwtService);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const disableAccountUseCase = new DisableAccountUseCase(userRepository);

// Controllers
const healthController = new HealthController();
const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateProfileUseCase,
  disableAccountUseCase
);

// Middlewares
const authMiddleware = createAuthMiddleware(jwtService);

export const controllers: Controllers = {
  healthController,
  userController,
};

export const middlewares: Middlewares = {
  authMiddleware,
};

export const repositories = {
  userRepository,
};

export const services = {
  passwordService,
  jwtService,
};

export const useCases = {
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateProfileUseCase,
  disableAccountUseCase,
};
