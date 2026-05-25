# Tinner Project Master Makefile
# This file centralizes management of Backend, Frontend, and Documentation

.PHONY: help latex be fe install clean

# Default command shows help
help:
	@echo "Tinner Master Control:"
	@echo "  make latex   - Build LaTeX report (auto-cleans temp files)"
	@echo "  make be      - Run Backend (NestJS) development server"
	@echo "  make fe      - Run Frontend (Expo Web) development server"
	@echo "  make install - Install all monorepo dependencies"

# 1. Documentation
latex:
	@echo ">>> Building LaTeX Report..."
	@$(MAKE) -C latex

# 2. Backend (BE)
be:
	@echo ">>> Starting Backend (NestJS)..."
	pnpm --filter @tinner/backend start:dev

# 3. Frontend (FE)
fe:
	@echo ">>> Starting Frontend (Expo Web)..."
	pnpm --filter @tinner/mobile start --web

# Utility
install:
	@echo ">>> Installing dependencies..."
	pnpm install

clean:
	@$(MAKE) -C latex clean
