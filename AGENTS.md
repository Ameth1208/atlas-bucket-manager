# AGENTS.md - Atlas Bucket Manager (Monorepo)

## Build & Run

```bash
# Install everything (root)
pnpm install

# Run both apps in parallel (API :3001, Client :3000)
pnpm dev

# Run a single app
pnpm dev:api      # nest start --watch → :3001
pnpm dev:client   # next dev              → :3000

# Build everything for production
pnpm build

# Build a single app
pnpm build:api
pnpm build:client

# Start the API in production mode (after build)
pnpm start

# Tests
pnpm test
pnpm test:api
```

## Monorepo Layout

```
atlas-bucket-manager/
├── apps/
│   ├── api/                 # @atlas/api — NestJS + Clean Architecture
│   │   ├── src/
│   │   │   ├── main.ts, app.module.ts
│   │   │   ├── config/      # env loading via @nestjs/config
│   │   │   ├── common/      # filters, guards, decorators
│   │   │   ├── domain/      # entities + repository interfaces
│   │   │   ├── infrastructure/  # database (SQLite) + s3 (MinIO)
│   │   │   └── modules/     # auth, users, providers, buckets, objects,
│   │   │                    # copy, api-keys, activity, health
│   │   ├── test/            # e2e (jest)
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   └── package.json
│   └── client/              # @atlas/client — Next.js 16 + shadcn/ui
│       ├── app/             # routes
│       ├── components/      # ui, dashboard, layout, modals
│       ├── lib/             # api client, store, utils
│       ├── hooks/
│       ├── middleware.ts
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml       # API + Web + (optional) MinIO
├── pnpm-workspace.yaml
├── package.json             # root, workspace scripts only
└── .env / .env.example
```

## Architecture

- **`apps/api`** — NestJS 10 + TypeScript. Modules: `auth`, `users`, `providers`, `buckets`, `objects`, `copy`, `api-keys`, `activity`, `health`. Global JWT guard via `APP_GUARD`. Domain entities + repository interfaces (DI tokens) in `domain/`. SQLite via `DatabaseService` + 3 repos. S3 via `S3Service` (MinIO client manager) + `S3BucketRepository`.
- **`apps/client`** — Next.js 16 App Router + shadcn/ui + Tailwind 4. Talks to the API through Next.js rewrites (`/api/*` and `/socket.io/*` → `http://localhost:3001`).
- **Entry** — `apps/api/src/main.ts` boots Nest and exposes REST + WebSocket. Health: `GET /health`. API: `GET/POST/.../api/*`. WebSocket: `/socket.io`.
- **Client → API** — `apps/client/next.config.ts` rewrites. The cookie `auth_token` is httpOnly and scoped to the client (3000); Next forwards the request to the API (3001) server-side.

## Environment

Single `.env` at the repo root. The API auto-discovers it via `ConfigModule.forRoot({ envFilePath })` (searches `cwd/.env`, `cwd/../../.env`, and `dist/../../../../.env` for Docker). `CORS_ORIGIN` should point to the client URL (`http://localhost:3000` in dev).

**Provider credentials are NOT set here.** They're managed through the web UI ("Connect Provider") and stored in SQLite.

## Docker

```bash
docker compose up -d            # API + Web
docker compose --profile minio up -d   # + local MinIO
```

Images: `apps/api/Dockerfile` → `atlas-api`. `apps/client/Dockerfile` → `atlas-web`.

## See Also

- `README.md` — product overview
- `CLAUDE.md` — Claude-specific guide
- `apps/api/` — backend
- `apps/client/` — frontend
