export type ContactSource = 'freelance' | 'inbound' | 'referral' | 'linkedin' | 'cold' | 'other';
export type ContactStatus = 'lead' | 'contacted' | 'qualified' | 'customer' | 'inactive';

export interface Contact {
  id: string;
  userId: string;
  companyId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  source: ContactSource | null;
  status: ContactStatus;
  lastContactedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactData {
  userId: string;
  companyId?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  title?: string | undefined;
  source?: ContactSource | undefined;
  status?: ContactStatus | undefined;
}

export interface UpdateContactData {
  companyId?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  title?: string | null | undefined;
  source?: ContactSource | null | undefined;
  status?: ContactStatus | undefined;
}

export type ContactSortField = 'createdAt' | 'lastContactedAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface ContactSort {
  field: ContactSortField;
  order: SortOrder;
}

export interface ContactFilters {
  q?: string | undefined;
  status?: ContactStatus | undefined;
  companyId?: string | undefined;
  source?: ContactSource | undefined;
}

export interface FindContactsOptions {
  userId: string;
  filters?: ContactFilters | undefined;
  sort?: ContactSort | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}
