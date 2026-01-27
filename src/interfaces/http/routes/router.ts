import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import type { CategoryController } from '../controllers/category.controller.js';
import type { HealthController } from '../controllers/health.controller.js';
import type { UserController } from '../controllers/user.controller.js';

import { createCategoryRoutes } from './category.routes.js';
import { createHealthRoutes } from './health.routes.js';
import { createUserRoutes } from './user.routes.js';

export interface Controllers {
  healthController: HealthController;
  userController: UserController;
  categoryController: CategoryController;
}

export interface Middlewares {
  authMiddleware: RequestHandler;
}

export function createAppRouter(controllers: Controllers, middlewares: Middlewares): Router {
  const router = createRouter();

  router.use('/health', createHealthRoutes(controllers.healthController));
  router.use('/users', createUserRoutes(controllers.userController, middlewares.authMiddleware));
  router.use('/categories', createCategoryRoutes(controllers.categoryController, middlewares.authMiddleware));

  return router;
}
