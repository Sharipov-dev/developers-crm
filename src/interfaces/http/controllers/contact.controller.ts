import type { Request, Response } from 'express';

import type {
  ContactResponseDto,
  CreateContactDto,
  ListContactsQueryDto,
  UpdateContactDto,
} from '../../../application/dto/contact.dto.js';
import type { CreateContactUseCase } from '../../../application/use-cases/contact/create-contact.use-case.js';
import type { DeleteContactUseCase } from '../../../application/use-cases/contact/delete-contact.use-case.js';
import type { GetContactUseCase } from '../../../application/use-cases/contact/get-contact.use-case.js';
import type { ListContactsUseCase } from '../../../application/use-cases/contact/list-contacts.use-case.js';
import type { UpdateContactUseCase } from '../../../application/use-cases/contact/update-contact.use-case.js';
import type { Contact } from '../../../domain/entities/contact.entity.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toContactResponse(contact: Contact): ContactResponseDto {
  return {
    id: contact.id,
    userId: contact.userId,
    companyId: contact.companyId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    source: contact.source,
    status: contact.status,
    lastContactedAt: contact.lastContactedAt?.toISOString() ?? null,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export class ContactController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly getContactUseCase: GetContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly deleteContactUseCase: DeleteContactUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateContactDto;
    const contact = await this.createContactUseCase.execute(userId, body);
    sendCreated(res, toContactResponse(contact));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const contact = await this.getContactUseCase.execute(id, userId);
    sendSuccess(res, toContactResponse(contact));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListContactsQueryDto;
    const result = await this.listContactsUseCase.execute(userId, query);

    sendSuccess(
      res,
      result.items.map(toContactResponse),
      200,
      {
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      }
    );
  }

  async update(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as UpdateContactDto;
    const contact = await this.updateContactUseCase.execute(id, userId, body);
    sendSuccess(res, toContactResponse(contact));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteContactUseCase.execute(id, userId);
    sendNoContent(res);
  }
}
