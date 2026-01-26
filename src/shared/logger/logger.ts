import pino, { type LoggerOptions } from 'pino';

import { env, isDevelopment } from '../config/env.config.js';

const options: LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (isDevelopment) {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(options);

export type Logger = typeof logger;
