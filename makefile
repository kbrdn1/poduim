.PHONY: help install setup dev dev-api dev-web docker-dev docker-stop docker-logs docker-build build build-api build-web preview preview-web seed db-start db-stop db-reset db-migrate db-push db-studio clean typecheck lint

help: ## Show this help
	@echo "Poduim - Makefile"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install all dependencies
	bun install

setup: install db-start db-push seed ## Full setup: install, start DB, push schema, seed
	@echo "Setup complete! Run 'make dev' to start development servers."

# ============================================
# Local Development (without Docker for API/Web)
# ============================================

dev: ## Start all services locally (API + Web)
	@echo "Starting Poduim..."
	@make -j2 dev-api dev-web

dev-api: ## Start API server locally (port 3333)
	@echo "Starting API on port 3333..."
	cd packages/api && bun dev

dev-web: ## Start Web server locally (port 3000)
	@echo "Starting Web on port 3000..."
	cd packages/web && bun dev

# ============================================
# Docker Development (full stack)
# ============================================

docker-dev: ## Start all services in Docker (MySQL + API + Web)
	@echo "Starting Poduim in Docker..."
	docker compose -f docker-compose.local.yml up --build -d
	@echo ""
	@echo "Services started:"
	@echo "  - MySQL: localhost:3306"
	@echo "  - API:   http://localhost:3333"
	@echo "  - Web:   http://localhost:3000"

docker-stop: ## Stop all Docker services
	@echo "Stopping all services..."
	docker compose -f docker-compose.local.yml down

docker-logs: ## View Docker logs (all services)
	docker compose -f docker-compose.local.yml logs -f

docker-build: ## Rebuild Docker images
	docker compose -f docker-compose.local.yml build --no-cache

# ============================================
# Build
# ============================================

build: build-api build-web ## Build all packages

build-api: ## Build API package
	@echo "Building API..."
	cd packages/api && bun run build

build-web: ## Build Web package
	@echo "Building Web..."
	cd packages/web && bun run build

preview: preview-web ## Preview production build

preview-web: ## Preview Web production build
	@echo "Starting Web preview on port 3000..."
	cd packages/web && bun run preview

# ============================================
# Database
# ============================================

seed: ## Seed the database
	@echo "Seeding database..."
	cd packages/api && bun db:seed

db-start: ## Start MySQL database (Docker)
	@echo "Starting MySQL database..."
	docker compose -f docker-compose.local.yml up -d mysql
	@echo "Waiting for MySQL to be ready..."
	@sleep 10

db-stop: ## Stop MySQL database (Docker)
	@echo "Stopping MySQL database..."
	docker compose -f docker-compose.local.yml down

db-reset: ## Reset database (drop, push schema, seed)
	@echo "Resetting database..."
	cd packages/api && bun db:push --force
	@make seed
	@echo "Database reset complete!"

db-migrate: ## Run database migrations
	cd packages/api && bun db:migrate

db-push: ## Push schema to database (non-interactive)
	cd packages/api && bun db:push --force

db-studio: ## Open Drizzle Studio
	cd packages/api && bun db:studio

# ============================================
# Quality
# ============================================

clean: ## Clean all node_modules and build artifacts
	rm -rf node_modules packages/*/node_modules packages/*/.nuxt packages/*/dist

typecheck: ## Run typecheck on all packages
	cd packages/api && bun typecheck
	cd packages/web && bun run typecheck

lint: ## Run linter on all packages
	cd packages/api && bun lint
	cd packages/web && bun run lint
