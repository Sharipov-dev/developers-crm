export interface Category {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  icon: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  userId: string;
  name: string;
  parentId?: string | null;
  sortOrder?: number;
  icon?: string | null;
  color?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  parentId?: string | null;
  sortOrder?: number;
  icon?: string | null;
  color?: string | null;
}
