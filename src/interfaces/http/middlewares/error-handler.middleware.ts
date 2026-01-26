import type { NextFunction, Request, Response } from 'express';

import { AppError, type ErrorResponse } from '../../../shared/errors/app-error.js';
import { logger } from '../../../shared/logger/logger.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };

    if (!error.isOperational) {
      logger.error({ error }, 'Non-operational error occurred');
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Unknown error
  logger.error({ error }, 'Unhandled error occurred');

  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  res.status(500).json(response);
}
