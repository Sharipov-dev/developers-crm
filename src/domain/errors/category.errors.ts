import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js';

export class CategoryNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Category not found: ${id}`);
  }
}

export class CategoryNameAlreadyExistsError extends ConflictError {
  constructor(name: string) {
    super(`Category with name "${name}" already exists`);
  }
}

export class CategoryCycleError extends BadRequestError {
  constructor() {
    super('Cannot set parentId: would create a circular reference');
  }
}

export class CategorySelfReferenceError extends BadRequestError {
  constructor() {
    super('Category cannot be its own parent');
  }
}

export class CategoryForbiddenError extends ForbiddenError {
  constructor() {
    super('You do not have access to this category');
  }
}
