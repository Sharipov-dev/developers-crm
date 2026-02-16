import type { Task } from '../../../domain/entities/task.entity.js';
import {
  TaskCompanyAccessDeniedError,
  TaskContactAccessDeniedError,
  TaskDealAccessDeniedError,
  TaskInvalidStatusError,
} from '../../../domain/errors/task.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';
import type { CreateTaskDto } from '../../dto/task.dto.js';

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dealRepository: DealRepository
  ) {}

  async execute(userId: string, data: CreateTaskDto): Promise<Task> {
    if (data.status === 'canceled') {
      throw new TaskInvalidStatusError('Cannot create a task with status "canceled"');
    }

    if (data.contactId) {
      const contact = await this.contactRepository.findByIdAndUserId(data.contactId, userId);
      if (!contact) {
        throw new TaskContactAccessDeniedError(data.contactId);
      }
    }

    if (data.companyId) {
      const company = await this.companyRepository.findByIdAndUserId(data.companyId, userId);
      if (!company) {
        throw new TaskCompanyAccessDeniedError(data.companyId);
      }
    }

    if (data.dealId) {
      const deal = await this.dealRepository.findByIdAndUserId(data.dealId, userId);
      if (!deal) {
        throw new TaskDealAccessDeniedError(data.dealId);
      }
    }

    const completedAt = data.status === 'done' ? new Date() : undefined;

    return this.taskRepository.create({
      userId,
      title: data.title,
      description: data.description,
      dueAt: data.dueAt,
      status: data.status,
      priority: data.priority,
      contactId: data.contactId,
      companyId: data.companyId,
      dealId: data.dealId,
      completedAt,
    });
  }
}
