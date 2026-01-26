import { Router } from 'express';

import type { HealthController } from '../controllers/health.controller.js';
import type { UserController } from '../controllers/user.controller.js';

import { createHealthRoutes } from './health.routes.js';
import { createUserRoutes } from './user.routes.js';

export interface Controllers {
  healthController: HealthController;
  userController: UserController;
}

export function createRouter(controllers: Controllers): Router {
  const router = Router();

  router.use('/health', createHealthRoutes(controllers.healthController));
  router.use('/users', createUserRoutes(controllers.userController));

  return router;
}
