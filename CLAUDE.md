# CLAUDE.md - Project Guide for AI Assistants

This document describes the architecture, patterns, and conventions used in this project. Follow these guidelines strictly when making changes or adding features.

> **For Users:** See [docs/PROMPTING-GUIDE.md](docs/PROMPTING-GUIDE.md) for how to write effective prompts when requesting new features.

## Project Overview

This is a **Node.js + Express + Prisma** backend following **Clean Architecture** principles. The codebase enforces strict separation of concerns across layers.

## Architecture Layers (Dependency Rule)

Dependencies MUST flow inward only: `Interfaces → Application → Domain ← Infrastructure`

```
┌─────────────────────────────────────────────────────────────┐
│  INTERFACES (src/interfaces/)                               │
│  Express controllers, routes, middlewares                   │
│  Depends on: Application layer                              │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION (src/application/)                             │
│  Use cases, DTOs, business orchestration                    │
│  Depends on: Domain layer ONLY                              │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN (src/domain/)                                       │
│  Entities, repository interfaces, domain errors             │
│  Depends on: NOTHING (pure TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE (src/infrastructure/)                       │
│  Prisma repositories, external services                     │
│  Implements: Domain interfaces                              │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── domain/                    # PURE BUSINESS LOGIC - NO EXTERNAL DEPS
│   ├── entities/             # Business entities (interfaces, no classes)
│   ├── repositories/         # Repository INTERFACES (contracts)
│   └── errors/               # Domain-specific error classes
│
├── application/              # BUSINESS ORCHESTRATION
│   ├── use-cases/           # One class per use case, single responsibility
│   │   └── {feature}/       # Grouped by feature (user/, post/, etc.)
│   └── dto/                 # Zod schemas + TypeScript types
│
├── infrastructure/           # EXTERNAL IMPLEMENTATIONS
│   ├── db/                  # Database client (Prisma singleton)
│   └── repositories/        # Prisma repository implementations + mappers
│
├── interfaces/               # HTTP LAYER
│   └── http/
│       ├── controllers/     # Thin controllers - delegate to use cases
│       ├── routes/          # Route definitions with validation
│       └── middlewares/     # Express middlewares
│
├── shared/                   # CROSS-CUTTING CONCERNS
│   ├── config/              # Environment config with Zod validation
│   ├── errors/              # Base AppError classes
│   ├── logger/              # Pino logger setup
│   └── utils/               # Utilities (pagination, response helpers)
│
└── main/                     # BOOTSTRAP & WIRING
    ├── server.ts            # Entry point, graceful shutdown
    ├── app.ts               # Express app configuration
    └── container.ts         # Manual dependency injection
```

## Critical Rules - DO NOT VIOLATE

### 1. Domain Layer Rules
```typescript
// ❌ NEVER import these in domain/
import { PrismaClient } from '@prisma/client';  // NO
import express from 'express';                   // NO
import { prisma } from '../infrastructure/...'; // NO

// ✅ Domain must be pure TypeScript
export interface User {
  id: string;
  email: string;
  name: string;
}
```

### 2. Application Layer Rules
```typescript
// ❌ NEVER import infrastructure or interfaces
import { prisma } from '../infrastructure/db/prisma.client.js';  // NO
import { Request, Response } from 'express';                      // NO

// ✅ Only import from domain
import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
```

### 3. Use Case Rules
```typescript
// ✅ One use case = one public method (execute)
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    // Business logic here
  }
}

// ❌ NEVER have multiple public methods
export class UserUseCase {
  createUser() {}   // NO - split into separate use cases
  deleteUser() {}   // NO
  updateUser() {}   // NO
}
```

### 4. Controller Rules
```typescript
// ✅ Controllers are THIN - only handle HTTP concerns
export class UserController {
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateUserDto;
    const user = await this.createUserUseCase.execute(body);  // Delegate
    sendCreated(res, toUserResponse(user));                    // Respond
  }
}

// ❌ NEVER put business logic in controllers
async create(req: Request, res: Response): Promise<void> {
  const exists = await this.repo.findByEmail(req.body.email);  // NO
  if (exists) throw new Error('exists');                        // NO
  const user = await this.repo.create(req.body);               // NO
}
```

### 5. Repository Rules
```typescript
// ✅ Domain defines the INTERFACE
// src/domain/repositories/user.repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

// ✅ Infrastructure IMPLEMENTS the interface
// src/infrastructure/repositories/prisma-user.repository.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }
}
```

### 6. Dependency Injection Rules
```typescript
// ✅ Wire dependencies in container.ts
// src/main/container.ts
const userRepository = new PrismaUserRepository(prisma);
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase, ...);

// ❌ NEVER instantiate dependencies inside classes
export class CreateUserUseCase {
  private repo = new PrismaUserRepository(prisma);  // NO!
}
```

## Adding a New Feature (e.g., "posts")

