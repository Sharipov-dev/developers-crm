import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from '../../../application/dto/task.dto.js';
import type { TaskController } from '../controllers/task.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createTaskRoutes(
  controller: TaskController,
  authMiddleware: RequestHandler
): Router {
  const router = createRouter();

  /**
   * @openapi
   * /tasks:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Create a new task
   *     description: Creates a new task for the authenticated user. If contactId, companyId, or dealId is provided, it must belong to the same user. If status is "done", completedAt is set automatically. Status "canceled" is not allowed on creation.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskCreateRequest'
   *           example:
   *             title: "Follow up with John about proposal"
   *             description: "Send revised pricing and check timeline"
   *             dueAt: "2026-02-14T10:00:00.000Z"
   *             priority: "high"
   *             contactId: "456e7890-e89b-12d3-a456-426614174000"
   *             dealId: "789e0123-e89b-12d3-a456-426614174000"
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TaskDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "bbb22222-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Follow up with John about proposal"
   *                 description: "Send revised pricing and check timeline"
   *                 dueAt: "2026-02-14T10:00:00.000Z"
   *                 status: "open"
   *                 priority: "high"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: null
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 completedAt: null
   *                 createdAt: "2026-02-07T12:00:00.000Z"
   *                 updatedAt: "2026-02-07T12:00:00.000Z"
   *       400:
   *         description: Validation error or invalid status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "BAD_REQUEST"
   *                 message: "Cannot create a task with status \"canceled\""
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
    validate({ body: createTaskSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /tasks:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: List tasks with pagination, filters, and sorting
   *     description: Returns a paginated list of tasks for the authenticated user. Supports filtering by status, priority, contactId, companyId, dealId, and due date range. Default sort is dueAt ascending.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [open, done, canceled]
   *         description: Filter by task status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high]
   *         description: Filter by task priority
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
   *         name: dueFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks with dueAt on or after this date (inclusive)
   *         example: "2026-02-01T00:00:00.000Z"
   *       - in: query
   *         name: dueTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks with dueAt on or before this date (inclusive)
   *         example: "2026-02-28T23:59:59.999Z"
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [dueAt_asc, dueAt_desc, createdAt_desc]
   *           default: dueAt_asc
   *         description: Sort order for results
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
   *         description: Paginated list of tasks
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedTasksResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: "bbb22222-e89b-12d3-a456-426614174000"
   *                   userId: "987e6543-e21b-12d3-a456-426614174000"
   *                   title: "Follow up with John about proposal"
   *                   description: "Send revised pricing and check timeline"
   *                   dueAt: "2026-02-14T10:00:00.000Z"
   *                   status: "open"
   *                   priority: "high"
   *                   contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                   companyId: null
   *                   dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                   completedAt: null
   *                   createdAt: "2026-02-07T12:00:00.000Z"
   *                   updatedAt: "2026-02-07T12:00:00.000Z"
   *               meta:
   *                 page: 1
   *                 pageSize: 20
   *                 totalCount: 8
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
    validate({ query: listTasksQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /tasks/{id}:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get a task by ID
   *     description: Returns a single task by ID. Only returns tasks owned by the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *         example: "bbb22222-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Task details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TaskDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "bbb22222-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Follow up with John about proposal"
   *                 description: "Send revised pricing and check timeline"
   *                 dueAt: "2026-02-14T10:00:00.000Z"
   *                 status: "open"
   *                 priority: "high"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: null
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 completedAt: null
   *                 createdAt: "2026-02-07T12:00:00.000Z"
   *                 updatedAt: "2026-02-07T12:00:00.000Z"
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
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Task not found: bbb22222-e89b-12d3-a456-426614174000"
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
   * /tasks/{id}:
   *   patch:
   *     tags:
   *       - Tasks
   *     summary: Update a task
   *     description: Updates an existing task. Only the authenticated user who owns the task can update it. If status is set to "done", completedAt is automatically set to server time. If status is set to "open" or "canceled", completedAt is cleared. If contactId/companyId/dealId are changed, the new values must belong to the same user.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *         example: "bbb22222-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskUpdateRequest'
   *           example:
   *             title: "Updated task title"
   *             priority: "low"
   *             status: "done"
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TaskDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "bbb22222-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Updated task title"
   *                 description: "Send revised pricing and check timeline"
   *                 dueAt: "2026-02-14T10:00:00.000Z"
   *                 status: "done"
   *                 priority: "low"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: null
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 completedAt: "2026-02-08T09:30:00.000Z"
   *                 createdAt: "2026-02-07T12:00:00.000Z"
   *                 updatedAt: "2026-02-08T09:30:00.000Z"
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
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Task not found: bbb22222-e89b-12d3-a456-426614174000"
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateTaskSchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /tasks/{id}:
   *   delete:
   *     tags:
   *       - Tasks
   *     summary: Delete a task
   *     description: Deletes a task by ID. Only the authenticated user who owns the task can delete it.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *         example: "bbb22222-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Task deleted successfully (no content)
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Task not found: bbb22222-e89b-12d3-a456-426614174000"
   */
  router.delete(
    '/:id',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.delete(req, res);
    })
  );

  /**
   * @openapi
   * /tasks/{id}/complete:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Complete a task
   *     description: Marks a task as done and sets completedAt to server time. Idempotent — if the task is already done, it returns the task as-is. Returns 409 if the task is canceled.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *         example: "bbb22222-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Task completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TaskDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "bbb22222-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Follow up with John about proposal"
   *                 description: "Send revised pricing and check timeline"
   *                 dueAt: "2026-02-14T10:00:00.000Z"
   *                 status: "done"
   *                 priority: "high"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: null
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 completedAt: "2026-02-08T10:00:00.000Z"
   *                 createdAt: "2026-02-07T12:00:00.000Z"
   *                 updatedAt: "2026-02-08T10:00:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Task not found: bbb22222-e89b-12d3-a456-426614174000"
   *       409:
   *         description: Conflict - Task is canceled and cannot be completed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Cannot complete or reopen a canceled task"
   */
  router.post(
    '/:id/complete',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.complete(req, res);
    })
  );

  /**
   * @openapi
   * /tasks/{id}/reopen:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Reopen a task
   *     description: Reopens a done task by setting status to open and clearing completedAt. Idempotent — if the task is already open, it returns the task as-is. Returns 409 if the task is canceled.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Task ID
   *         example: "bbb22222-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Task reopened successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TaskDto'
   *             example:
   *               success: true
   *               data:
   *                 id: "bbb22222-e89b-12d3-a456-426614174000"
   *                 userId: "987e6543-e21b-12d3-a456-426614174000"
   *                 title: "Follow up with John about proposal"
   *                 description: "Send revised pricing and check timeline"
   *                 dueAt: "2026-02-14T10:00:00.000Z"
   *                 status: "open"
   *                 priority: "high"
   *                 contactId: "456e7890-e89b-12d3-a456-426614174000"
   *                 companyId: null
   *                 dealId: "789e0123-e89b-12d3-a456-426614174000"
   *                 completedAt: null
   *                 createdAt: "2026-02-07T12:00:00.000Z"
   *                 updatedAt: "2026-02-08T11:00:00.000Z"
   *       401:
   *         description: Unauthorized - Missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "NOT_FOUND"
   *                 message: "Task not found: bbb22222-e89b-12d3-a456-426614174000"
   *       409:
   *         description: Conflict - Task is canceled and cannot be reopened
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               error:
   *                 code: "CONFLICT"
   *                 message: "Cannot complete or reopen a canceled task"
   */
  router.post(
    '/:id/reopen',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.reopen(req, res);
    })
  );

  return router;
}
