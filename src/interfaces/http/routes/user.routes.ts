import type { RequestHandler, Router } from 'express';
import { Router as createRouter } from 'express';

import {
  loginUserSchema,
  registerUserSchema,
  updateProfileSchema,
} from '../../../application/dto/user.dto.js';
import type { UserController } from '../controllers/user.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createUserRoutes(controller: UserController, authMiddleware: RequestHandler): Router {
  const router = createRouter();

  /**
   * @openapi
   * /users/register:
   *   post:
   *     tags:
   *       - Users
   *     summary: Register a new user
   *     description: Creates a new user account with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 maxLength: 255
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: password123
   *               displayName:
   *                 type: string
   *                 maxLength: 80
   *                 example: John Doe
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/register',
    validate({ body: registerUserSchema }),
    asyncHandler(async (req, res) => {
      await controller.register(req, res);
    })
  );

  /**
   * @openapi
   * /users/login:
   *   post:
   *     tags:
   *       - Users
   *     summary: Login user
   *     description: Authenticates user and returns JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid credentials or account disabled
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/login',
    validate({ body: loginUserSchema }),
    asyncHandler(async (req, res) => {
      await controller.login(req, res);
    })
  );

  /**
   * @openapi
   * /users/me:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get current user profile
   *     description: Returns the authenticated user's profile
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: User profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/me',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.getProfile(req, res);
    })
  );

  /**
   * @openapi
   * /users/me:
   *   patch:
   *     tags:
   *       - Users
   *     summary: Update user profile
   *     description: Updates the authenticated user's display name
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               displayName:
   *                 type: string
   *                 maxLength: 80
   *                 example: Jane Doe
   *     responses:
   *       200:
   *         description: Profile updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    '/me',
    authMiddleware,
    validate({ body: updateProfileSchema }),
    asyncHandler(async (req, res) => {
      await controller.updateProfile(req, res);
    })
  );

  /**
   * @openapi
   * /users/me/disable:
   *   post:
   *     tags:
   *       - Users
   *     summary: Disable user account
   *     description: Disables the authenticated user's account
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Account disabled
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/me/disable',
    authMiddleware,
    asyncHandler(async (req, res) => {
      await controller.disableAccount(req, res);
    })
  );

  return router;
}