### Step 1: Domain Layer
```typescript
// src/domain/entities/post.entity.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
}

// src/domain/repositories/post.repository.ts
export interface PostRepository {
  findById(id: string): Promise<Post | null>;
  findAll(options?: FindAllOptions): Promise<Post[]>;
  create(data: CreatePostData): Promise<Post>;
  delete(id: string): Promise<void>;
}

// src/domain/errors/post.errors.ts
export class PostNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Post not found: ${id}`);
  }
}
```

### Step 2: Application Layer
```typescript
// src/application/dto/post.dto.ts
export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  authorId: z.string().uuid(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;

// src/application/use-cases/post/create-post.use-case.ts
export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(data: CreatePostDto): Promise<Post> {
    return this.postRepository.create(data);
  }
}
```

### Step 3: Infrastructure Layer
```typescript
// Update prisma/schema.prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  authorId  String   @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])
  @@map("posts")
}

// src/infrastructure/repositories/post.mapper.ts
export class PostMapper {
  static toDomain(prismaPost: PrismaPost): Post {
    return {
      id: prismaPost.id,
      title: prismaPost.title,
      content: prismaPost.content,
      authorId: prismaPost.authorId,
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
    };
  }
}

// src/infrastructure/repositories/prisma-post.repository.ts
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaClient) {}
  // Implement all methods...
}
```

### Step 4: Interface Layer
```typescript
// src/interfaces/http/controllers/post.controller.ts
export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    // ... other use cases
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const body = req.body as CreatePostDto;
    const post = await this.createPostUseCase.execute(body);
    sendCreated(res, toPostResponse(post));
  }
}

// src/interfaces/http/routes/post.routes.ts
export function createPostRoutes(controller: PostController): Router {
  const router = Router();

  router.post(
    '/',
    validate({ body: createPostSchema }),
    asyncHandler(async (req, res) => {
      await controller.create(req, res);
    })
  );

  return router;
}
```

### Step 5: Wire Everything
```typescript
// src/main/container.ts
const postRepository = new PrismaPostRepository(prisma);
const createPostUseCase = new CreatePostUseCase(postRepository);
const postController = new PostController(createPostUseCase);

export const controllers: Controllers = {
  healthController,
  userController,
  postController,  // Add here
};

// src/interfaces/http/routes/router.ts
router.use('/posts', createPostRoutes(controllers.postController));
```

### Step 6: Run Migration
```bash
npm run prisma:migrate:dev -- --name add_posts
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Repository Interface | `{name}.repository.ts` | `user.repository.ts` |
| Repository Impl | `prisma-{name}.repository.ts` | `prisma-user.repository.ts` |
| Use Case | `{verb}-{name}.use-case.ts` | `create-user.use-case.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| Routes | `{name}.routes.ts` | `user.routes.ts` |
| DTO | `{name}.dto.ts` | `user.dto.ts` |
| Errors | `{name}.errors.ts` | `user.errors.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |

## Code Style

### Imports Order
```typescript
// 1. Node built-ins
import { readFile } from 'fs/promises';

// 2. External packages
import { Router } from 'express';
import { z } from 'zod';

// 3. Internal imports (with .js extension for ESM)
import type { User } from '../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../domain/errors/user.errors.js';
```

### Error Handling
```typescript
// ✅ Use typed domain errors
throw new UserNotFoundError(id);
throw new UserEmailAlreadyExistsError(email);

// ❌ Don't use generic errors
throw new Error('User not found');
throw new Error('Email exists');
```

### Response Format
```typescript
// ✅ Use response utilities
sendSuccess(res, data);
sendCreated(res, data);
sendPaginated(res, { items, meta });
sendNoContent(res);

// ❌ Don't use raw res.json
res.json({ user });
res.status(201).json(data);
```

## Testing Patterns

### Unit Tests (Use Cases)
```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: UserRepository;

  beforeEach(() => {
    mockRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      // ... mock all methods
    };
    useCase = new CreateUserUseCase(mockRepo);
  });

  it('should create user when email is unique', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.create).mockResolvedValue(mockUser);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockUser);
  });
});
```

### Integration Tests (Routes)
```typescript
describe('POST /api/users', () => {
  it('should return 201 for valid input', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## Common Mistakes to Avoid

1. **Importing Prisma in domain** - Domain must be framework-agnostic
2. **Business logic in controllers** - Controllers only handle HTTP
3. **Multiple methods in use cases** - One use case = one operation
4. **Direct instantiation** - Always inject dependencies
5. **Raw Express responses** - Use response utilities
6. **Generic Error throws** - Use typed domain errors
7. **Missing `.js` extensions** - Required for ESM imports
8. **Forgetting mappers** - Always map Prisma models to domain entities
9. **Skipping validation** - All inputs must be validated with Zod
10. **God controllers** - Split into feature-specific controllers

## Quick Reference

### Available Base Errors
- `ValidationError` - 400
- `BadRequestError` - 400
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `InternalError` - 500

### Response Utilities
- `sendSuccess(res, data, statusCode?, meta?)`
- `sendCreated(res, data)`
- `sendPaginated(res, { items, meta })`
- `sendNoContent(res)`

### Pagination
```typescript
import { paginationSchema, calculatePagination, createPaginationMeta } from '@shared/utils/pagination.js';

const { skip, take } = calculatePagination({ page: 1, pageSize: 20 });
const meta = createPaginationMeta(page, pageSize, totalCount);
```
