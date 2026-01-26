# Node.js + Express + Prisma Clean Architecture Starter

A production-ready Node.js starter template implementing Clean Architecture with Express and Prisma ORM.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | Detailed explanation of Clean Architecture patterns |
| [File Reference](docs/FILE-REFERENCE.md) | Complete reference of every file and its purpose |
| [Setup Guide](docs/SETUP.md) | Detailed setup instructions for all environments |
| [Docker Guide](docs/DOCKER.md) | Docker setup, commands, and production deployment |
| [Prompting Guide](docs/PROMPTING-GUIDE.md) | How to write prompts for AI assistants to add features |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Solutions to common problems |
| [Contributing](CONTRIBUTING.md) | Code style and contribution guidelines |
| [AI Instructions](CLAUDE.md) | Guidelines for AI assistants working on this codebase |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| TypeScript | Type safety |
| Express | HTTP framework |
| Prisma | ORM |
| PostgreSQL | Database (default) |
| Zod | Validation |
| Pino | Logging |
| Vitest | Testing |
| ESLint + Prettier | Code quality |

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Install dependencies
npm install

# 4. Run migrations
npm run prisma:migrate:dev

# 5. Start development server
npm run dev
```

Server runs at `http://localhost:3000`

For detailed setup instructions, see [Setup Guide](docs/SETUP.md).

## Architecture Overview

This project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────────────┐
│  INTERFACES - Controllers, Routes, Middlewares (HTTP)       │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION - Use Cases, DTOs (Business orchestration)     │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN - Entities, Repository Interfaces (Pure business)   │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE - Prisma Repositories (Implementations)     │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Dependencies point inward. Domain has zero external dependencies.

For detailed architecture explanation, see [Architecture Guide](docs/ARCHITECTURE.md).

## Project Structure

```
src/
├── domain/           # Pure business logic (no external deps)
│   ├── entities/     # Business entities
│   ├── repositories/ # Repository interfaces
│   └── errors/       # Domain errors
├── application/      # Business orchestration
│   ├── use-cases/    # Single-purpose operations
│   └── dto/          # Validation schemas
├── infrastructure/   # External implementations
│   ├── db/           # Prisma client
│   └── repositories/ # Prisma implementations
├── interfaces/http/  # HTTP layer
│   ├── controllers/  # Request handlers
│   ├── routes/       # Route definitions
│   └── middlewares/  # Express middlewares
├── shared/           # Cross-cutting concerns
└── main/             # Bootstrap & DI container
```

For file-by-file documentation, see [File Reference](docs/FILE-REFERENCE.md).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |
| `npm test` | Run all tests |
| `npm run lint` | Check linting |
| `npm run typecheck` | TypeScript checking |
| `npm run prisma:migrate:dev` | Run migrations |
| `npm run prisma:studio` | Open Prisma GUI |

## API Documentation

Interactive API documentation is available via Swagger UI:

- **Swagger UI:** http://localhost:3000/docs
- **OpenAPI JSON:** http://localhost:3000/docs.json

Start the dev server (`npm run dev`) and open the Swagger UI to explore and test all endpoints.

## API Endpoints

```
GET    /api/health              # Health check
POST   /api/users/register      # Register new user
POST   /api/users/login         # Login (returns JWT)
GET    /api/users/me            # Get current user (auth required)
PATCH  /api/users/me            # Update profile (auth required)
POST   /api/users/me/disable    # Disable account (auth required)
```

### Example: Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123", "displayName": "John Doe"}'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'

# Get profile (use token from login response)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Response Format

```json
{
  "success": true,
  "data": { "id": "...", "email": "...", "displayName": "..." }
}
```

## Adding a New Feature

1. **Domain** - Create entity, repository interface, errors
2. **Application** - Create DTOs, use cases
3. **Infrastructure** - Add Prisma model, implement repository
4. **Interface** - Create controller, routes
5. **Main** - Wire dependencies in container
6. **Migrate** - `npm run prisma:migrate:dev`

See [CLAUDE.md](CLAUDE.md) for detailed step-by-step guide with code examples.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | **Required** |
| `LOG_LEVEL` | Log verbosity | `info` |

See [Setup Guide](docs/SETUP.md) for complete environment configuration.

## Troubleshooting

**Database won't connect:**
```bash
docker compose ps          # Check if running
docker compose up -d postgres  # Start if needed
```

**Prisma errors:**
```bash
npm run prisma:generate    # Regenerate client
npm run db:reset           # Reset database (dev only)
```

**Port in use:**
```bash
lsof -i :3000 && kill -9 <PID>
```

For comprehensive troubleshooting, see [Troubleshooting Guide](docs/TROUBLESHOOTING.md).

## Production Deployment

```bash
npm run build                      # Compile TypeScript
npm run prisma:migrate:deploy      # Apply migrations
NODE_ENV=production npm start      # Start server
```

See [Setup Guide](docs/SETUP.md#production-setup) for Docker deployment.

## License

MIT
