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
      { name: 'Categories', description: 'Category management with hierarchical support' },
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
        CategoryDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            name: { type: 'string', maxLength: 50, example: 'Groceries' },
            parentId: { type: 'string', format: 'uuid', nullable: true, example: null },
            sortOrder: { type: 'integer', minimum: 0, example: 0 },
            icon: { type: 'string', maxLength: 50, nullable: true, example: 'shopping-cart' },
            color: { type: 'string', pattern: '^#([A-Fa-f0-9]{6})$', nullable: true, example: '#FF5733' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategoryDto' },
              description: 'Child categories (only when includeChildren=true)',
            },
          },
          required: ['id', 'name', 'parentId', 'sortOrder', 'icon', 'color', 'createdAt', 'updatedAt'],
        },
        CategoryCreateRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              example: 'Groceries',
              description: 'Category name (unique per user, case-insensitive)',
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: null,
              description: 'Parent category ID (null for root categories)',
            },
            sortOrder: {
              type: 'integer',
              minimum: 0,
              default: 0,
              example: 0,
              description: 'Sort order (lower numbers appear first)',
            },
            icon: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              example: 'shopping-cart',
              description: 'Icon identifier',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6})$',
              nullable: true,
              example: '#FF5733',
              description: 'Hex color code (#RRGGBB)',
            },
          },
          required: ['name'],
        },
        CategoryUpdateRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              example: 'Updated Groceries',
              description: 'Category name (unique per user, case-insensitive)',
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: null,
              description: 'Parent category ID (null for root categories, cannot create cycles)',
            },
            sortOrder: {
              type: 'integer',
              minimum: 0,
              example: 1,
              description: 'Sort order (lower numbers appear first)',
            },
            icon: {
              type: 'string',
              maxLength: 50,
              nullable: true,
              example: 'shopping-bag',
              description: 'Icon identifier',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6})$',
              nullable: true,
              example: '#00FF00',
              description: 'Hex color code (#RRGGBB)',
            },
          },
        },
        PaginatedCategoriesResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategoryDto' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                totalCount: { type: 'integer', example: 50 },
                totalPages: { type: 'integer', example: 3 },
              },
              required: ['page', 'pageSize', 'totalCount', 'totalPages'],
            },
          },
          required: ['success', 'data', 'meta'],
        },
      },
    },
  },
  apis: ['./src/interfaces/http/routes/*.ts', './dist/interfaces/http/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
