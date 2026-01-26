# File Reference Guide

Complete reference of every file in the project and its responsibility.

## Root Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `tsconfig.test.json` | TypeScript config for tests |
| `vitest.config.ts` | Vitest test runner configuration |
| `docker-compose.yml` | Docker services (PostgreSQL) |
| `.env.example` | Environment variables template |
| `.eslintrc.cjs` | ESLint linting rules |
| `.prettierrc` | Prettier formatting rules |
| `.editorconfig` | Editor settings (indentation, etc.) |
| `.gitignore` | Git ignore patterns |
| `README.md` | Project overview and setup guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CLAUDE.md` | AI assistant instructions |

---

## Source Files (`src/`)

### Domain Layer (`src/domain/`)

#### `src/domain/entities/user.entity.ts`
**Purpose:** Defines the User business entity and related data types.

```typescript
// Exports:
interface User           // Core user entity
interface CreateUserData // Data needed to create a user
interface UpdateUserData // Data for updating a user
```

**When to modify:** When user properties change or new user-related types are needed.

---

#### `src/domain/repositories/user.repository.ts`
**Purpose:** Defines the contract for user data access. This is an **interface**, not an implementation.

```typescript
// Exports:
interface FindAllOptions  // Pagination options
interface UserRepository  // Repository contract with all data operations
```

**Key methods:**
- `findById(id)` - Get user by ID
- `findByEmail(email)` - Get user by email
- `findAll(options)` - List users with pagination
- `count()` - Total user count
- `create(data)` - Create new user
- `update(id, data)` - Update existing user
- `delete(id)` - Remove user
- `existsById(id)` - Check if user exists
- `existsByEmail(email)` - Check if email is taken

**When to modify:** When new data operations are needed (e.g., `findByStatus`).

---

#### `src/domain/errors/user.errors.ts`
**Purpose:** Domain-specific error classes for user operations.

```typescript
// Exports:
class UserNotFoundError         // Thrown when user doesn't exist
class UserEmailAlreadyExistsError // Thrown when email is taken
```

**When to modify:** When new user-related error conditions arise.

---

### Application Layer (`src/application/`)

#### `src/application/dto/user.dto.ts`
**Purpose:** Data Transfer Objects with Zod validation schemas.

```typescript
// Exports:
const createUserSchema   // Zod schema for creating users
const updateUserSchema   // Zod schema for updating users
const userIdParamSchema  // Zod schema for user ID parameter

type CreateUserDto       // TypeScript type inferred from schema
type UpdateUserDto       // TypeScript type inferred from schema
type UserIdParam         // TypeScript type inferred from schema

