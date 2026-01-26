# Docker Guide

Complete guide for running the application with Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Docker Network                                  │
│                          (myapp-network)                                     │
│                                                                              │
│  ┌─────────────────────┐         ┌─────────────────────┐                    │
│  │     PostgreSQL      │         │    Application      │                    │
│  │   (myapp-postgres)  │◄────────│    (myapp-app)      │                    │
│  │                     │   SQL   │                     │                    │
│  │  Port: 5432 (int)   │         │  Port: 3000         │                    │
│  └──────────┬──────────┘         └──────────┬──────────┘                    │
│             │                               │                               │
└─────────────┼───────────────────────────────┼───────────────────────────────┘
              │                               │
              ▼                               ▼
        localhost:5432                  localhost:3000
        (dev only)                      (exposed)
```

## File Structure

```
├── docker-compose.yml          # Base configuration (shared)
├── docker-compose.override.yml # Development overrides (auto-loaded)
├── docker-compose.prod.yml     # Production configuration
├── Dockerfile                  # Multi-stage application build
├── .dockerignore               # Files excluded from build
├── .env.docker                 # Docker environment template
├── Makefile                    # Convenience commands
└── docker/
    └── postgres/
        └── init/
            └── 01-init.sql     # Database initialization
```

## Quick Start

### Development

```bash
# Start PostgreSQL (dev + test databases)
make dev
# or
docker compose up -d

# Check status
make ps

# View logs
make logs
```

### Production

```bash
# Build and start everything
make prod
# or
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Docker Compose Files

### `docker-compose.yml` (Base)

Contains core service definitions shared between environments:
- PostgreSQL service with health checks
- Network configuration
- Volume definitions

### `docker-compose.override.yml` (Development)

Automatically loaded with base file. Adds:
- Port exposure for local tools
- Test database service
- Debug logging

### `docker-compose.prod.yml` (Production)

Used explicitly for production. Adds:
- Application container
- Resource limits
- Production logging
- No exposed database ports

## Environment Variables

### Docker Compose Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMPOSE_PROJECT_NAME` | Container prefix | `myapp` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `myapp` |
| `POSTGRES_PORT` | Host port for dev DB | `5432` |
| `POSTGRES_TEST_PORT` | Host port for test DB | `5433` |
| `APP_PORT` | Application port | `3000` |
| `LOG_LEVEL` | Application log level | `info` |

### Setting Variables

```bash
# Option 1: Create .env file
cp .env.docker .env
# Edit .env with your values

# Option 2: Inline
POSTGRES_PASSWORD=secret docker compose up -d

# Option 3: Export
export POSTGRES_PASSWORD=secret
docker compose up -d
```

## Makefile Commands

Run `make help` to see all commands:

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment |
| `make prod` | Start production environment |
| `make down` | Stop all containers |
| `make down-clean` | Stop and remove volumes |
| `make logs` | View container logs |
| `make ps` | Show running containers |
| `make db-shell` | Open PostgreSQL shell |
| `make db-reset` | Reset database (destroys data) |
| `make db-backup` | Backup database |
| `make db-restore FILE=backup.sql` | Restore from backup |
| `make test` | Run tests |
| `make build` | Build production image |
| `make clean` | Remove all Docker resources |

## Dockerfile Stages

The multi-stage Dockerfile optimizes for security and size:

```dockerfile
# Stage 1: base
# - Alpine Linux base
# - Security updates
# - Non-root user creation

# Stage 2: deps
# - Install npm dependencies
# - Generate Prisma client

# Stage 3: builder
# - Copy source code
# - Build TypeScript
# - Prune dev dependencies

# Stage 4: runner
# - Minimal production image
# - Only runtime files
# - Non-root user
# - Health check
```

### Image Size Comparison

| Stage | Contents | Size |
|-------|----------|------|
| Full dev | All deps + source | ~500MB |
| Runner | Prod deps + dist | ~150MB |

## Database Initialization

The `docker/postgres/init/01-init.sql` script runs once when the database is first created:

```sql
-- Enabled extensions:
-- uuid-ossp: UUID generation (v4)
-- pg_trgm: Text similarity search
-- btree_gin: GIN index support
```

To add more initialization:
1. Create new `.sql` files in `docker/postgres/init/`
2. Name with numeric prefix for ordering (e.g., `02-custom.sql`)
3. Recreate containers: `make down-clean && make dev`

## Common Operations

### Connecting to Database

```bash
# Via Makefile
make db-shell

# Via docker exec
docker compose exec postgres psql -U postgres -d myapp

# Via connection string (from host)
psql postgresql://postgres:postgres@localhost:5432/myapp
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres

# Last N lines
docker compose logs --tail=100 postgres
```

### Database Backup/Restore

```bash
# Backup
make db-backup
# Creates: backups/backup_YYYYMMDD_HHMMSS.sql

# Restore
make db-restore FILE=backups/backup_20240101_120000.sql
```

### Resetting Everything

```bash
# Stop and remove volumes (database data)
make down-clean

# Start fresh
make dev

# Run migrations
npm run prisma:migrate:dev
```

## Production Deployment

### Build Image

```bash
# Build locally
make build

# Build with specific tag
docker build -t myapp:v1.0.0 .

# Push to registry
docker tag myapp:v1.0.0 registry.example.com/myapp:v1.0.0
docker push registry.example.com/myapp:v1.0.0
```

### Deploy

```bash
# Create production .env
cat > .env.prod << EOF
POSTGRES_USER=produser
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=myapp_prod
LOG_LEVEL=info
EOF

# Start with production config
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

# Run migrations
docker compose exec app npm run prisma:migrate:deploy
```

### Health Checks

The application container includes a health check:

```bash
# Check health status
docker compose ps

# Manual health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs postgres

# Check if port is in use
lsof -i :5432
```

### Database connection refused

```bash
# Ensure container is running
docker compose ps

# Check container is healthy
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Wait for health check
docker compose up -d --wait
```

### Permission denied on volume

```bash
# Reset volumes
make down-clean
make dev
```

### Out of disk space

```bash
# Clean up Docker resources
make prune
# or
docker system prune -a --volumes
```

## Security Considerations

### Development
- Default passwords are acceptable
- Ports exposed to localhost only
- No sensitive data

### Production
- Use strong passwords
- Don't expose database ports
- Use Docker secrets for credentials
- Run as non-root user
- Enable SSL/TLS
- Regular security updates

### Using Docker Secrets (Production)

```yaml
# docker-compose.prod.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```
