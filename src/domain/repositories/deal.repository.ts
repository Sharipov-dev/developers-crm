import type {
  CreateDealData,
  Deal,
  FindDealsOptions,
  UpdateDealData,
} from '../entities/deal.entity.js';

export interface DealRepository {
  findById(id: string): Promise<Deal | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Deal | null>;
  findAll(options: FindDealsOptions): Promise<Deal[]>;
  count(options: FindDealsOptions): Promise<number>;
  create(data: CreateDealData): Promise<Deal>;
  update(id: string, data: UpdateDealData): Promise<Deal>;
  delete(id: string): Promise<void>;
}
