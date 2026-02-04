import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createInteractionSchema,
  listInteractionsQuerySchema,
  updateInteractionSchema,
} from '../../../application/dto/interaction.dto.js';
import type { InteractionController } from '../controllers/interaction.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createInteractionRoutes(
  controller: InteractionController,
  authMiddleware: RequestHandler
): Router {
  const router = createRouter();

  /**
   * @openapi
   * /interactions:
   *   post:
   *     tags:
   *       - Interactions
   *     summary: Create a new interaction
   *     description: Creates a new interaction for the authenticated user. At least one of contactId, companyId, or dealId must be provided. Any referenced entity must belong to the same user.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InteractionCreateRequest'
   *           example:
   *             type: "meeting"
   *             occurredAt: "2026-02-04T14:00:00.000Z"
   *             summary: "Discussed Q2 roadmap and pricing adjustments"
   *             contactId: "456e7890-e89b-12d3-a456-426614174000"
   *             companyId: "123e4567-e89b-12d3-a456-426614174000"
   *             dealId: "789e0123-e89b-12d3-a456-426614174000"
   *     responses:
   *       201:
   *         description: Interaction created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/InteractionDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "aaa11111-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 type: "meeting"
   *                 occurredAt: "2026-02-04T14:00:00.000Z"
   *                 summary: "Discussed Q2 roadmap and pricing adjustments"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 createdAt: "2026-02-04T14:05:00.000Z"
   *                 updatedAt: "2026-02-04T14:05:00.000Z"
   *       400:
   *         description: Validation error or missing association
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "BAD_REQUEST"
   *                 message: "At least one of contactId, companyId, or dealId is required"
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
   *         description: Forbidden - Referenced entity does not belong to this user
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
    validate({ body: createInteractionSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /interactions:
   *   get:
   *     tags:
   *       - Interactions
   *     summary: List interactions with pagination and filters
   *     description: Returns a paginated list of interactions for the authenticated user. Supports filtering by contactId, companyId, dealId, type, and date range.
   *     security:
   *       - BearerAuth: []
   *     parameters:
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
   *         name: dealId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by deal ID
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [call, meeting, email, message, demo, note]
   *         description: Filter by interaction type
   *       - in: query
   *         name: from
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter interactions occurring on or after this date (inclusive)
   *         example: "2026-01-01T00:00:00.000Z"
   *       - in: query
   *         name: to
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter interactions occurring on or before this date (inclusive)
   *         example: "2026-12-31T23:59:59.999Z"
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
   *         description: Paginated list of interactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedInteractionsResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: "aaa11111-e89b-12d3-a456-426614174000"
   *                   userId: "987e6543-e21b-12d3-a456-426614174000"
   *                   type: "meeting"
   *                   occurredAt: "2026-02-04T14:00:00.000Z"
   *                   summary: "Discussed Q2 roadmap and pricing adjustments"
   *                   contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                   companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                   dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                   createdAt: "2026-02-04T14:05:00.000Z"
   *                   updatedAt: "2026-02-04T14:05:00.000Z"
   *               meta:
   *                 page: 1
   *                 pageSize: 20
   *                 totalCount: 5
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
    validate({ query: listInteractionsQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /interactions/{id}:
   *   get:
   *     tags:
   *       - Interactions
   *     summary: Get an interaction by ID
   *     description: Returns a single interaction by ID. Only returns interactions owned by the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Interaction ID
   *         example: "aaa11111-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Interaction details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/InteractionDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "aaa11111-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 type: "meeting"
   *                 occurredAt: "2026-02-04T14:00:00.000Z"
   *                 summary: "Discussed Q2 roadmap and pricing adjustments"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 createdAt: "2026-02-04T14:05:00.000Z"
   *                 updatedAt: "2026-02-04T14:05:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Interaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Interaction not found: aaa11111-e89b-12d3-a456-426614174000"
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
   * /interactions/{id}:
   *   patch:
   *     tags:
   *       - Interactions
   *     summary: Update an interaction
   *     description: Updates an existing interaction. Only the authenticated user who owns the interaction can update it. At least one of contactId, companyId, or dealId must remain associated after the update. If contactId/companyId/dealId are changed, the new values must belong to the same user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Interaction ID
   *         example: "aaa11111-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InteractionUpdateRequest'
   *           example:
   *             type: "call"
   *             summary: "Follow-up call about revised pricing"
   *     responses:
   *       200:
   *         description: Interaction updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/InteractionDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "aaa11111-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 type: "call"
   *                 occurredAt: "2026-02-04T14:00:00.000Z"
   *                 summary: "Follow-up call about revised pricing"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: "123e4567-e89b-12d3-a456-426614174000"
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 createdAt: "2026-02-04T14:05:00.000Z"
   *                 updatedAt: "2026-02-04T15:30:00.000Z"
   *       400:
   *         description: Validation error or missing association
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "BAD_REQUEST"
   *                 message: "At least one of contactId, companyId, or dealId is required"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Referenced entity does not belong to this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "FORBIDDEN"
   *                 message: "Access denied to contact: 456e7890-e89b-12d3-a456-426614174000"
   *       404:
   *         description: Interaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateInteractionSchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /interactions/{id}:
   *   delete:
   *     tags:
   *       - Interactions
   *     summary: Delete an interaction
   *     description: Deletes an interaction by ID. Only the authenticated user who owns the interaction can delete it.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Interaction ID
   *         example: "aaa11111-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Interaction deleted successfully (no content)
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Interaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Interaction not found: aaa11111-e89b-12d3-a456-426614174000"
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
