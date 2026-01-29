import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ListContactsQueryDto } from '../../../../../src/application/dto/contact.dto.js';
import { ListContactsUseCase } from '../../../../../src/application/use-cases/contact/list-contacts.use-case.js';
import type { Contact } from '../../../../../src/domain/entities/contact.entity.js';
import type { ContactRepository } from '../../../../../src/domain/repositories/contact.repository.js';

describe('ListContactsUseCase', () => {
  let useCase: ListContactsUseCase;
  let mockContactRepository: ContactRepository;

  const mockUserId = 'user-123';
  const mockContacts: Contact[] = [
    {
      id: 'contact-1',
      userId: mockUserId,
      companyId: 'company-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      title: 'CEO',
      source: 'linkedin',
      status: 'lead',
      lastContactedAt: null,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'contact-2',
      userId: mockUserId,
      companyId: null,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: null,
      title: 'CTO',
      source: 'referral',
      status: 'contacted',
      lastContactedAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(() => {
    mockContactRepository = {
      findById: vi.fn(),
      findByIdAndUserId: vi.fn(),
      findByEmailAndUserId: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEmailAndUserId: vi.fn(),
    };

    useCase = new ListContactsUseCase(mockContactRepository);
  });

  it('should return paginated contacts with default options', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue(mockContacts);
    vi.mocked(mockContactRepository.count).mockResolvedValue(2);

    const result = await useCase.execute(mockUserId, query);

    expect(result).toEqual({
      items: mockContacts,
      total: 2,
      page: 1,
      pageSize: 20,
    });

    expect(mockContactRepository.findAll).toHaveBeenCalledWith({
      userId: mockUserId,
      filters: {
        q: undefined,
        status: undefined,
        companyId: undefined,
        source: undefined,
      },
      sort: { field: 'createdAt', order: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('should apply search filter (q)', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      q: 'john',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([mockContacts[0]]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(1);

    const result = await useCase.execute(mockUserId, query);

    expect(result.items).toHaveLength(1);
    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ q: 'john' }),
      })
    );
  });

  it('should apply status filter', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      status: 'lead',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([mockContacts[0]]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ status: 'lead' }),
      })
    );
  });

  it('should apply companyId filter', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      companyId: 'company-1',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([mockContacts[0]]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ companyId: 'company-1' }),
      })
    );
  });

  it('should apply source filter', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'createdAt_desc',
      source: 'linkedin',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([mockContacts[0]]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ source: 'linkedin' }),
      })
    );
  });

  it('should sort by name ascending', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'name_asc',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue(mockContacts);
    vi.mocked(mockContactRepository.count).mockResolvedValue(2);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { field: 'name', order: 'asc' },
      })
    );
  });

  it('should sort by lastContactedAt descending', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'lastContactedAt_desc',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue(mockContacts);
    vi.mocked(mockContactRepository.count).mockResolvedValue(2);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { field: 'lastContactedAt', order: 'desc' },
      })
    );
  });

  it('should calculate correct pagination offset', async () => {
    const query: ListContactsQueryDto = {
      page: 3,
      pageSize: 10,
      sort: 'createdAt_desc',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(25);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    );
  });

  it('should apply multiple filters together', async () => {
    const query: ListContactsQueryDto = {
      page: 1,
      pageSize: 20,
      sort: 'name_desc',
      q: 'john',
      status: 'lead',
      source: 'linkedin',
      companyId: 'company-1',
    };

    vi.mocked(mockContactRepository.findAll).mockResolvedValue([mockContacts[0]]);
    vi.mocked(mockContactRepository.count).mockResolvedValue(1);

    await useCase.execute(mockUserId, query);

    expect(mockContactRepository.findAll).toHaveBeenCalledWith({
      userId: mockUserId,
      filters: {
        q: 'john',
        status: 'lead',
        companyId: 'company-1',
        source: 'linkedin',
      },
      sort: { field: 'name', order: 'desc' },
      skip: 0,
      take: 20,
    });
  });
});
