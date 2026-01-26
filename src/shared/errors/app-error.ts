export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';

export interface ErrorDetails {
  field?: string | undefined;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails[] | undefined;
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails[] | undefined;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    isOperational = true,
    details?: ErrorDetails[]
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails[]) {
    super(message, 'VALIDATION_ERROR', 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST', 400);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 'INTERNAL_ERROR', 500, false);
  }
}
