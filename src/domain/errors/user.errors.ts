import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';

export class UserNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

export class UserEmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
  }
}
