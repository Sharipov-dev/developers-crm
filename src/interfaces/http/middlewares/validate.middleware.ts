import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { ValidationError, type ErrorDetails } from '../../../shared/errors/app-error.js';

type RequestPart = 'body' | 'query' | 'params';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidateOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: ErrorDetails[] = [];

    const validatePart = (schema: ZodSchema | undefined, part: RequestPart): void => {
      if (!schema) {
        return;
      }

      const result = schema.safeParse(req[part]);

      if (!result.success) {
        result.error.errors.forEach((err) => {
          errors.push({
            field: `${part}.${err.path.join('.')}`,
            message: err.message,
          });
        });
      } else {
        // Replace with parsed/coerced values
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req[part] = result.data;
      }
    };

    validatePart(schemas.body, 'body');
    validatePart(schemas.query, 'query');
    validatePart(schemas.params, 'params');

    if (errors.length > 0) {
      next(new ValidationError('Validation failed', errors));
      return;
    }

    next();
  };
}
