import type { Category } from '../../../domain/entities/category.entity.js';
import type { CategoryRepository, FindCategoriesOptions } from '../../../domain/repositories/category.repository.js';
import type { ListCategoriesQueryDto } from '../../dto/category.dto.js';

export interface ListCategoriesResult {
  items: Category[];
  total: number;
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string, query: ListCategoriesQueryDto): Promise<ListCategoriesResult> {
    const options: FindCategoriesOptions = {
      userId,
      ...(query.parentId !== undefined && { parentId: query.parentId }),
      includeChildren: query.includeChildren ?? false,
    };

    const [items, total] = await Promise.all([
      this.categoryRepository.findAll(options),
      this.categoryRepository.count(options),
    ]);

    return { items, total };
  }
}
