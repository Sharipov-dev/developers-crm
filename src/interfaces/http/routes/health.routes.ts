import { Router } from 'express';

import type { HealthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/', asyncHandler((req, res) => controller.check(req, res)));

  return router;
}
