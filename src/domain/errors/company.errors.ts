import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class CompanyNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Company not found: ${id}`);
  }
}

export class CompanyNameAlreadyExistsError extends ConflictError {
  constructor(name: string) {
    super(`Company with name "${name}" already exists for this user`);
  }
}

export class CompanyAccessDeniedError extends ForbiddenError {
  constructor(id: string) {
    super(`Access denied to company: ${id}`);
  }
}
