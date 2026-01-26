# Architecture Guide

This document explains the architectural decisions and patterns used in this project.

## Overview

This project implements **Clean Architecture** (also known as Hexagonal Architecture or Ports & Adapters). The core principle is **separation of concerns** through layers with strict dependency rules.

## Why Clean Architecture?

| Benefit | Description |
|---------|-------------|
| **Testability** | Business logic can be tested without databases, HTTP, or external services |
| **Flexibility** | Swap PostgreSQL for MongoDB, Express for Fastify - without touching business logic |
| **Maintainability** | Clear boundaries make it easy to understand and modify code |
| **Independence** | Domain logic doesn't depend on frameworks or libraries |

## The Dependency Rule

**Dependencies must point inward.** Outer layers can depend on inner layers, but inner layers must never know about outer layers.

```
        ┌──────────────────────────────────────┐
        │           INTERFACES                 │  ← Knows about Application
        │    (Controllers, Routes, HTTP)       │
        ├──────────────────────────────────────┤
        │           APPLICATION                │  ← Knows about Domain
        │      (Use Cases, DTOs)               │
        ├──────────────────────────────────────┤
        │             DOMAIN                   │  ← Knows about NOTHING
        │   (Entities, Repository Interfaces)  │
        ├──────────────────────────────────────┤
        │          INFRASTRUCTURE              │  ← Implements Domain interfaces
        │    (Prisma, External Services)       │
        └──────────────────────────────────────┘
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)

The **heart** of your application. Contains pure business logic with zero external dependencies.

**Contains:**
- **Entities** - Core business objects (User, Post, Order)
- **Repository Interfaces** - Contracts for data access (not implementations)
- **Domain Errors** - Business-specific error types

**Rules:**
- NO imports from other layers
- NO framework code (Express, Prisma, etc.)
- Pure TypeScript interfaces and classes
- Should be portable to any JavaScript runtime

```typescript
// ✅ Valid domain code
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

// ❌ Invalid - imports external library
import { PrismaClient } from '@prisma/client';
```

### Application Layer (`src/application/`)

**Orchestrates** business operations. Contains use cases that coordinate domain objects.

**Contains:**
- **Use Cases** - Single-purpose business operations
- **DTOs** - Data Transfer Objects with validation schemas

**Rules:**
- Can ONLY import from Domain layer
- One use case class = one business operation
- Use cases receive dependencies via constructor (DI)

```typescript
// ✅ Valid application code
import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new UserEmailAlreadyExistsError(data.email);
    }
    return this.userRepository.create(data);
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

**Implements** interfaces defined in the domain layer. Handles all external concerns.

**Contains:**
- **Database Client** - Prisma client singleton
- **Repository Implementations** - Prisma-based data access
- **Mappers** - Convert between Prisma models and domain entities
- **External Services** - Email, payment, storage integrations

**Rules:**
- Implements domain interfaces
- Contains all Prisma-specific code
- Handles data mapping

```typescript
// ✅ Valid infrastructure code
import type { PrismaClient } from '@prisma/client';
import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }
}
```

### Interfaces Layer (`src/interfaces/`)

**Handles external communication.** In this project, it's the HTTP/REST interface.

**Contains:**
- **Controllers** - Handle HTTP requests, delegate to use cases
- **Routes** - Define endpoints and wire middleware
- **Middlewares** - Request processing (validation, auth, logging)

**Rules:**
- Controllers are thin - no business logic
- Only transforms HTTP ↔ Application layer
- Handles HTTP-specific concerns (status codes, headers)

```typescript
// ✅ Valid interface code
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const body = req.body as CreateUserDto;
    const user = await this.createUserUseCase.execute(body);
    sendCreated(res, toUserResponse(user));
  }
}
```

### Shared Layer (`src/shared/`)

**Cross-cutting concerns** used by multiple layers.

**Contains:**
- **Config** - Environment configuration
- **Logger** - Logging setup
- **Errors** - Base error classes
- **Utils** - Pagination, response helpers

### Main Layer (`src/main/`)

**Application bootstrap and wiring.**

**Contains:**
- **server.ts** - Entry point, starts HTTP server
- **app.ts** - Express configuration
- **container.ts** - Dependency injection wiring

## Data Flow

### Request Flow (Create User)

```
1. HTTP Request
   POST /api/users { email, name }
        │
        ▼
2. Router (user.routes.ts)
   - Applies validation middleware
   - Routes to controller
        │
        ▼
3. Validation Middleware (validate.middleware.ts)
   - Validates request body with Zod schema
   - Returns 400 if invalid
        │
        ▼
4. Controller (user.controller.ts)
   - Extracts validated data from request
   - Calls use case
        │
        ▼
5. Use Case (create-user.use-case.ts)
   - Executes business logic
   - Calls repository interface
        │
        ▼
6. Repository (prisma-user.repository.ts)
   - Implements interface with Prisma
   - Persists to database
        │
        ▼
7. Mapper (user.mapper.ts)
   - Converts Prisma model to domain entity
        │
        ▼
8. Response
   - Controller formats response
   - Returns 201 with user data
```

## Dependency Injection

We use **manual dependency injection** via a container module. This keeps things simple without requiring a DI framework.

```typescript
// src/main/container.ts

// 1. Create infrastructure (lowest level)
const userRepository = new PrismaUserRepository(prisma);

// 2. Create use cases (inject repositories)
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

// 3. Create controllers (inject use cases)
const userController = new UserController(
  createUserUseCase,
  getUserByIdUseCase,
  // ...
);

// 4. Export for router
export const controllers = { userController, healthController };
```

## Error Handling

### Error Hierarchy

```
AppError (base)
├── ValidationError (400)
├── BadRequestError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
│   └── UserNotFoundError
│   └── PostNotFoundError
├── ConflictError (409)
│   └── UserEmailAlreadyExistsError
└── InternalError (500)
```

### Error Flow

1. **Domain/Application** throws typed error
2. **Error bubbles up** through layers
3. **Global error handler** catches and formats response
4. **Client receives** standardized error response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found: abc-123"
  }
}
```

## Testing Strategy

| Layer | Test Type | What to Test |
|-------|-----------|--------------|
| Domain | Unit | Entity validation, domain logic |
| Application | Unit | Use case logic with mocked repos |
| Infrastructure | Integration | Repository with test database |
| Interfaces | Integration | Full HTTP request/response cycle |

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
