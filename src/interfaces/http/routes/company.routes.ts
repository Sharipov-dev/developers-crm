import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
} from '../../../application/dto/company.dto.js';
import type { CompanyController } from '../controllers/company.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createCompanyRoutes(
  controller: CompanyController,
  authMiddleware: RequestHandler
): Router {
  const router = createRouter();

  /**
   * @openapi
   * /companies:
   *   post:
   *     tags:
   *       - Companies
   *     summary: Create a new company
   *     description: Creates a new company for the authenticated user. Company name must be unique per user (case-insensitive).
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompanyCreateRequest'
   *           example:
   *             name: "Acme Corporation"
   *             website: "https://acme.com"
   *             industry: "Technology"
   *             size: "51-200"
   *             notes: "Enterprise client, interested in our premium plan"
   *     responses:
   *       201:
   *         description: Company created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CompanyDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "123e4567-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 name: "Acme Corporation"
   *                 website: "https://acme.com"
   *                 industry: "Technology"
   *                 size: "51-200"
   *                 notes: "Enterprise client, interested in our premium plan"
   *                 createdAt: "2024-01-15T10:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "VALIDATION_ERROR"
   *                 message: "Invalid input data"
   *                 details:
   *                   - field: "name"
   *                     message: "Name is required"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "UNAUTHORIZED"
   *                 message: "Missing or invalid authorization header"
   *       409:
   *         description: Company name already exists for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Company with name \"Acme Corporation\" already exists for this user"
   */
  router.post(
    '/',
    authMiddleware,
    validate({ body: createCompanySchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /companies:
   *   get:
   *     tags:
   *       - Companies
   *     summary: List companies with pagination and filters
   *     description: Returns a paginated list of companies for the authenticated user. Supports search, filtering, and sorting.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query (searches in name, website, industry using case-insensitive contains)
   *         example: "tech"
   *       - in: query
   *         name: industry
   *         schema:
   *           type: string
   *         description: Filter by industry (case-insensitive exact match)
   *         example: "Technology"
   *       - in: query
   *         name: size
   *         schema:
   *           type: string
   *           enum: [solo, "1-10", "11-50", "51-200", "200+"]
   *         description: Filter by company size
   *         example: "51-200"
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [createdAt_desc, createdAt_asc, name_asc, name_desc]
   *           default: createdAt_desc
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of items per page (max 100)
   *     responses:
   *       200:
   *         description: Paginated list of companies
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedCompaniesResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: "123e4567-e89b-12d3-a456-426614174000"
   *                   userId: "987e6543-e21b-12d3-a456-426614174000"
   *                   name: "Acme Corporation"
   *                   website: "https://acme.com"
   *                   industry: "Technology"
   *                   size: "51-200"
   *                   notes: "Enterprise client"
   *                   createdAt: "2024-01-15T10:30:00.000Z"
   *                   updatedAt: "2024-01-15T10:30:00.000Z"
   *               meta:
   *                 page: 1
   *                 pageSize: 20
   *                 totalCount: 45
   *                 totalPages: 3
   *       400:
   *         description: Validation error in query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/',
    authMiddleware,
    validate({ query: listCompaniesQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /companies/{id}:
   *   get:
   *     tags:
   *       - Companies
   *     summary: Get a company by ID
   *     description: Returns a single company by ID. Only returns companies owned by the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Company ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Company details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CompanyDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "123e4567-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 name: "Acme Corporation"
   *                 website: "https://acme.com"
   *                 industry: "Technology"
   *                 size: "51-200"
   *                 notes: "Enterprise client"
   *                 createdAt: "2024-01-15T10:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User does not own this company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "FORBIDDEN"
   *                 message: "Access denied to company: 123e4567-e89b-12d3-a456-426614174000"
   *       404:
   *         description: Company not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Company not found: 123e4567-e89b-12d3-a456-426614174000"
   */
  router.get(
    '/:id',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.getById(req, res);
    })
  );

  /**
   * @openapi
   * /companies/{id}:
   *   patch:
   *     tags:
   *       - Companies
   *     summary: Update a company
   *     description: Updates an existing company. Only the authenticated user who owns the company can update it. All fields are optional.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Company ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompanyUpdateRequest'
   *           example:
   *             name: "Acme Corp International"
   *             size: "200+"
   *             notes: "Upgraded to enterprise plan"
   *     responses:
   *       200:
   *         description: Company updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CompanyDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "123e4567-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 name: "Acme Corp International"
   *                 website: "https://acme.com"
   *                 industry: "Technology"
   *                 size: "200+"
   *                 notes: "Upgraded to enterprise plan"
   *                 createdAt: "2024-01-15T10:30:00.000Z"
   *                 updatedAt: "2024-01-16T14:20:00.000Z"
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User does not own this company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Company not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Company name already exists for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateCompanySchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /companies/{id}:
   *   delete:
   *     tags:
   *       - Companies
   *     summary: Delete a company
   *     description: |
   *       Deletes a company by ID. Only the authenticated user who owns the company can delete it.
   *
   *       **Side effects:** When a company is deleted, the following related records will have their companyId set to null:
   *       - contacts.companyId
   *       - deals.companyId
   *       - interactions.companyId
   *       - tasks.companyId
   *
   *       This ensures historical data is preserved while removing the company association.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Company ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Company deleted successfully (no content)
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User does not own this company
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Company not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete(
    '/:id',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.delete(req, res);
    })
  );

  return router;
}
