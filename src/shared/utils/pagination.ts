import { z } from 'zod';

import { env } from '../config/env.config.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(env.MAX_PAGE_SIZE)
    .default(env.DEFAULT_PAGE_SIZE),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function calculatePagination(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

export function createPaginationMeta(
  page: number,
  pageSize: number,
  totalCount: number
): PaginationMeta {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
