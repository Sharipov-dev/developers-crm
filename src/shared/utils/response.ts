import type { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: Required<ResponseMeta>;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: ResponseMeta): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(res: Response, data: PaginatedData<T>, statusCode = 200): void {
  sendSuccess(res, data.items, statusCode, data.meta);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
