import type { Task } from '../../../domain/entities/task.entity.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';
import type { ListTasksQueryDto } from '../../dto/task.dto.js';

export interface ListTasksResult {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(userId: string, query: ListTasksQueryDto): Promise<ListTasksResult> {
    const { page, pageSize, sort, status, priority, contactId, companyId, dealId, dueFrom, dueTo } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const options = {
      userId,
      filters: {
        status,
        priority,
        contactId,
        companyId,
        dealId,
        dueFrom,
        dueTo,
      },
      sort,
      skip,
      take,
    };

    const [items, total] = await Promise.all([
      this.taskRepository.findAll(options),
      this.taskRepository.count(options),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
