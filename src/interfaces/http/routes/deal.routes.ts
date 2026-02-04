import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createDealSchema,
  listDealsQuerySchema,
  markLostSchema,
  updateDealSchema,
} from '../../../application/dto/deal.dto.js';
import type { DealController } from '../controllers/deal.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createDealRoutes(
  controller: DealController,
  authMiddleware: RequestHandler
): Router {
  const router = createRouter();

  /**
   * @openapi
   * /deals:
   *   post:
   *     tags:
   *       - Deals
   *     summary: Create a new deal
   *     description: Creates a new deal for the authenticated user. At least one of contactId or companyId must be provided. If contactId/companyId are provided, they must belong to the same user.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DealCreateRequest'
   *           example:
   *             title: "Enterprise SaaS Contract"
   *             contactId: "456e7890-e89b-12d3-a456-426614174000"
   *             companyId: "123e4567-e89b-12d3-a456-426614174000"
   *             stage: "lead"
   *             valueCents: 500000
   *             currency: "CAD"
   *             probability: 20
   *             expectedCloseDate: "2025-06-30"
   *     responses:
   *       201:
   *         description: Deal created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DealDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "789e0123-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Enterprise SaaS Contract"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 stage: "lead"
   *                 valueCents: 500000
   *                 currency: "CAD"
   *                 probability: 20
   *                 expectedCloseDate: "2025-06-30T00:00:00.000Z"
   *                 lostReason: null
   *                 createdAt: "2025-01-15T10:30:00.000Z"
   *                 updatedAt: "2025-01-15T10:30:00.000Z"
   *       400:
   *         description: Validation error or missing contactId/companyId
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "BAD_REQUEST"
   *                 message: "At least one of contactId or companyId is required"
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
   *         description: Forbidden - Contact or company does not belong to this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "FORBIDDEN"
   *                 message: "Access denied to contact: 456e7890-e89b-12d3-a456-426614174000"
   */
  router.post(
    '/',
    authMiddleware,
    validate({ body: createDealSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /deals:
   *   get:
   *     tags:
   *       - Deals
   *     summary: List deals with pagination and filters
   *     description: Returns a paginated list of deals for the authenticated user. Supports search by title/lostReason, filtering by stage, contactId, companyId, value range, and expected close date range.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query (searches in title, lostReason using case-insensitive contains)
   *         example: "enterprise"
   *       - in: query
   *         name: stage
   *         schema:
   *           type: string
   *           enum: [lead, discovery, proposal, negotiation, won, lost]
   *         description: Filter by deal stage
   *         example: "proposal"
   *       - in: query
   *         name: contactId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by contact ID
   *       - in: query
   *         name: companyId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by company ID
   *       - in: query
   *         name: minValueCents
   *         schema:
   *           type: integer
   *           minimum: 0
   *         description: Minimum deal value in cents (inclusive)
   *         example: 10000
   *       - in: query
   *         name: maxValueCents
   *         schema:
   *           type: integer
   *           minimum: 0
   *         description: Maximum deal value in cents (inclusive)
   *         example: 1000000
   *       - in: query
   *         name: expectedCloseFrom
   *         schema:
   *           type: string
   *           format: date
   *         description: Expected close date range start (inclusive)
   *         example: "2025-01-01"
   *       - in: query
   *         name: expectedCloseTo
   *         schema:
   *           type: string
   *           format: date
   *         description: Expected close date range end (inclusive)
   *         example: "2025-12-31"
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [updatedAt_desc, createdAt_desc, value_desc, expectedCloseDate_asc]
   *           default: updatedAt_desc
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
   *         description: Paginated list of deals
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedDealsResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: "789e0123-e89b-12d3-a456-426614174000"
   *                   userId: "987e6543-e21b-12d3-a456-426614174000"
   *                   title: "Enterprise SaaS Contract"
   *                   contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                   companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                   stage: "proposal"
   *                   valueCents: 500000
   *                   currency: "CAD"
   *                   probability: 50
   *                   expectedCloseDate: "2025-06-30T00:00:00.000Z"
   *                   lostReason: null
   *                   createdAt: "2025-01-15T10:30:00.000Z"
   *                   updatedAt: "2025-01-20T14:00:00.000Z"
   *               meta:
   *                 page: 1
   *                 pageSize: 20
   *                 totalCount: 12
   *                 totalPages: 1
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
    validate({ query: listDealsQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /deals/{id}:
   *   get:
   *     tags:
   *       - Deals
   *     summary: Get a deal by ID
   *     description: Returns a single deal by ID. Only returns deals owned by the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Deal ID
   *         example: "789e0123-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Deal details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DealDto'
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deal not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Deal not found: 789e0123-e89b-12d3-a456-426614174000"
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
   * /deals/{id}:
   *   patch:
   *     tags:
   *       - Deals
   *     summary: Update a deal
   *     description: Updates an existing deal. Only the authenticated user who owns the deal can update it. Cannot update deals that are already in "won" or "lost" stage (returns 409). At least one of contactId or companyId must remain associated after the update.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Deal ID
   *         example: "789e0123-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DealUpdateRequest'
   *           example:
   *             stage: "negotiation"
   *             probability: 70
   *             valueCents: 600000
   *     responses:
   *       200:
   *         description: Deal updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DealDto'
   *       400:
   *         description: Validation error or missing association
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
   *         description: Forbidden - Contact or company does not belong to this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deal not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Conflict - Cannot update a closed deal
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Cannot update a deal that is already \"won\". Closed deals cannot be moved backward."
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateDealSchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /deals/{id}/mark-won:
   *   post:
   *     tags:
   *       - Deals
   *     summary: Mark a deal as won
   *     description: Marks a deal as won. Sets stage to "won", probability to 100, and clears lostReason. Cannot mark a deal that is already "won" or "lost" (returns 409).
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Deal ID
   *         example: "789e0123-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Deal marked as won
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DealDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "789e0123-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Enterprise SaaS Contract"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 stage: "won"
   *                 valueCents: 500000
   *                 currency: "CAD"
   *                 probability: 100
   *                 expectedCloseDate: "2025-06-30T00:00:00.000Z"
   *                 lostReason: null
   *                 createdAt: "2025-01-15T10:30:00.000Z"
   *                 updatedAt: "2025-02-01T09:00:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deal not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Conflict - Deal is already closed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Cannot update a deal that is already \"won\". Closed deals cannot be moved backward."
   */
  router.post(
    '/:id/mark-won',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.markWon(req, res);
    })
  );

  /**
   * @openapi
   * /deals/{id}/mark-lost:
   *   post:
   *     tags:
   *       - Deals
   *     summary: Mark a deal as lost
   *     description: Marks a deal as lost. Sets stage to "lost", probability to 0, and requires a lostReason (min 3 characters). Cannot mark a deal that is already "won" or "lost" (returns 409).
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Deal ID
   *         example: "789e0123-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MarkLostRequest'
   *           example:
   *             lostReason: "Budget constraints - client postponed to next quarter"
   *     responses:
   *       200:
   *         description: Deal marked as lost
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/DealDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "789e0123-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Enterprise SaaS Contract"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 stage: "lost"
   *                 valueCents: 500000
   *                 currency: "CAD"
   *                 probability: 0
   *                 expectedCloseDate: "2025-06-30T00:00:00.000Z"
   *                 lostReason: "Budget constraints - client postponed to next quarter"
   *                 createdAt: "2025-01-15T10:30:00.000Z"
   *                 updatedAt: "2025-02-01T09:00:00.000Z"
   *       400:
   *         description: Validation error - lostReason is required (min 3 chars)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "VALIDATION_ERROR"
   *                 message: "Validation failed"
   *                 details:
   *                   - field: "lostReason"
   *                     message: "Lost reason must be at least 3 characters"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deal not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Conflict - Deal is already closed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/:id/mark-lost',
    authMiddleware,
    validate({ body: markLostSchema }),
    asyncHandler(async (req, res) => {
      await controller.markLost(req, res);
    })
  );

  /**
   * @openapi
   * /deals/{id}:
   *   delete:
   *     tags:
   *       - Deals
   *     summary: Delete a deal
   *     description: Deletes a deal by ID. Only the authenticated user who owns the deal can delete it.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Deal ID
   *         example: "789e0123-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Deal deleted successfully (no content)
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deal not found
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
