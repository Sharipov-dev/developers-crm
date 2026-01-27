import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../../../application/dto/category.dto.js';
import type { CategoryController } from '../controllers/category.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createCategoryRoutes(controller: CategoryController, authMiddleware: RequestHandler): Router {
  const router = createRouter();

  /**
   * @openapi
   * /categories:
   *   post:
   *     tags:
   *       - Categories
   *     summary: Create a new category
   *     description: Creates a new category for the authenticated user
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CategoryCreateRequest'
   *           example:
   *             name: "Groceries"
   *             parentId: null
   *             sortOrder: 0
   *             icon: "shopping-cart"
   *             color: "#FF5733"
   *     responses:
   *       201:
   *         description: Category created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CategoryDto'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - parent category does not belong to you
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Parent category not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Category name already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/',
    authMiddleware,
    validate({ body: createCategorySchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  /**
   * @openapi
   * /categories/{id}:
   *   get:
   *     tags:
   *       - Categories
   *     summary: Get category by ID
   *     description: Returns a category by its ID (must belong to authenticated user)
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Category found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CategoryDto'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - category does not belong to you
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Category not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
   * /categories:
   *   get:
   *     tags:
   *       - Categories
   *     summary: List categories
   *     description: Returns paginated list of categories for the authenticated user. Can filter by parentId and optionally include children.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: parentId
   *         schema:
   *           type: string
   *           format: uuid
   *           nullable: true
   *         description: Filter by parent category ID (null for root categories)
   *         example: null
   *       - in: query
   *         name: includeChildren
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include child categories in response
   *         example: false
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of items per page
   *         example: 20
   *     responses:
   *       200:
   *         description: Categories retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedCategoriesResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/',
    authMiddleware,
    validate({ query: listCategoriesQuerySchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  /**
   * @openapi
   * /categories/{id}:
   *   patch:
   *     tags:
   *       - Categories
   *     summary: Update category
   *     description: Updates a category (must belong to authenticated user). Prevents circular references.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CategoryUpdateRequest'
   *           example:
   *             name: "Updated Groceries"
   *             color: "#00FF00"
   *     responses:
   *       200:
   *         description: Category updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CategoryDto'
   *       400:
   *         description: Validation error or circular reference
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - category does not belong to you
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Category not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Category name already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    '/:id',
    authMiddleware,
    validate({ body: updateCategorySchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  /**
   * @openapi
   * /categories/{id}:
   *   delete:
   *     tags:
   *       - Categories
   *     summary: Delete category
   *     description: Deletes a category (must belong to authenticated user). Sets expenses.categoryId to null if they exist.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Category deleted successfully
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - category does not belong to you
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Category not found
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
