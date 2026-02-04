export type InteractionType = 'call' | 'meeting' | 'email' | 'message' | 'demo' | 'note';

export interface Interaction {
  id: string;
  userId: string;
  type: InteractionType;
  occurredAt: Date;
  summary: string;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInteractionData {
  userId: string;
  type: InteractionType;
  occurredAt: Date;
  summary: string;
  contactId?: string | undefined;
  companyId?: string | undefined;
  dealId?: string | undefined;
}

export interface UpdateInteractionData {
  type?: InteractionType | undefined;
  occurredAt?: Date | undefined;
  summary?: string | undefined;
  contactId?: string | null | undefined;
  companyId?: string | null | undefined;
  dealId?: string | null | undefined;
}

export interface InteractionFilters {
  contactId?: string | undefined;
  companyId?: string | undefined;
  dealId?: string | undefined;
  type?: InteractionType | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
}

export interface FindInteractionsOptions {
  userId: string;
  filters?: InteractionFilters | undefined;
  skip?: number | undefined;
  take?: number | undefined;
}
