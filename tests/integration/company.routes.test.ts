import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

import { createApp } from '../../src/main/app.js';
import { controllers, middlewares } from '../../src/main/container.js';
import type { Company } from '../../src/domain/entities/company.entity.js';

// Mock the Prisma client
vi.mock('../../src/infrastructure/db/prisma.client.js', () => ({
  prisma: {
    company: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

// Mock JWT service to always return a valid userId
vi.mock('../../src/infrastructure/services/jwt.service.js', () => ({
  JwtTokenService: vi.fn().mockImplementation(() => ({
    sign: vi.fn().mockReturnValue('mock-token'),
    verify: vi.fn().mockReturnValue({ userId: 'user-123' }),
  })),
}));

describe('Company Routes Integration Tests', () => {
  let app: Express;
  const mockUserId = 'user-123';
  const authHeader = 'Bearer mock-token';

  const mockCompany: Company = {
    id: 'company-123',
    userId: mockUserId,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '51-200',
    notes: 'Enterprise client',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockPrismaCompany = {
    ...mockCompany,
    size: 'size_51_200' as const,
  };

  beforeAll(async () => {
    const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

    // Setup mocked prisma responses
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      passwordHash: 'hashed',
      displayName: 'Test User',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    app = createApp(controllers, middlewares);
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

    // Reset default mocks
    vi.mocked(prisma.company.count).mockResolvedValue(0);
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
  });

  describe('POST /api/companies', () => {
    it('should create a company with valid data', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.count).mockResolvedValue(0);
      vi.mocked(prisma.company.create).mockResolvedValue(mockPrismaCompany);

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', authHeader)
        .send({
          name: 'Acme Corp',
          website: 'https://acme.com',
          industry: 'Technology',
          size: '51-200',
          notes: 'Enterprise client',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'company-123',
        name: 'Acme Corp',
        website: 'https://acme.com',
        industry: 'Technology',
        size: '51-200',
      });
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', authHeader)
        .send({
          website: 'https://acme.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', authHeader)
        .send({
          name: 'Acme Corp',
          website: 'not-a-valid-url',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 when company name already exists', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', authHeader)
        .send({
          name: 'Acme Corp',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).post('/api/companies').send({
        name: 'Acme Corp',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/companies', () => {
    it('should return paginated list of companies', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([mockPrismaCompany]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/companies')
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

    it('should filter companies by search query', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([mockPrismaCompany]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/companies?q=acme')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: 'acme' }),
              }),
            ]),
          }),
        })
      );
    });

    it('should filter companies by industry', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([mockPrismaCompany]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/companies?industry=Technology')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            industry: expect.objectContaining({ equals: 'Technology' }),
          }),
        })
      );
    });

    it('should filter companies by size', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([mockPrismaCompany]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/companies?size=51-200')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            size: 'size_51_200',
          }),
        })
      );
    });

    it('should sort companies by name ascending', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company.count).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/companies?sort=name_asc')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should respect pagination parameters', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company.count).mockResolvedValue(100);

      const response = await request(app)
        .get('/api/companies?page=2&pageSize=10')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return company by id', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(mockPrismaCompany);

      const response = await request(app)
        .get('/api/companies/company-123')
        .set('Authorization', authHeader);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('company-123');
    });

    it('should return 404 for non-existent company', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/companies/non-existent')
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/companies/:id', () => {
    it('should update company with valid data', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(mockPrismaCompany);
      vi.mocked(prisma.company.update).mockResolvedValue({
        ...mockPrismaCompany,
        name: 'Updated Corp',
      });

      const response = await request(app)
        .patch('/api/companies/company-123')
        .set('Authorization', authHeader)
        .send({
          name: 'Updated Corp',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Corp');
    });

    it('should return 404 when updating non-existent company', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/companies/non-existent')
        .set('Authorization', authHeader)
        .send({
          name: 'Updated Corp',
        });

      expect(response.status).toBe(404);
    });

    it('should return 409 when updating to existing name', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(mockPrismaCompany);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const response = await request(app)
        .patch('/api/companies/company-123')
        .set('Authorization', authHeader)
        .send({
          name: 'Existing Corp',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete company', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(mockPrismaCompany);
      vi.mocked(prisma.company.delete).mockResolvedValue(mockPrismaCompany);

      const response = await request(app)
        .delete('/api/companies/company-123')
        .set('Authorization', authHeader);

      expect(response.status).toBe(204);
      expect(prisma.company.delete).toHaveBeenCalledWith({
        where: { id: 'company-123' },
      });
    });

    it('should return 404 when deleting non-existent company', async () => {
      const { prisma } = await import('../../src/infrastructure/db/prisma.client.js');

      vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/companies/non-existent')
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
    });
  });
});
