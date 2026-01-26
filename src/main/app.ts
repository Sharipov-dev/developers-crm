import express, { type Express } from 'express';

import { errorHandler } from '../interfaces/http/middlewares/error-handler.middleware.js';
import { notFoundHandler } from '../interfaces/http/middlewares/not-found.middleware.js';
import { requestLogger } from '../interfaces/http/middlewares/request-logger.middleware.js';
import { createRouter, type Controllers } from '../interfaces/http/routes/router.js';

export function createApp(controllers: Controllers): Express {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use('/api', createRouter(controllers));

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}
