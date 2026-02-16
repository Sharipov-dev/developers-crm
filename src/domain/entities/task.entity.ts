export type TaskStatus = 'open' | 'done' | 'canceled';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  userId: string;
  title: string;
  description?: string | undefined;
  dueAt?: Date | undefined;
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  contactId?: string | undefined;
  companyId?: string | undefined;
  dealId?: string | undefined;
  completedAt?: Date | undefined;
}

export interface UpdateTaskData {
  title?: string | undefined;
  description?: string | null | undefined;
  dueAt?: Date | null | undefined;
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  contactId?: string | null | undefined;
  companyId?: string | null | undefined;
  dealId?: string | null | undefined;
  completedAt?: Date | null | undefined;
}

export type TaskSortField = 'dueAt_asc' | 'dueAt_desc' | 'createdAt_desc';

export interface TaskFilters {
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  contactId?: string | undefined;
  companyId?: string | undefined;
  dealId?: string | undefined;
  dueFrom?: Date | undefined;
  dueTo?: Date | undefined;
}

export interface FindTasksOptions {
  userId: string;
  filters?: TaskFilters | undefined;
  sort?: TaskSortField | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}
