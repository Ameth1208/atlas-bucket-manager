# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager: pnpm (workspaces)**

```bash
# Development
pnpm install                # install all workspace deps once at the root
pnpm dev                    # run API + Client in parallel
pnpm dev:api                # only the API (port 3001)
pnpm dev:client             # only the client (port 3000, Next.js)

# Production build
pnpm build                  # build both apps
pnpm build:api              # build only the API
pnpm build:client           # build only the client
pnpm start                  # run API in production (requires build)

# Testing
pnpm test                   # run all tests
pnpm test:api               # API tests only (Jest)
pnpm test:client            # client tests (none yet)

# Docker
docker compose up -d            # API + Web
docker compose --profile minio up -d   # + local MinIO
```

## Architecture

This is a **pnpm monorepo** with two apps:

- **`apps/api`** (`@atlas/api`) — **NestJS 10** + TypeScript. Module-per-feature: `auth`, `users`, `providers`, `buckets`, `objects`, `api-keys`, `activity`, `copy`, `health`. Bootstrapped at `apps/api/src/main.ts`; root module at `apps/api/src/app.module.ts`. Global `APP_GUARD` = `JwtAuthGuard` (cookie JWT or `Bearer atl_…` API key). Compiled with `nest build` → `apps/api/dist/`.
- **`apps/client`** (`@atlas/client`) — Next.js 16 App Router + shadcn/ui + Tailwind 4. Talks to the API through Next.js rewrites (`/api/*` and `/socket.io/*` → `http://localhost:3001`).

**API layers (Clean Architecture, framework-aware):**
- `domain/entities` — pure TypeScript types/interfaces, no Nest deps.
- `domain/repositories` — interfaces + `Symbol` injection tokens (`USER_REPOSITORY`, `BUCKET_REPOSITORY`, `API_KEY_REPOSITORY`, `ACTIVITY_REPOSITORY`).
- `infrastructure/database` — `DatabaseService` (better-sqlite3 + migrations) + 3 concrete repos bound to the tokens.
- `infrastructure/s3` — `S3Service` (MinIO client cache) + `S3BucketRepository` (all S3 ops + provider CRUD in one place).
- `modules/<feature>` — `*.module.ts` + `*.controller.ts` + `*.service.ts` + `dto/`. Services inject repos via `@Inject(TOKEN)`. DTOs use `class-validator` for input validation.
- `common/` — `AllExceptionsFilter`, `JwtAuthGuard`, `RolesGuard`, `ScopesGuard`, decorators (`@Public`, `@Roles`, `@CurrentUser`).

**Multi-cloud abstraction**: All S3 ops go through `IBucketRepository` (`apps/api/src/domain/repositories/bucket.repository.ts`). `S3Service` caches one MinIO client per provider; clients are invalidated when a provider is deleted.

**Real-time copy progress**: `CopyService` (EventEmitter) → `CopyGateway` (`@WebSocketGateway`) → socket.io events `copy:progress|completed|failed|cancelled`.

## Key Conventions

- **File naming**: kebab-case throughout (`auth.service.ts`, `copy.gateway.ts`).
- **Tests**: `*.spec.ts` next to source for unit tests; `test/*.e2e-spec.ts` for e2e. Use `@nestjs/testing` `Test.createTestingModule({...})`.
- **TypeScript output**: CommonJS for the API, ESM via Next bundler for the client.
- **Auth**: JWT in HTTP-only cookie (`auth_token`) OR `Authorization: Bearer atl_<key>` for API access. `apps/api/src/common/guards/jwt-auth.guard.ts` handles both. `apps/client/middleware.ts` redirects unauthenticated browser traffic to `/login`.
- **Uploads/temp/data**: `apps/api/uploads`, `apps/api/temp`, `apps/api/data` (auto-created on `DatabaseService.onModuleInit`, relative to API cwd).
- **Environment**: Single `.env` at repo root. `ConfigModule.forRoot` auto-discovers it. `CORS_ORIGIN` should match the client URL.
- **Provider credentials**: NEVER in `.env`. They're managed through the web UI and stored in SQLite.
