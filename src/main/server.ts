import type { Server } from 'http';

import { connectDatabase, disconnectDatabase } from '../infrastructure/db/prisma.client.js';
import { env } from '../shared/config/env.config.js';
import { logger } from '../shared/logger/logger.js';

import { createApp } from './app.js';
import { controllers } from './container.js';

let server: Server | null = null;

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp(controllers);

    // Start HTTP server
    server = app.listen(env.PORT, env.HOST, () => {
      logger.info(
        { host: env.HOST, port: env.PORT, env: env.NODE_ENV },
        `Server started on http://${env.HOST}:${env.PORT}`
      );
    });

    server.on('error', (error) => {
      logger.fatal({ error }, 'Server error');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

  if (server) {
    server.close((err) => {
      if (err) {
        logger.error({ error: err }, 'Error closing HTTP server');
      } else {
        logger.info('HTTP server closed');
      }
    });
  }

  try {
    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
void startServer();
