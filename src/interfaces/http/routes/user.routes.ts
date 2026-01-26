import { Router } from 'express';

import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../../../application/dto/user.dto.js';
import { paginationSchema } from '../../../shared/utils/pagination.js';
import type { UserController } from '../controllers/user.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validate } from '../middlewares/validate.middleware.js';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.post(
    '/',
    validate({ body: createUserSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  router.get(
    '/',
    validate({ query: paginationSchema }),
    asyncHandler(async (req, res) => {
      await controller.list(req, res);
    })
  );

  router.get(
    '/:id',
    validate({ params: userIdParamSchema }),
    asyncHandler(async (req, res) => {
      await controller.getById(req, res);
    })
  );

  router.patch(
    '/:id',
    validate({ params: userIdParamSchema, body: updateUserSchema }),
    asyncHandler(async (req, res) => {
      await controller.update(req, res);
    })
  );

  router.delete(
    '/:id',
    validate({ params: userIdParamSchema }),
    asyncHandler(async (req, res) => {
      await controller.delete(req, res);
    })
  );

  return router;
}
