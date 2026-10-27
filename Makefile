# One entry point for running and checking TypeVocal. Recipes call the repo's own scripts.
.PHONY: install up down lint format test test-frontend test-backend test-e2e check

install:
	bun install --frozen-lockfile

## Run the app (Vite on :1420 + the Rust backend). Ctrl+C stops it.
up: install
	bun run tauri dev

## Stop a dev app left running in the background.
down:
	@lsof -ti tcp:1420 | xargs kill 2>/dev/null || true
	@pkill -f 'target/debug/typevocal' 2>/dev/null || true
	@echo "stopped"

lint:
	bun run lint
	bunx tsc --noEmit
	bun run format:check
	cd src-tauri && cargo clippy --all-targets -- -D warnings

format:
	bun run format

test-frontend:
	bun run check:translations
	bun run check:model-languages
	scripts/run-unit-tests.sh

test-backend:
	cd src-tauri && cargo test

test-e2e:
	bunx playwright install chromium
	bun run test:playwright

test: test-frontend test-backend

check: lint test
