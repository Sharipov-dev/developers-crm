import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  CreateTaskData,
  FindTasksOptions,
  Task,
  TaskSortField,
  UpdateTaskData,
} from '../../domain/entities/task.entity.js';
import type { TaskRepository } from '../../domain/repositories/task.repository.js';

import { TaskMapper, mapPriorityToPrisma, mapStatusToPrisma } from './task.mapper.js';

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    return task ? TaskMapper.toDomain(task) : null;
  }

  async findAll(options: FindTasksOptions): Promise<Task[]> {
    const { userId, filters, sort, skip = 0, take = 20 } = options;

    const where = this.buildWhereClause(userId, filters);
    const orderBy = this.buildOrderBy(sort);

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return TaskMapper.toDomainList(tasks);
  }

  async count(options: FindTasksOptions): Promise<number> {
    const { userId, filters } = options;

    const where = this.buildWhereClause(userId, filters);

    return this.prisma.task.count({ where });
  }

  async create(data: CreateTaskData): Promise<Task> {
    const createData: Prisma.TaskUncheckedCreateInput = {
      userId: data.userId,
      title: data.title,
      description: data.description ?? null,
      dueAt: data.dueAt ?? null,
      contactId: data.contactId ?? null,
      companyId: data.companyId ?? null,
      dealId: data.dealId ?? null,
      completedAt: data.completedAt ?? null,
    };

    if (data.status) {
      createData.status = mapStatusToPrisma(data.status);
    }
    if (data.priority) {
      createData.priority = mapPriorityToPrisma(data.priority);
    }

    const task = await this.prisma.task.create({
      data: createData,
    });

    return TaskMapper.toDomain(task);
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.dueAt !== undefined) {
      updateData.dueAt = data.dueAt;
    }
    if (data.status !== undefined) {
      updateData.status = mapStatusToPrisma(data.status);
    }
    if (data.priority !== undefined) {
      updateData.priority = mapPriorityToPrisma(data.priority);
    }
    if (data.contactId !== undefined) {
      updateData.contact = data.contactId
        ? { connect: { id: data.contactId } }
        : { disconnect: true };
    }
    if (data.companyId !== undefined) {
      updateData.company = data.companyId
        ? { connect: { id: data.companyId } }
        : { disconnect: true };
    }
    if (data.dealId !== undefined) {
      updateData.deal = data.dealId
        ? { connect: { id: data.dealId } }
        : { disconnect: true };
    }
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    return TaskMapper.toDomain(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  private buildWhereClause(
    userId: string,
    filters?: FindTasksOptions['filters']
  ): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = { userId };

    if (filters?.status) {
      where.status = mapStatusToPrisma(filters.status);
    }

    if (filters?.priority) {
      where.priority = mapPriorityToPrisma(filters.priority);
    }

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.dealId) {
      where.dealId = filters.dealId;
    }

    if (filters?.dueFrom !== undefined || filters?.dueTo !== undefined) {
      where.dueAt = {};
      if (filters.dueFrom !== undefined) {
        where.dueAt.gte = filters.dueFrom;
      }
      if (filters.dueTo !== undefined) {
        where.dueAt.lte = filters.dueTo;
      }
    }

    return where;
  }

  private buildOrderBy(sort?: TaskSortField): Prisma.TaskOrderByWithRelationInput {
    switch (sort) {
      case 'dueAt_asc':
        return { dueAt: 'asc' };
      case 'dueAt_desc':
        return { dueAt: 'desc' };
      case 'createdAt_desc':
      default:
        return { createdAt: 'desc' };
    }
  }
}
