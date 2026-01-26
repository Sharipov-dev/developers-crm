# Setup Guide

Complete setup instructions for development and production environments.

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | ≥ 20.0.0 | `node --version` |
| npm | ≥ 10.0.0 | `npm --version` |
| Docker | Latest | `docker --version` |
| Docker Compose | Latest | `docker compose version` |

## Quick Start (Recommended)

```bash
# 1. Clone and enter project
cd node-express-prisma-clean

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL via Docker
docker compose up -d postgres

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npm run prisma:generate

# 6. Run database migrations
npm run prisma:migrate:dev

# 7. (Optional) Seed database
npm run prisma:seed

# 8. Start development server
npm run dev
```

Server will be running at `http://localhost:3000`

---

## Detailed Setup

### Step 1: Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev?schema=public"

# Logging
LOG_LEVEL=debug

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

#### Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development`, `production`, or `test` (default: `development`) |
| `PORT` | No | HTTP server port (default: `3000`) |
| `HOST` | No | HTTP server host (default: `0.0.0.0`) |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `LOG_LEVEL` | No | `fatal`, `error`, `warn`, `info`, `debug`, `trace` (default: `info`) |
| `DEFAULT_PAGE_SIZE` | No | Default pagination size (default: `20`) |
| `MAX_PAGE_SIZE` | No | Maximum allowed page size (default: `100`) |

### Step 2: Database Setup

#### Option A: Docker (Recommended)

Start PostgreSQL container:

```bash
docker compose up -d postgres
```

Verify it's running:

```bash
docker compose ps
# Should show: myapp-postgres running on port 5432
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb myapp_dev
   ```
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://your_user:your_password@localhost:5432/myapp_dev?schema=public"
   ```

#### Option C: SQLite (Quick Prototyping)

For rapid local development without PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```bash
   npm run prisma:migrate:dev
   ```

**Note:** SQLite lacks some PostgreSQL features. Use PostgreSQL for production-like development.

### Step 3: Install Dependencies

```bash
npm install
```

This will:
- Install all dependencies
- Run `prisma generate` (via `prepare` script)

### Step 4: Database Migrations

Run migrations to create database tables:

```bash
npm run prisma:migrate:dev
```

When prompted, enter a migration name (e.g., `init`).

**What this does:**
1. Creates `prisma/migrations/` folder
2. Generates SQL migration files
3. Applies migrations to database
4. Regenerates Prisma client

### Step 5: Seed Database (Optional)

Populate database with sample data:

```bash
npm run prisma:seed
```

This creates sample users defined in `prisma/seed.ts`.

### Step 6: Start Development Server

```bash
npm run dev
```

You should see:

```
[12:00:00] INFO: Server started on http://0.0.0.0:3000
[12:00:00] INFO: Database connected successfully
```

### Step 7: Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "uptime": 5.123,
    "database": "connected"
  }
}
```

---

## IDE Setup

### VS Code

Recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

Recommended settings:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### WebStorm / IntelliJ

1. Enable ESLint: `Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint`
2. Enable Prettier: `Settings → Languages & Frameworks → JavaScript → Prettier`
3. Install Prisma plugin from marketplace

---

## Test Database Setup

For integration tests, use a separate test database:

```bash
# Start test database
docker compose up -d postgres-test
```

Create `.env.test`:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/myapp_test?schema=public"
LOG_LEVEL=silent
```

---

## Production Setup

### Build Application

```bash
npm run build
```

This compiles TypeScript to `dist/` folder.

### Production Environment

Set production environment variables:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL="postgresql://user:password@production-host:5432/myapp_prod?schema=public&sslmode=require"
LOG_LEVEL=info
```

### Run Migrations

```bash
npm run prisma:migrate:deploy
```

**Important:** Use `migrate:deploy` (not `migrate:dev`) in production. It only applies pending migrations without generating new ones.

### Start Server

```bash
npm start
```

### Docker Production Build

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm run prisma:generate

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t myapp .
docker run -p 3000:3000 --env-file .env.production myapp
```

---

## CI/CD Setup

### GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: myapp_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npm run prisma:generate

      - name: Run migrations
        run: npm run prisma:migrate:deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/myapp_test

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/myapp_test
          NODE_ENV: test
          LOG_LEVEL: silent
```

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate:dev` | Create and apply migrations |
| `npm run prisma:migrate:deploy` | Apply migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed database |
| `npm run db:reset` | Reset database (drops all data) |
