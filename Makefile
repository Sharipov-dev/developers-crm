# =============================================================================
# Makefile - Common Commands
# =============================================================================
# Usage: make <target>
# Run `make help` to see all available commands.
# =============================================================================

.PHONY: help dev prod down logs clean db-reset db-shell test build

# Default target
.DEFAULT_GOAL := help

# Project name (used for container naming)
PROJECT_NAME ?= myapp

# =============================================================================
# Help
# =============================================================================
help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# Development
# =============================================================================
dev: ## Start development environment (PostgreSQL + test DB)
	docker compose up -d
	@echo "✓ Development databases started"
	@echo "  Main DB: localhost:5432"
	@echo "  Test DB: localhost:5433"

dev-logs: ## Show development logs
	docker compose logs -f

# =============================================================================
# Production
# =============================================================================
prod: ## Start production environment
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@echo "✓ Production environment started"

prod-logs: ## Show production logs
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# =============================================================================
# Common Operations
# =============================================================================
down: ## Stop all containers
	docker compose down
	@echo "✓ All containers stopped"

down-clean: ## Stop all containers and remove volumes
	docker compose down -v --remove-orphans
	@echo "✓ All containers and volumes removed"

logs: ## Show logs for all services
	docker compose logs -f

ps: ## Show running containers
	docker compose ps

# =============================================================================
# Database Operations
# =============================================================================
db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d myapp

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  This will destroy all database data!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker compose down -v
	docker compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 5
	npm run prisma:migrate:dev
	@echo "✓ Database reset complete"

db-backup: ## Backup database to ./backups/
	@mkdir -p backups
	docker compose exec postgres pg_dump -U postgres myapp > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup created in ./backups/"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/backup.sql)
	@test -n "$(FILE)" || (echo "Error: FILE is required. Usage: make db-restore FILE=backups/backup.sql" && exit 1)
	docker compose exec -T postgres psql -U postgres myapp < $(FILE)
	@echo "✓ Database restored from $(FILE)"

# =============================================================================
# Testing
# =============================================================================
test: dev ## Run tests (starts test DB if needed)
	npm test

test-watch: dev ## Run tests in watch mode
	npm run test:watch

test-coverage: dev ## Run tests with coverage
	npm run test:coverage

# =============================================================================
# Build
# =============================================================================
build: ## Build production Docker image
	docker build -t $(PROJECT_NAME):latest .
	@echo "✓ Image built: $(PROJECT_NAME):latest"

build-no-cache: ## Build production image without cache
	docker build --no-cache -t $(PROJECT_NAME):latest .
	@echo "✓ Image built (no cache): $(PROJECT_NAME):latest"

# =============================================================================
# Cleanup
# =============================================================================
clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all --remove-orphans
	@echo "✓ Cleanup complete"

prune: ## Remove unused Docker resources
	docker system prune -f
	docker volume prune -f
	@echo "✓ Docker resources pruned"
