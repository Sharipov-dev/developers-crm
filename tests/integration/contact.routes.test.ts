import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

import { createApp } from '../../src/main/app.js';
import { controllers, middlewares } from '../../src/main/container.js';
import type { Contact } from '../../src/domain/entities/contact.entity.js';

// Mock the Prisma client
vi.mock('../../src/infrastructure/db/prisma.client.js', () => ({
  prisma: {
    contact: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    company: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

// Mock Supabase JWT service to always return a valid userId
vi.mock('../../src/infrastructure/services/supabase-jwt.service.js', () => ({
  SupabaseJwtService: vi.fn().mockImplementation(() => ({
    verify: vi.fn().mockResolvedValue({ userId: '987e6543-e21b-12d3-a456-426614174000' }),
  })),
}));

describe('Contact Routes Integration Tests', () => {
  let app: Express;
  const mockUserId = '987e6543-e21b-12d3-a456-426614174000';
  const mockCompanyId = '123e4567-e89b-12d3-a456-426614174000';
  const mockContactId = '456e7890-e89b-12d3-a456-426614174001';
  const authHeader = 'Bearer mock-token';

  const mockContact: Contact = {
    id: mockContactId,
    userId: mockUserId,
    companyId: mockCompanyId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    title: 'CEO',
    source: 'linkedin',
    status: 'lead',
    lastContactedAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockPrismaContact = {
    ...mockContact,
  };

  const mockCompany = {
    id: mockCompanyId,
    userId: mockUserId,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    size: 'size_51_200' as const,
    notes: 'Enterprise client',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeAll(async () => {
    app = createApp(controllers, middlewares);
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

    // Reset default mocks
    vi.mocked(prisma.contact.count).mockResolvedValue(0);
    vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.findFirst).mockResolvedValue(null);
  });

  describe('POST /api/contacts', () => {
    it('should create a contact with valid data', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.count).mockResolvedValue(0);
      vi.mocked(prisma.contact.create).mockResolvedValue(mockPrismaContact);
      vi.mocked(prisma.company.findFirst).mockResolvedValue(mockCompany);

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-123-4567',
          title: 'CEO',
          companyId: '123e4567-e89b-12d3-a456-426614174000',
          source: 'linkedin',
          status: 'lead',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: '456e7890-e89b-12d3-a456-426614174001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: 'lead',
      });
    });

    it('should create a contact without company', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      const contactWithoutCompany = { ...mockPrismaContact, companyId: null };
      vi.mocked(prisma.contact.count).mockResolvedValue(0);
      vi.mocked(prisma.contact.create).mockResolvedValue(contactWithoutCompany);

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyId).toBeNull();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          email: 'not-a-valid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          status: 'invalid_status',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when company does not belong to user', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.count).mockResolvedValue(0);
      vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          companyId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 409 when email already exists', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          firstName: 'John',
          email: 'john.doe@example.com',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).post('/api/contacts').send({
        firstName: 'John',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/contacts', () => {
    it('should return paginated list of contacts', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockPrismaContact]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1,
      });
    });

    it('should filter contacts by search query', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockPrismaContact]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts?q=john')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                firstName: expect.objectContaining({ contains: 'john' }),
              }),
            ]),
          }),
        })
      );
    });

    it('should filter contacts by status', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockPrismaContact]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts?status=lead')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'lead',
          }),
        })
      );
    });

    it('should filter contacts by companyId', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockPrismaContact]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts?companyId=123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: '123e4567-e89b-12d3-a456-426614174000',
          }),
        })
      );
    });

    it('should filter contacts by source', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([mockPrismaContact]);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts?source=linkedin')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            source: 'linkedin',
          }),
        })
      );
    });

    it('should sort contacts by name ascending', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
      vi.mocked(prisma.contact.count).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/contacts?sort=name_asc')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        })
      );
    });

    it('should respect pagination parameters', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findMany).mockResolvedValue([]);
      vi.mocked(prisma.contact.count).mockResolvedValue(100);

      const response = await request(app)
        .get('/api/contacts?page=2&pageSize=10')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return contact by id', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockPrismaContact);

      const response = await request(app)
        .get('/api/contacts/456e7890-e89b-12d3-a456-426614174001')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('456e7890-e89b-12d3-a456-426614174001');
    });

    it('should return 404 for non-existent contact', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/contacts/non-existent')
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/contacts/:id', () => {
    it('should update contact with valid data', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockPrismaContact);
      vi.mocked(prisma.contact.update).mockResolvedValue({
        ...mockPrismaContact,
        status: 'contacted',
        title: 'CTO',
      });

      const response = await request(app)
        .patch('/api/contacts/456e7890-e89b-12d3-a456-426614174001')
        .set('Authorization', authHeader)
        .send({
          status: 'contacted',
          title: 'CTO',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('contacted');
      expect(response.body.data.title).toBe('CTO');
    });

    it('should return 404 when updating non-existent contact', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/contacts/non-existent')
        .set('Authorization', authHeader)
        .send({
          firstName: 'Jane',
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 when updating with company that does not belong to user', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockPrismaContact);
      vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/contacts/456e7890-e89b-12d3-a456-426614174001')
        .set('Authorization', authHeader)
        .send({
          companyId: '11111111-1111-1111-1111-111111111111',
        });

      expect(response.status).toBe(403);
    });

    it('should return 409 when updating to existing email', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockPrismaContact);
      vi.mocked(prisma.contact.count).mockResolvedValue(1);

      const response = await request(app)
        .patch('/api/contacts/456e7890-e89b-12d3-a456-426614174001')
        .set('Authorization', authHeader)
        .send({
          email: 'existing@example.com',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete contact', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockPrismaContact);
      vi.mocked(prisma.contact.delete).mockResolvedValue(mockPrismaContact);

      const response = await request(app)
        .delete('/api/contacts/456e7890-e89b-12d3-a456-426614174001')
        .set('Authorization', authHeader);

      expect(response.status).toBe(204);
      expect(prisma.contact.delete).toHaveBeenCalledWith({
        where: { id: '456e7890-e89b-12d3-a456-426614174001' },
      });
    });

    it('should return 404 when deleting non-existent contact', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.contact.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/contacts/non-existent')
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
    });
  });
});
