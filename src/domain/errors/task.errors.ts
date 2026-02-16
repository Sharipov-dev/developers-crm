import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class TaskNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Task not found: ${id}`);
  }
}

export class TaskContactAccessDeniedError extends ForbiddenError {
  constructor(contactId: string) {
    super(`Access denied to contact: ${contactId}`);
  }
}

export class TaskCompanyAccessDeniedError extends ForbiddenError {
  constructor(companyId: string) {
    super(`Access denied to company: ${companyId}`);
  }
}

export class TaskDealAccessDeniedError extends ForbiddenError {
  constructor(dealId: string) {
    super(`Access denied to deal: ${dealId}`);
  }
}

export class TaskInvalidStatusError extends BadRequestError {
  constructor(message: string) {
    super(message);
  }
}

export class TaskCanceledConflictError extends ConflictError {
  constructor() {
    super('Cannot complete or reopen a canceled task');
  }
}
