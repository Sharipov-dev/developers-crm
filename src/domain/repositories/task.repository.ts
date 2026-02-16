import type {
  CreateTaskData,
  FindTasksOptions,
  Task,
  UpdateTaskData,
} from '../entities/task.entity.js';

export interface TaskRepository {
  findByIdAndUserId(id: string, userId: string): Promise<Task | null>;
  findAll(options: FindTasksOptions): Promise<Task[]>;
  count(options: FindTasksOptions): Promise<number>;
  create(data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}
