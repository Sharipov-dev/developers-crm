import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class DealNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Deal not found: ${id}`);
  }
}

export class DealContactAccessDeniedError extends ForbiddenError {
  constructor(contactId: string) {
    super(`Access denied to contact: ${contactId}`);
  }
}

export class DealCompanyAccessDeniedError extends ForbiddenError {
  constructor(companyId: string) {
    super(`Access denied to company: ${companyId}`);
  }
}

export class DealMissingAssociationError extends BadRequestError {
  constructor() {
    super('At least one of contactId or companyId is required');
  }
}

export class DealStageConflictError extends ConflictError {
  constructor(currentStage: string) {
    super(`Cannot update a deal that is already "${currentStage}". Closed deals cannot be moved backward.`);
  }
}
