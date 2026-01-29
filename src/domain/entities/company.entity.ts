export type CompanySize = 'solo' | '1-10' | '11-50' | '51-200' | '200+';

export interface Company {
  id: string;
  userId: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: CompanySize | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  userId: string;
  name: string;
  website?: string | undefined;
  industry?: string | undefined;
  size?: CompanySize | undefined;
  notes?: string | undefined;
}

export interface UpdateCompanyData {
  name?: string | undefined;
  website?: string | null | undefined;
  industry?: string | null | undefined;
  size?: CompanySize | null | undefined;
  notes?: string | null | undefined;
}

export type CompanySortField = 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface CompanySort {
  field: CompanySortField;
  order: SortOrder;
}

export interface CompanyFilters {
  q?: string | undefined;
  industry?: string | undefined;
  size?: CompanySize | undefined;
}

export interface FindCompaniesOptions {
  userId: string;
  filters?: CompanyFilters | undefined;
  sort?: CompanySort | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}
