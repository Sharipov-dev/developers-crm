import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '../../../shared/config/env.config.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Personal CRM API',
      version: '1.0.0',
      description: 'RESTful API for Personal CRM application with authentication',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Users', description: 'User authentication and profile management' },
      { name: 'Companies', description: 'Company management endpoints' },
      { name: 'Contacts', description: 'Contact management endpoints' },
      { name: 'Deals', description: 'Deal pipeline management endpoints' },
      { name: 'Interactions', description: 'Interaction tracking endpoints' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token in Authorization header',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input data' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
              required: ['code', 'message'],
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            displayName: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['active', 'disabled'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                user: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
        },
        CompanyDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            name: { type: 'string', maxLength: 120 },
            website: { type: 'string', format: 'uri', nullable: true, maxLength: 255 },
            industry: { type: 'string', nullable: true, maxLength: 80 },
            size: {
              type: 'string',
              nullable: true,
              enum: ['solo', '1-10', '11-50', '51-200', '200+'],
            },
            notes: { type: 'string', nullable: true, maxLength: 2000 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'userId', 'name', 'createdAt', 'updatedAt'],
        },
        CompanyCreateRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
              description: 'Company name (must be unique per user, case-insensitive)',
            },
            website: {
              type: 'string',
              format: 'uri',
              maxLength: 255,
              description: 'Company website URL',
            },
            industry: {
              type: 'string',
              maxLength: 80,
              description: 'Industry sector',
            },
            size: {
              type: 'string',
              enum: ['solo', '1-10', '11-50', '51-200', '200+'],
              description: 'Company size',
            },
            notes: {
              type: 'string',
              maxLength: 2000,
              description: 'Additional notes',
            },
          },
        },
        CompanyUpdateRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
              description: 'Company name (must be unique per user, case-insensitive)',
            },
            website: {
              type: 'string',
              format: 'uri',
              maxLength: 255,
              nullable: true,
              description: 'Company website URL (set to null to clear)',
            },
            industry: {
              type: 'string',
              maxLength: 80,
              nullable: true,
              description: 'Industry sector (set to null to clear)',
            },
            size: {
              type: 'string',
              enum: ['solo', '1-10', '11-50', '51-200', '200+'],
              nullable: true,
              description: 'Company size (set to null to clear)',
            },
            notes: {
              type: 'string',
              maxLength: 2000,
              nullable: true,
              description: 'Additional notes (set to null to clear)',
            },
          },
        },
        PaginatedCompaniesResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/CompanyDto' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                totalCount: { type: 'integer', example: 45 },
                totalPages: { type: 'integer', example: 3 },
              },
            },
          },
        },
        ContactDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            companyId: { type: 'string', format: 'uuid', nullable: true },
            firstName: { type: 'string', nullable: true, maxLength: 60 },
            lastName: { type: 'string', nullable: true, maxLength: 60 },
            email: { type: 'string', format: 'email', nullable: true, maxLength: 255 },
            phone: { type: 'string', nullable: true, maxLength: 40 },
            title: { type: 'string', nullable: true, maxLength: 80 },
            source: {
              type: 'string',
              nullable: true,
              enum: ['freelance', 'inbound', 'referral', 'linkedin', 'cold', 'other'],
            },
            status: {
              type: 'string',
              enum: ['lead', 'contacted', 'qualified', 'customer', 'inactive'],
            },
            lastContactedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'userId', 'status', 'createdAt', 'updatedAt'],
        },
        ContactCreateRequest: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              format: 'uuid',
              description: 'Company ID (must belong to the authenticated user)',
            },
            firstName: {
              type: 'string',
              maxLength: 60,
              description: 'Contact first name',
            },
            lastName: {
              type: 'string',
              maxLength: 60,
              description: 'Contact last name',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              description: 'Contact email (must be unique per user, case-insensitive)',
            },
            phone: {
              type: 'string',
              maxLength: 40,
              description: 'Contact phone number',
            },
            title: {
              type: 'string',
              maxLength: 80,
              description: 'Contact job title',
            },
            source: {
              type: 'string',
              enum: ['freelance', 'inbound', 'referral', 'linkedin', 'cold', 'other'],
              description: 'How the contact was acquired',
            },
            status: {
              type: 'string',
              enum: ['lead', 'contacted', 'qualified', 'customer', 'inactive'],
              default: 'lead',
              description: 'Contact status in the sales pipeline',
            },
          },
        },
        ContactUpdateRequest: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Company ID (set to null to remove association)',
            },
            firstName: {
              type: 'string',
              maxLength: 60,
              nullable: true,
              description: 'Contact first name (set to null to clear)',
            },
            lastName: {
              type: 'string',
              maxLength: 60,
              nullable: true,
              description: 'Contact last name (set to null to clear)',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              nullable: true,
              description: 'Contact email (set to null to clear)',
            },
            phone: {
              type: 'string',
              maxLength: 40,
              nullable: true,
              description: 'Contact phone number (set to null to clear)',
            },
            title: {
              type: 'string',
              maxLength: 80,
              nullable: true,
              description: 'Contact job title (set to null to clear)',
            },
            source: {
              type: 'string',
              enum: ['freelance', 'inbound', 'referral', 'linkedin', 'cold', 'other'],
              nullable: true,
              description: 'How the contact was acquired (set to null to clear)',
            },
            status: {
              type: 'string',
              enum: ['lead', 'contacted', 'qualified', 'customer', 'inactive'],
              description: 'Contact status in the sales pipeline',
            },
          },
        },
        PaginatedContactsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ContactDto' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                totalCount: { type: 'integer', example: 45 },
                totalPages: { type: 'integer', example: 3 },
              },
            },
          },
        },
        DealDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string', maxLength: 120 },
            contactId: { type: 'string', format: 'uuid', nullable: true },
            companyId: { type: 'string', format: 'uuid', nullable: true },
            stage: {
              type: 'string',
              enum: ['lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost'],
            },
            valueCents: { type: 'integer', nullable: true, minimum: 0 },
            currency: { type: 'string', pattern: '^[A-Z]{3}$', example: 'CAD' },
            probability: { type: 'integer', nullable: true, minimum: 0, maximum: 100 },
            expectedCloseDate: { type: 'string', format: 'date-time', nullable: true },
            lostReason: { type: 'string', nullable: true, maxLength: 300 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'userId', 'title', 'stage', 'currency', 'createdAt', 'updatedAt'],
        },
        DealCreateRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
              description: 'Deal title',
            },
            contactId: {
              type: 'string',
              format: 'uuid',
              description: 'Contact ID (must belong to the authenticated user)',
            },
            companyId: {
              type: 'string',
              format: 'uuid',
              description: 'Company ID (must belong to the authenticated user)',
            },
            stage: {
              type: 'string',
              enum: ['lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost'],
              default: 'lead',
              description: 'Deal stage in the pipeline',
            },
            valueCents: {
              type: 'integer',
              minimum: 0,
              description: 'Deal value in cents',
            },
            currency: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              default: 'CAD',
              description: '3-letter currency code (e.g., CAD, USD)',
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Win probability percentage (0-100)',
            },
            expectedCloseDate: {
              type: 'string',
              format: 'date',
              description: 'Expected close date',
            },
          },
        },
        DealUpdateRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
              description: 'Deal title',
            },
            contactId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Contact ID (set to null to remove association)',
            },
            companyId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Company ID (set to null to remove association)',
            },
            stage: {
              type: 'string',
              enum: ['lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost'],
              description: 'Deal stage in the pipeline',
            },
            valueCents: {
              type: 'integer',
              minimum: 0,
              nullable: true,
              description: 'Deal value in cents (set to null to clear)',
            },
            currency: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              description: '3-letter currency code (e.g., CAD, USD)',
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Win probability percentage (set to null to clear)',
            },
            expectedCloseDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected close date (set to null to clear)',
            },
            lostReason: {
              type: 'string',
              maxLength: 300,
              nullable: true,
              description: 'Reason the deal was lost (set to null to clear)',
            },
          },
        },
        MarkLostRequest: {
          type: 'object',
          required: ['lostReason'],
          properties: {
            lostReason: {
              type: 'string',
              minLength: 3,
              maxLength: 300,
              description: 'Reason the deal was lost',
            },
          },
        },
        PaginatedDealsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/DealDto' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                totalCount: { type: 'integer', example: 12 },
                totalPages: { type: 'integer', example: 1 },
              },
            },
          },
        },
        InteractionDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: {
              type: 'string',
              enum: ['call', 'meeting', 'email', 'message', 'demo', 'note'],
            },
            occurredAt: { type: 'string', format: 'date-time' },
            summary: { type: 'string', maxLength: 2000 },
            contactId: { type: 'string', format: 'uuid', nullable: true },
            companyId: { type: 'string', format: 'uuid', nullable: true },
            dealId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'userId', 'type', 'occurredAt', 'summary', 'createdAt', 'updatedAt'],
        },
        InteractionCreateRequest: {
          type: 'object',
          required: ['type', 'occurredAt', 'summary'],
          properties: {
            type: {
              type: 'string',
              enum: ['call', 'meeting', 'email', 'message', 'demo', 'note'],
              description: 'Type of interaction',
            },
            occurredAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the interaction occurred',
            },
            summary: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'Summary of the interaction',
            },
            contactId: {
              type: 'string',
              format: 'uuid',
              description: 'Contact ID (must belong to the authenticated user)',
            },
            companyId: {
              type: 'string',
              format: 'uuid',
              description: 'Company ID (must belong to the authenticated user)',
            },
            dealId: {
              type: 'string',
              format: 'uuid',
              description: 'Deal ID (must belong to the authenticated user)',
            },
          },
        },
        InteractionUpdateRequest: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['call', 'meeting', 'email', 'message', 'demo', 'note'],
              description: 'Type of interaction',
            },
            occurredAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the interaction occurred',
            },
            summary: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'Summary of the interaction',
            },
            contactId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Contact ID (set to null to remove association)',
            },
            companyId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Company ID (set to null to remove association)',
            },
            dealId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Deal ID (set to null to remove association)',
            },
          },
        },
        PaginatedInteractionsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/InteractionDto' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                totalCount: { type: 'integer', example: 5 },
                totalPages: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/interfaces/http/routes/*.ts', './dist/interfaces/http/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
