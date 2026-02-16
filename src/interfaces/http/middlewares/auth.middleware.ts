import type { NextFunction, Request, Response } from 'express';

import type { JwtService } from '../../../application/services/jwt.service.js';
import { UnauthorizedError } from '../../../shared/errors/app-error.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function createAuthMiddleware(jwtService: JwtService) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);
      const payload = await jwtService.verify(token);
      (req as AuthenticatedRequest).userId = payload.userId;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    }
  };
}
