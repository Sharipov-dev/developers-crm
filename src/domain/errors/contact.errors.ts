import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class ContactNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Contact not found: ${id}`);
  }
}

export class ContactEmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Contact with email "${email}" already exists for this user`);
  }
}

export class ContactAccessDeniedError extends ForbiddenError {
  constructor(id: string) {
    super(`Access denied to contact: ${id}`);
  }
}

export class ContactCompanyAccessDeniedError extends ForbiddenError {
  constructor(companyId: string) {
    super(`Access denied to company: ${companyId}`);
  }
}
