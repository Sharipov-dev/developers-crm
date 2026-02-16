import type { Task } from '../../../domain/entities/task.entity.js';
import { TaskNotFoundError } from '../../../domain/errors/task.errors.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    return task;
  }
}
