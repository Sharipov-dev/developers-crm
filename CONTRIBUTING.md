# Contributing Guide

Thank you for considering contributing to this project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment: `cp .env.example .env`
4. Start PostgreSQL: `docker compose up -d postgres`
5. Run migrations: `npm run prisma:migrate:dev`
6. Start dev server: `npm run dev`

## Code Style

### General Guidelines

- Use TypeScript for all source files
- Follow the existing folder structure and naming conventions
- Keep functions small and focused
- Prefer explicit imports over barrel exports
- Write meaningful commit messages

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `create-user.use-case.ts` |
| Classes | PascalCase | `CreateUserUseCase` |
| Interfaces | PascalCase | `UserRepository` |
| Functions | camelCase | `createUser` |
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Types | PascalCase | `CreateUserDto` |

### File Organization

```typescript
// 1. Imports (external first, then internal)
import { Router } from 'express';

import { CreateUserUseCase } from '../application/use-cases/user/create-user.use-case.js';

// 2. Types/Interfaces

// 3. Constants

// 4. Main export
```

### TypeScript

- Enable strict mode
- Avoid `any` type
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Prefer `readonly` when applicable

```typescript
// Good
interface User {
  readonly id: string;
  email: string;
  name: string;
}

// Avoid
const user: any = { ... };
```

### Error Handling

- Use custom error classes extending `AppError`
- Let errors bubble up to the global error handler
- Don't catch errors unless you're handling them specifically

```typescript
// Good
if (!user) {
  throw new UserNotFoundError(id);
}

// Avoid
try {
  const user = await repository.findById(id);
  if (!user) throw new Error('Not found');
} catch (e) {
  console.log(e);
  return null;
}
```

### Async/Await

- Always use async/await over raw promises
- Use `Promise.all` for parallel operations
- Handle promise rejections appropriately

```typescript
// Good
const [users, count] = await Promise.all([
  repository.findAll(),
  repository.count(),
]);

// Avoid
repository.findAll().then(users => { ... });
```

## Architecture Rules

### Domain Layer
- NO imports from other layers
- NO framework dependencies (Express, Prisma)
- Pure TypeScript interfaces and classes

### Application Layer
- Imports from Domain only
- Contains business logic orchestration
- Use cases are single-responsibility

### Infrastructure Layer
- Implements Domain interfaces
- Contains Prisma-specific code
- Handles data mapping

### Interface Layer
- Handles HTTP concerns
- Transforms requests/responses
- No business logic

## Testing

### Unit Tests

- Test use cases in isolation
- Mock repository dependencies
- Focus on business logic

```typescript
describe('CreateUserUseCase', () => {
  it('should create a user when email is unique', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(mockUser);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockUser);
  });
});
```

### Integration Tests

- Test routes end-to-end
- Use supertest for HTTP assertions
- Mock at the repository level

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

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Unit only
npm run test:unit

# Integration only
npm run test:integration
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Test additions/changes

Example: `feature/add-post-module`

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Examples:
```
feat(users): add user update endpoint
fix(validation): handle empty string in email field
refactor(container): simplify dependency wiring
docs(readme): add deployment instructions
test(users): add integration tests for delete endpoint
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure types are correct: `npm run typecheck`
6. Submit a pull request

## Adding Dependencies

- Prefer well-maintained packages with good TypeScript support
- Check bundle size impact
- Update this documentation if adding significant dependencies

## Questions?

Open an issue for questions or suggestions.
