import { Router } from 'express';

import type { HealthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  /**
   * @openapi
   * /health:
   *   get:
   *     tags:
   *       - Health
   *     summary: Health check
   *     description: Returns the health status of the API
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: ok
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   */
  router.get('/', asyncHandler((req, res) => controller.check(req, res)));

  return router;
}
