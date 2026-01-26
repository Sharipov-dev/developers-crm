import type { User } from '../../../domain/entities/user.entity.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { PaginationParams } from '../../../shared/utils/pagination.js';
import { calculatePagination, createPaginationMeta } from '../../../shared/utils/pagination.js';

export interface ListUsersResult {
  users: User[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(pagination: PaginationParams): Promise<ListUsersResult> {
    const { skip, take } = calculatePagination(pagination);

    const [users, totalCount] = await Promise.all([
      this.userRepository.findAll({ skip, take }),
      this.userRepository.count(),
    ]);

    return {
      users,
      meta: createPaginationMeta(pagination.page, pagination.pageSize, totalCount),
    };
  }
}
