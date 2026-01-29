import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import type { CompanyController } from '../controllers/company.controller.js';
import type { ContactController } from '../controllers/contact.controller.js';
import type { HealthController } from '../controllers/health.controller.js';
import type { UserController } from '../controllers/user.controller.js';

import { createCompanyRoutes } from './company.routes.js';
import { createContactRoutes } from './contact.routes.js';
import { createHealthRoutes } from './health.routes.js';
import { createUserRoutes } from './user.routes.js';

export interface Controllers {
  healthController: HealthController;
  userController: UserController;
  companyController: CompanyController;
  contactController: ContactController;
}

export interface Middlewares {
  authMiddleware: RequestHandler;
}

export function createAppRouter(controllers: Controllers, middlewares: Middlewares): Router {
  const router = createRouter();

  router.use('/health', createHealthRoutes(controllers.healthController));
  router.use('/users', createUserRoutes(controllers.userController, middlewares.authMiddleware));
  router.use('/companies', createCompanyRoutes(controllers.companyController, middlewares.authMiddleware));
  router.use('/contacts', createContactRoutes(controllers.contactController, middlewares.authMiddleware));

  return router;
}
