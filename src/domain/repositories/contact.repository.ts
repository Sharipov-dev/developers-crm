import type {
  Contact,
  CreateContactData,
  FindContactsOptions,
  UpdateContactData,
} from '../entities/contact.entity.js';

export interface ContactRepository {
  findById(id: string): Promise<Contact | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Contact | null>;
  findByEmailAndUserId(email: string, userId: string): Promise<Contact | null>;
  findAll(options: FindContactsOptions): Promise<Contact[]>;
  count(options: FindContactsOptions): Promise<number>;
  create(data: CreateContactData): Promise<Contact>;
  update(id: string, data: UpdateContactData): Promise<Contact>;
  delete(id: string): Promise<void>;
  existsByEmailAndUserId(email: string, userId: string): Promise<boolean>;
}
