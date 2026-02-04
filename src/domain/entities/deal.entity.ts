export type DealStage = 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type SortOrder = 'asc' | 'desc';

export interface Deal {
  id: string;
  userId: string;
  title: string;
  contactId: string | null;
  companyId: string | null;
  stage: DealStage;
  valueCents: number | null;
  currency: string;
  probability: number | null;
  expectedCloseDate: Date | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealData {
  userId: string;
  title: string;
  contactId?: string | undefined;
  companyId?: string | undefined;
  stage?: DealStage | undefined;
  valueCents?: number | undefined;
  currency?: string | undefined;
  probability?: number | undefined;
  expectedCloseDate?: Date | undefined;
}

export interface UpdateDealData {
  title?: string | undefined;
  contactId?: string | null | undefined;
  companyId?: string | null | undefined;
  stage?: DealStage | undefined;
  valueCents?: number | null | undefined;
  currency?: string | undefined;
  probability?: number | null | undefined;
  expectedCloseDate?: Date | null | undefined;
  lostReason?: string | null | undefined;
}

export type DealSortField = 'updatedAt' | 'createdAt' | 'valueCents' | 'expectedCloseDate';

export interface DealSort {
  field: DealSortField;
  order: SortOrder;
}

export interface DealFilters {
  q?: string | undefined;
  stage?: DealStage | undefined;
  contactId?: string | undefined;
  companyId?: string | undefined;
  minValueCents?: number | undefined;
  maxValueCents?: number | undefined;
  expectedCloseFrom?: Date | undefined;
  expectedCloseTo?: Date | undefined;
}

export interface FindDealsOptions {
  userId: string;
  filters?: DealFilters | undefined;
  sort?: DealSort | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}
