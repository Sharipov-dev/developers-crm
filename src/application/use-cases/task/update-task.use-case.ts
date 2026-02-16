import type { Task } from '../../../domain/entities/task.entity.js';
import {
  TaskCompanyAccessDeniedError,
  TaskContactAccessDeniedError,
  TaskDealAccessDeniedError,
  TaskNotFoundError,
} from '../../../domain/errors/task.errors.js';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.js';
import type { ContactRepository } from '../../../domain/repositories/contact.repository.js';
import type { DealRepository } from '../../../domain/repositories/deal.repository.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';
import type { UpdateTaskDto } from '../../dto/task.dto.js';

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dealRepository: DealRepository
  ) {}

  async execute(id: string, userId: string, data: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!task) {
      throw new TaskNotFoundError(id);
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

    let completedAt: Date | null | undefined;
    if (data.status === 'done') {
      completedAt = new Date();
    } else if (data.status === 'open' || data.status === 'canceled') {
      completedAt = null;
    }

    return this.taskRepository.update(id, {
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
