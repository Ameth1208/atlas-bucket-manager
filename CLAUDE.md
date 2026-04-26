# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager: pnpm**

```bash
# Development
pnpm dev              # Build CSS + compile frontend/backend, then start server
pnpm dev:watch        # Full watch mode (CSS, Lit components, backend)
pnpm build            # Full production build (CSS → frontend → backend)
pnpm start            # Run production server (requires build first)

# Individual builds
pnpm build:css        # Compile Tailwind CSS (minified)
pnpm build:css:watch  # Watch Tailwind CSS
pnpm compile:lit      # Build frontend Lit components via esbuild
pnpm compile:backend  # Build backend TypeScript via esbuild

# Testing
pnpm test             # Run all tests with Jest
pnpm test:watch       # Jest watch mode
pnpm test:coverage    # Jest with coverage report
pnpm test:unit        # Unit tests only (tests/unit/)
pnpm test:integration # Integration tests only
pnpm test:e2e         # E2E tests only

# Docker
docker-compose up -d     # Start production stack
docker-compose -f docker-compose.dev.yml up  # Dev stack (if present)
```

## Architecture

**Clean Architecture** with strict layer separation — dependencies flow inward:

```
Presentation → Application → Domain ← Infrastructure
```

- **`src/domain/`** — Entities and repository interfaces. No framework dependencies.
- **`src/application/use-cases/`** — Business logic organized by feature (`bucket/`, `object/`, `auth/`, `copy/`). Each use case takes repository interfaces (not implementations) via constructor injection.
- **`src/infrastructure/`** — MinIO/S3 SDK implementation (`s3-bucket.repository.ts`), copy engine, WebSocket manager, and environment config.
- **`src/presentation/`** — Express controllers, routes, and middleware. Controllers call use cases and handle HTTP request/response shaping.
- **`src/server.ts`** — Manual dependency injection wiring. Creates the repository, instantiates all use cases, wires controllers, mounts routes, and starts Socket.io.

**Build pipeline**: TypeScript is compiled by **esbuild** (not `tsc`) via custom scripts (`build-backend.js`, `build-frontend.js`). The Vite config (`vite.config.ts`) is only used for `vite build` which produces `dist-frontend/` for HTML entry points.

**Frontend**: Lit Web Components in `public/js/components-lit/`. State flows through `public/js/store.ts`; API calls go through `public/js/api.ts`. The i18n system uses `public/js/i18n/translations/*.json` and is bundled separately as `public/js/i18n.js`.

**Multi-cloud abstraction**: All S3-compatible operations are behind `IBucketRepository` (`src/domain/repositories/bucket.repository.interface.ts`). Adding a new provider means implementing this interface — controllers and use cases require no changes.

**Real-time copy progress**: `CopyManager` → `CopyExecutor` (stream-based) → `CopyJobStore` (in-memory) → `SocketManager` (Socket.io events to client).

## Key Conventions

- **File naming**: kebab-case throughout (`create-bucket.use-case.ts`, `s3-bucket.repository.ts`)
- **Tests**: Unit tests mock the repository via `tests/mocks/mock-bucket.repository.ts`. Use case tests follow the pattern: instantiate use case with mock repo, call `execute()`, assert.
- **TypeScript output**: CommonJS modules (`"module": "commonjs"` in tsconfig). Strict mode is on.
- **Auth**: JWT stored in HTTP-only cookies. `auth.middleware.ts` verifies the token on protected routes.
- **Uploads/temp**: Multer writes to `/app/uploads` and `/app/temp` (auto-created on startup). These paths are relative to the running server.
- **Environment**: Providers are configured via `.env`. See `.env.example` for all variables. MinIO is the primary provider; AWS S3, Cloudflare R2, DigitalOcean Spaces, and Wasabi are optional via additional env vars.
