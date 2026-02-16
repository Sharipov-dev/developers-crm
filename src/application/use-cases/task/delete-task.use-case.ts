import { TaskNotFoundError } from '../../../domain/errors/task.errors.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    await this.taskRepository.delete(id);
  }
}
