.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install workspace dependencies with the pinned pnpm
	pnpm install --frozen-lockfile

.PHONY: db-up
db-up: ## Start local Postgres
	docker compose -f docker-compose-postgres.yml up -d

.PHONY: db-down
db-down: ## Stop local Postgres
	docker compose -f docker-compose-postgres.yml down

.PHONY: migrate
migrate: ## Regenerate the schema and apply migrations
	pnpm run apply-migration

.PHONY: dev
dev: db-up ## Run the dev server
	pnpm dev

.PHONY: verify
verify: ## Everything CI runs, in CI's order
	pnpm run lint
	pnpm run lint:format
	pnpm run type-check
	pnpm run test:unit
	pnpm run check-build

.PHONY: e2e
e2e: ## Run Playwright against a local server
	pnpm run test:e2e

.PHONY: deps
deps: ## Print the workspace dependency report
	pnpm run deps:report

.PHONY: clean
clean: ## Remove build output
	pnpm run clean
	rm -rf coverage playwright-report test-results
