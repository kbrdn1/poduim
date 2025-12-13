.PHONY: setup install dev test

setup:
	@cp packages/api/.env.local packages/api/.env 2>/dev/null || true
	@cp packages/web/.env.local packages/web/.env 2>/dev/null || true

install:
	@bun install

dev:
	@docker compose -f docker-compose.local.yml up --build

test:
	@bun run test