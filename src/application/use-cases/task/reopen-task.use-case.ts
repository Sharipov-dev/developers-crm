import type { Task } from '../../../domain/entities/task.entity.js';
import { TaskCanceledConflictError, TaskNotFoundError } from '../../../domain/errors/task.errors.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';

export class ReopenTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    if (task.status === 'canceled') {
      throw new TaskCanceledConflictError();
    }

    if (task.status === 'open') {
      return task;
    }

    return this.taskRepository.update(id, {
      status: 'open',
      completedAt: null,
    });
  }
}
