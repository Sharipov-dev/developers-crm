import type { Request, Response } from 'express';

import type {
  CategoryResponseDto,
  CreateCategoryDto,
  ListCategoriesQueryDto,
  PaginatedCategoriesResponseDto,
  UpdateCategoryDto,
} from '../../../application/dto/category.dto.js';
import type { CreateCategoryUseCase } from '../../../application/use-cases/category/create-category.use-case.js';
import type { DeleteCategoryUseCase } from '../../../application/use-cases/category/delete-category.use-case.js';
import type { GetCategoryUseCase } from '../../../application/use-cases/category/get-category.use-case.js';
import type { ListCategoriesUseCase } from '../../../application/use-cases/category/list-categories.use-case.js';
import type { UpdateCategoryUseCase } from '../../../application/use-cases/category/update-category.use-case.js';
import type { Category } from '../../../domain/entities/category.entity.js';
import { calculatePagination, createPaginationMeta } from '../../../shared/utils/pagination.js';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../../shared/utils/response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

function toCategoryResponse(category: Category, includeChildren = false): CategoryResponseDto {
  const response: CategoryResponseDto = {
    id: category.id,
    name: category.name,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    icon: category.icon,
    color: category.color,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };

  return response;
}

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateCategoryDto;
    const category = await this.createCategoryUseCase.execute(userId, body);
    sendCreated(res, toCategoryResponse(category));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const category = await this.getCategoryUseCase.execute(userId, id);
    sendSuccess(res, toCategoryResponse(category));
  }

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListCategoriesQueryDto;
    const result = await this.listCategoriesUseCase.execute(userId, query);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { skip, take } = calculatePagination({ page, pageSize });

    const meta = createPaginationMeta(page, pageSize, result.total);

    const response: PaginatedCategoriesResponseDto = {
      items: result.items.map((item) => toCategoryResponse(item)),
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.totalCount,
    };

    sendPaginated(res, { items: response.items, meta });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as UpdateCategoryDto;
    const category = await this.updateCategoryUseCase.execute(userId, id, body);
    sendSuccess(res, toCategoryResponse(category));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    await this.deleteCategoryUseCase.execute(userId, id);
    sendNoContent(res);
  }
}
