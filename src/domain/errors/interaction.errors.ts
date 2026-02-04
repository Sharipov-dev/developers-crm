import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class InteractionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Interaction not found: ${id}`);
  }
}

export class InteractionMissingAssociationError extends BadRequestError {
  constructor() {
    super('At least one of contactId, companyId, or dealId is required');
  }
}

export class InteractionContactAccessDeniedError extends ForbiddenError {
  constructor(contactId: string) {
    super(`Access denied to contact: ${contactId}`);
  }
}

export class InteractionCompanyAccessDeniedError extends ForbiddenError {
  constructor(companyId: string) {
    super(`Access denied to company: ${companyId}`);
  }
}

export class InteractionDealAccessDeniedError extends ForbiddenError {
  constructor(dealId: string) {
    super(`Access denied to deal: ${dealId}`);
  }
}
