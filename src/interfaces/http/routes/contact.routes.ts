import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createContactSchema,
  listContactsQuerySchema,
  updateContactSchema,
} from '../../../application/dto/contact.dto.js';
import type { ContactController } from '../controllers/contact.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createContactRoutes(
  controller: ContactController,
  authMiddleware: RequestHandler
): Router {
  const router = createRouter();

  /**
   * @openapi
   * /contacts:
   *   post:
   *     tags:
   *       - Contacts
   *     summary: Create a new contact
   *     description: Creates a new contact for the authenticated user. If email is provided, it must be unique per user (case-insensitive). If companyId is provided, the company must belong to the same user.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContactCreateRequest'
   *           example:
   *             firstName: "John"
   *             lastName: "Doe"
   *             email: "john.doe@example.com"
   *             phone: "+1-555-123-4567"
   *             title: "CEO"
   *             companyId: "123e4567-e89b-12d3-a456-426614174000"
   *             source: "linkedin"
   *             status: "lead"
   *     responses:
   *       201:
   *         description: Contact created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ContactDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "456e7890-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 firstName: "John"
   *                 lastName: "Doe"
   *                 email: "john.doe@example.com"
   *                 phone: "+1-555-123-4567"
   *                 title: "CEO"
   *                 source: "linkedin"
   *                 status: "lead"
   *                 lastContactedAt: null
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
   *                   - field: "email"
   *                     message: "Invalid email format"
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
   *       403:
   *         description: Forbidden - Company does not belong to this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "FORBIDDEN"
   *                 message: "Access denied to company: 123e4567-e89b-12d3-a456-426614174000"
   *       409:
   *         description: Contact email already exists for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Contact with email \"john.doe@example.com\" already exists for this user"
   */
  router.post(
    '/',
    authMiddleware,
    validate({ body: createContactSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /contacts:
   *   get:
   *     tags:
   *       - Contacts
   *     summary: List contacts with pagination and filters
   *     description: Returns a paginated list of contacts for the authenticated user. Supports search (firstName, lastName, email, phone, title), filtering, and sorting.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query (searches in firstName, lastName, email, phone, title using case-insensitive contains)
   *         example: "john"
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [lead, contacted, qualified, customer, inactive]
   *         description: Filter by contact status
   *         example: "lead"
   *       - in: query
   *         name: companyId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by company ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *       - in: query
   *         name: source
   *         schema:
   *           type: string
   *           enum: [freelance, inbound, referral, linkedin, cold, other]
   *         description: Filter by contact source
   *         example: "linkedin"
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [createdAt_desc, createdAt_asc, lastContactedAt_desc, name_asc, name_desc]
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
   *         description: Paginated list of contacts
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedContactsResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: "456e7890-e89b-12d3-a456-426614174000"
   *                   userId: "987e6543-e21b-12d3-a456-426614174000"
   *                   companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                   firstName: "John"
   *                   lastName: "Doe"
   *                   email: "john.doe@example.com"
   *                   phone: "+1-555-123-4567"
   *                   title: "CEO"
   *                   source: "linkedin"
   *                   status: "lead"
   *                   lastContactedAt: null
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
    validate({ query: listContactsQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /contacts/{id}:
   *   get:
   *     tags:
   *       - Contacts
   *     summary: Get a contact by ID
   *     description: Returns a single contact by ID. Only returns contacts owned by the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Contact ID
   *         example: "456e7890-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Contact details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ContactDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "456e7890-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 firstName: "John"
   *                 lastName: "Doe"
   *                 email: "john.doe@example.com"
   *                 phone: "+1-555-123-4567"
   *                 title: "CEO"
   *                 source: "linkedin"
   *                 status: "lead"
   *                 lastContactedAt: null
   *                 createdAt: "2024-01-15T10:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Contact not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Contact not found: 456e7890-e89b-12d3-a456-426614174000"
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
   * /contacts/{id}:
   *   patch:
   *     tags:
   *       - Contacts
   *     summary: Update a contact
   *     description: Updates an existing contact. Only the authenticated user who owns the contact can update it. All fields are optional. If companyId is provided, the company must belong to the same user. If email is changed, it must be unique per user (case-insensitive).
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Contact ID
   *         example: "456e7890-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContactUpdateRequest'
   *           example:
   *             status: "contacted"
   *             title: "CTO"
   *     responses:
   *       200:
   *         description: Contact updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ContactDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "456e7890-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 firstName: "John"
   *                 lastName: "Doe"
   *                 email: "john.doe@example.com"
   *                 phone: "+1-555-123-4567"
   *                 title: "CTO"
   *                 source: "linkedin"
   *                 status: "contacted"
   *                 lastContactedAt: null
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
   *         description: Forbidden - Company does not belong to this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Contact not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Contact email already exists for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateContactSchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /contacts/{id}:
   *   delete:
   *     tags:
   *       - Contacts
   *     summary: Delete a contact
   *     description: |
   *       Deletes a contact by ID. Only the authenticated user who owns the contact can delete it.
   *
   *       **Side effects:** When a contact is deleted, the following related records will have their contactId set to null:
   *       - deals.contactId
   *       - interactions.contactId
   *       - tasks.contactId
   *
   *       This ensures historical data is preserved while removing the contact association.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Contact ID
   *         example: "456e7890-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Contact deleted successfully (no content)
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Contact not found
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
