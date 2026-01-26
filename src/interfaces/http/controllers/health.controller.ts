import type { Request, Response } from 'express';

import { prisma } from '../../../infrastructure/db/prisma.client.js';
import { sendSuccess } from '../../../shared/utils/response.js';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch {
      databaseStatus = 'disconnected';
    }

    const health: HealthStatus = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    sendSuccess(res, health, statusCode);
  }
}
