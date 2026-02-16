import type {
  Task as PrismaTask,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
} from '@prisma/client';

import type { Task, TaskPriority, TaskStatus } from '../../domain/entities/task.entity.js';

function mapStatus(status: PrismaTaskStatus): TaskStatus {
  return status as TaskStatus;
}

function mapPriority(priority: PrismaTaskPriority): TaskPriority {
  return priority as TaskPriority;
}

export function mapStatusToPrisma(status: TaskStatus): PrismaTaskStatus {
  return status as PrismaTaskStatus;
}

export function mapPriorityToPrisma(priority: TaskPriority): PrismaTaskPriority {
  return priority as PrismaTaskPriority;
}

export class TaskMapper {
  static toDomain(prismaTask: PrismaTask): Task {
    return {
      id: prismaTask.id,
      userId: prismaTask.userId,
      title: prismaTask.title,
      description: prismaTask.description,
      dueAt: prismaTask.dueAt,
      status: mapStatus(prismaTask.status),
      priority: mapPriority(prismaTask.priority),
      contactId: prismaTask.contactId,
      companyId: prismaTask.companyId,
      dealId: prismaTask.dealId,
      completedAt: prismaTask.completedAt,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    };
  }

  static toDomainList(prismaTasks: PrismaTask[]): Task[] {
    return prismaTasks.map(TaskMapper.toDomain);
  }
}
