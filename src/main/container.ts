import { CreateCategoryUseCase } from '../application/use-cases/category/create-category.use-case.js';
import { DeleteCategoryUseCase } from '../application/use-cases/category/delete-category.use-case.js';
import { GetCategoryUseCase } from '../application/use-cases/category/get-category.use-case.js';
import { ListCategoriesUseCase } from '../application/use-cases/category/list-categories.use-case.js';
import { UpdateCategoryUseCase } from '../application/use-cases/category/update-category.use-case.js';
import { DisableAccountUseCase } from '../application/use-cases/user/disable-account.use-case.js';
import { GetCurrentUserUseCase } from '../application/use-cases/user/get-current-user.use-case.js';
import { LoginUserUseCase } from '../application/use-cases/user/login-user.use-case.js';
import { RegisterUserUseCase } from '../application/use-cases/user/register-user.use-case.js';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case.js';
import { prisma } from '../infrastructure/db/prisma.client.js';
import { PrismaCategoryRepository } from '../infrastructure/repositories/prisma-category.repository.js';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository.js';
import { JwtTokenService } from '../infrastructure/services/jwt.service.js';
import { BcryptPasswordService } from '../infrastructure/services/password.service.js';
import { CategoryController } from '../interfaces/http/controllers/category.controller.js';
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
const categoryRepository = new PrismaCategoryRepository(prisma);

// Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordService);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordService, jwtService);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const disableAccountUseCase = new DisableAccountUseCase(userRepository);

const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
const getCategoryUseCase = new GetCategoryUseCase(categoryRepository);
const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);

// Controllers
const healthController = new HealthController();
const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateProfileUseCase,
  disableAccountUseCase
);
const categoryController = new CategoryController(
  createCategoryUseCase,
  getCategoryUseCase,
  listCategoriesUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase
);

// Middlewares
const authMiddleware = createAuthMiddleware(jwtService);

export const controllers: Controllers = {
  healthController,
  userController,
  categoryController,
};

export const middlewares: Middlewares = {
  authMiddleware,
};

export const repositories = {
  userRepository,
  categoryRepository,
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
  createCategoryUseCase,
  getCategoryUseCase,
  listCategoriesUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
};
