import type { CreateCategoryData, UpdateCategoryData, Category } from '../entities/category.entity.js';

export interface FindCategoriesOptions {
  userId: string;
  parentId?: string | null | undefined;
  includeChildren?: boolean;
}

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByUserIdAndName(userId: string, name: string): Promise<Category | null>;
  findAll(options: FindCategoriesOptions): Promise<Category[]>;
  count(options: FindCategoriesOptions): Promise<number>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
  findAncestors(id: string): Promise<Category[]>;
  existsById(id: string): Promise<boolean>;
}