interface UserResponseDto // Shape of user in API responses
```

**When to modify:** When API input/output shapes change.

---

#### `src/application/use-cases/user/create-user.use-case.ts`
**Purpose:** Business logic for creating a new user.

**Flow:**
1. Check if email already exists
2. If exists, throw `UserEmailAlreadyExistsError`
3. Create user via repository
4. Return created user

**Dependencies:** `UserRepository` (injected)

---

#### `src/application/use-cases/user/get-user-by-id.use-case.ts`
**Purpose:** Business logic for fetching a user by ID.

**Flow:**
1. Fetch user from repository
2. If not found, throw `UserNotFoundError`
3. Return user

**Dependencies:** `UserRepository` (injected)

---

#### `src/application/use-cases/user/list-users.use-case.ts`
**Purpose:** Business logic for listing users with pagination.

**Flow:**
1. Calculate pagination offset
2. Fetch users and total count (parallel)
3. Return users with pagination metadata

**Dependencies:** `UserRepository` (injected)

---

#### `src/application/use-cases/user/update-user.use-case.ts`
**Purpose:** Business logic for updating a user.

**Flow:**
1. Check if user exists
2. If email changing, check new email isn't taken
3. Update user via repository
4. Return updated user

**Dependencies:** `UserRepository` (injected)

---

#### `src/application/use-cases/user/delete-user.use-case.ts`
**Purpose:** Business logic for deleting a user.

**Flow:**
1. Check if user exists
2. Delete via repository

**Dependencies:** `UserRepository` (injected)

---

### Infrastructure Layer (`src/infrastructure/`)

#### `src/infrastructure/db/prisma.client.ts`
**Purpose:** Prisma client singleton with connection management.

```typescript
// Exports:
const prisma              // Prisma client instance (singleton)
function connectDatabase()    // Connect to database
function disconnectDatabase() // Disconnect from database
```

**Features:**
- Singleton pattern (reuses client in development)
- Query logging in development mode
- Connection/disconnection helpers for graceful shutdown

**When to modify:** When changing database connection settings or adding Prisma middleware.

---

#### `src/infrastructure/repositories/user.mapper.ts`
**Purpose:** Converts between Prisma models and domain entities.

```typescript
// Exports:
class UserMapper {
  static toDomain(prismaUser)     // Prisma → Domain
  static toDomainList(prismaUsers) // Array conversion
}
```

**Why needed:** Prisma models may have different shapes than domain entities. Mappers ensure clean separation.

**When to modify:** When User entity or Prisma model changes.

---

#### `src/infrastructure/repositories/prisma-user.repository.ts`
**Purpose:** Implements `UserRepository` interface using Prisma.

**Implements:** All methods from `UserRepository` interface

**Features:**
- Uses mapper for all conversions
- Transaction example in `create` method
- Conditional spread for optional parameters

**When to modify:** When `UserRepository` interface changes or query optimizations needed.

---

### Interfaces Layer (`src/interfaces/http/`)

#### `src/interfaces/http/controllers/user.controller.ts`
**Purpose:** Handles HTTP requests for user operations.

**Methods:**
- `create(req, res)` - POST /api/users
- `getById(req, res)` - GET /api/users/:id
- `list(req, res)` - GET /api/users
- `update(req, res)` - PATCH /api/users/:id
- `delete(req, res)` - DELETE /api/users/:id

**Responsibilities:**
- Extract data from request
- Call appropriate use case
- Format and send response

**When to modify:** When adding new endpoints or changing response format.

---

#### `src/interfaces/http/controllers/health.controller.ts`
**Purpose:** Health check endpoint for monitoring.

**Returns:**
- Server status (healthy/unhealthy)
- Database connection status
- Server uptime
- Timestamp

**When to modify:** When adding more health checks (Redis, external services).

---

#### `src/interfaces/http/routes/user.routes.ts`
**Purpose:** Defines user API routes and applies middleware.

**Routes:**
```
POST   /         → create
GET    /         → list (with pagination validation)
GET    /:id      → getById (with UUID validation)
PATCH  /:id      → update (with UUID + body validation)
DELETE /:id      → delete (with UUID validation)
```

**When to modify:** When adding new user endpoints or changing validation.

---

#### `src/interfaces/http/routes/health.routes.ts`
**Purpose:** Defines health check route.

**Routes:**
```
GET / → health check
```

---

#### `src/interfaces/http/routes/router.ts`
**Purpose:** Main router that combines all feature routes.

```typescript
// Mounts:
/health → health routes
/users  → user routes
```

**When to modify:** When adding new feature modules.

---

#### `src/interfaces/http/middlewares/error-handler.middleware.ts`
**Purpose:** Global error handler that catches all errors.

**Behavior:**
- `AppError` subclasses → formatted error response with appropriate status
- Unknown errors → 500 Internal Server Error
- Logs non-operational errors

**When to modify:** When changing error response format or adding error tracking.

---

#### `src/interfaces/http/middlewares/validate.middleware.ts`
**Purpose:** Request validation using Zod schemas.

**Usage:**
```typescript
validate({
  body: createUserSchema,
  params: userIdParamSchema,
  query: paginationSchema,
})
```

**Behavior:**
- Validates specified request parts
- Replaces request data with parsed/coerced values
- Throws `ValidationError` with field-level details

**When to modify:** When changing validation behavior.

---

#### `src/interfaces/http/middlewares/request-logger.middleware.ts`
**Purpose:** Logs all incoming requests with timing.

**Logs:**
- Method, URL, status code
- Response duration
- User agent
- Different log levels based on status (error, warn, info)

**When to modify:** When changing what gets logged.

---

#### `src/interfaces/http/middlewares/not-found.middleware.ts`
**Purpose:** Handles requests to undefined routes.

**Behavior:** Throws `NotFoundError` with route details.

---

#### `src/interfaces/http/middlewares/async-handler.ts`
**Purpose:** Wraps async route handlers to catch promise rejections.

**Why needed:** Express doesn't handle async errors by default. This ensures errors are passed to error handler.

---

### Shared Layer (`src/shared/`)

#### `src/shared/config/env.config.ts`
**Purpose:** Environment configuration with Zod validation.

```typescript
// Exports:
const env          // Validated environment variables
const isDevelopment // true if NODE_ENV === 'development'
const isProduction  // true if NODE_ENV === 'production'
const isTest        // true if NODE_ENV === 'test'
```

**Validated variables:**
- `NODE_ENV` - development/production/test
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `DATABASE_URL` - PostgreSQL connection string
- `LOG_LEVEL` - Pino log level
- `DEFAULT_PAGE_SIZE` - Pagination default
- `MAX_PAGE_SIZE` - Pagination maximum

**When to modify:** When adding new environment variables.

---

#### `src/shared/logger/logger.ts`
**Purpose:** Pino logger configuration.

```typescript
// Exports:
const logger // Pino logger instance
type Logger  // Logger type for dependency injection
```

**Features:**
- Pretty printing in development
- JSON output in production
- Configurable log level

**When to modify:** When changing log format or adding log transports.

---

#### `src/shared/errors/app-error.ts`
**Purpose:** Base error classes for the application.

```typescript
// Exports:
type ErrorCode        // Union of error codes
interface ErrorDetails // Validation error details
interface ErrorResponse // API error response shape
class AppError         // Base error class

