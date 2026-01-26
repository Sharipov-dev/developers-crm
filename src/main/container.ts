import { CreateUserUseCase } from '../application/use-cases/user/create-user.use-case.js';
import { DeleteUserUseCase } from '../application/use-cases/user/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../application/use-cases/user/get-user-by-id.use-case.js';
import { ListUsersUseCase } from '../application/use-cases/user/list-users.use-case.js';
import { UpdateUserUseCase } from '../application/use-cases/user/update-user.use-case.js';
import { prisma } from '../infrastructure/db/prisma.client.js';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository.js';
import { HealthController } from '../interfaces/http/controllers/health.controller.js';
import { UserController } from '../interfaces/http/controllers/user.controller.js';
import type { Controllers } from '../interfaces/http/routes/router.js';

// Repositories
const userRepository = new PrismaUserRepository(prisma);

// Use Cases
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

// Controllers
const healthController = new HealthController();
const userController = new UserController(
  createUserUseCase,
  getUserByIdUseCase,
  listUsersUseCase,
  updateUserUseCase,
  deleteUserUseCase
);

export const controllers: Controllers = {
  healthController,
  userController,
};

export const repositories = {
  userRepository,
};

export const useCases = {
  createUserUseCase,
  getUserByIdUseCase,
  listUsersUseCase,
  updateUserUseCase,
  deleteUserUseCase,
};
