import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from '../interfaces/http/middlewares/error-handler.middleware.js';
import { notFoundHandler } from '../interfaces/http/middlewares/not-found.middleware.js';
import { requestLogger } from '../interfaces/http/middlewares/request-logger.middleware.js';
import { swaggerSpec } from '../interfaces/http/openapi/swagger.config.js';
import { createAppRouter, type Controllers, type Middlewares } from '../interfaces/http/routes/router.js';

export function createApp(controllers: Controllers, middlewares: Middlewares): Express {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Swagger documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API routes
  app.use('/api', createAppRouter(controllers, middlewares));

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}