// Specific errors:
class ValidationError  // 400 - Invalid input
class BadRequestError  // 400 - Bad request
class UnauthorizedError // 401 - Not authenticated
class ForbiddenError   // 403 - Not authorized
class NotFoundError    // 404 - Resource not found
class ConflictError    // 409 - Resource conflict
class InternalError    // 500 - Server error
```

**When to modify:** When adding new error types.

---

#### `src/shared/utils/response.ts`
**Purpose:** Standardized API response helpers.

```typescript
// Exports:
interface SuccessResponse<T> // Success response shape
interface ErrorResponse      // Error response shape
interface ResponseMeta       // Pagination metadata
interface PaginatedData<T>   // Paginated response data

function sendSuccess(res, data, statusCode?, meta?)
function sendPaginated(res, data, statusCode?)
function sendCreated(res, data)
function sendNoContent(res)
```

**When to modify:** When changing API response format.

---

#### `src/shared/utils/pagination.ts`
**Purpose:** Pagination utilities.

```typescript
// Exports:
const paginationSchema // Zod schema for page/pageSize params

type PaginationParams  // { page: number, pageSize: number }
interface PaginationMeta // { page, pageSize, totalCount, totalPages }

function calculatePagination(params) // Returns { skip, take }
function createPaginationMeta(page, pageSize, totalCount)
```

**When to modify:** When changing pagination behavior.

---

### Main Layer (`src/main/`)

#### `src/main/server.ts`
**Purpose:** Application entry point.

**Responsibilities:**
- Connect to database
- Create Express app
- Start HTTP server
- Handle graceful shutdown (SIGTERM, SIGINT)
- Handle uncaught exceptions

**When to modify:** When changing startup/shutdown behavior.

---

#### `src/main/app.ts`
**Purpose:** Express application configuration.

**Configures:**
- JSON body parser
- URL-encoded body parser
- Request logging middleware
- API routes under `/api`
- 404 handler
- Global error handler

**When to modify:** When adding global middleware (CORS, rate limiting, etc.).

---

#### `src/main/container.ts`
**Purpose:** Dependency injection container.

**Wires:**
1. Repositories (with Prisma client)
2. Use cases (with repositories)
3. Controllers (with use cases)

```typescript
// Exports:
const controllers  // All controllers for router
const repositories // All repositories (for testing)
const useCases     // All use cases (for testing)
```

**When to modify:** When adding new features or dependencies.

---

## Prisma Files (`prisma/`)

#### `prisma/schema.prisma`
**Purpose:** Database schema definition.

**Contains:**
- Database connection config
- Model definitions
- Relations
- Indexes

**When to modify:** When changing database structure.

---

#### `prisma/seed.ts`
**Purpose:** Database seeding script.

**Run with:** `npm run prisma:seed`

**When to modify:** When changing seed data.

---

## Test Files (`tests/`)

#### `tests/setup.ts`
**Purpose:** Vitest global setup.

**Configures:** Test environment variables.

---

#### `tests/unit/use-cases/create-user.use-case.test.ts`
**Purpose:** Unit tests for CreateUserUseCase.

**Tests:**
- Successful user creation
- Email already exists error
- Error message contains email

---

#### `tests/integration/routes/user.routes.test.ts`
**Purpose:** Integration tests for user API endpoints.

**Tests:**
- POST /api/users - create user
- GET /api/users/:id - get user
- GET /api/users - list users
- PATCH /api/users/:id - update user
- DELETE /api/users/:id - delete user
- Validation errors
- Not found errors
