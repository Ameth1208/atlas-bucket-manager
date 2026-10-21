# AGENTS.md - Atlas Bucket Manager (Monorepo)

## Build & Run

```bash
# Install dependencies for client
pnpm install

# Run the Go API (port 3001)
pnpm dev:api      # cd apps/api && go run ./cmd/server

# Run the Client (port 3000)
pnpm dev:client   # pnpm --filter @atlas/client run dev

# Build everything for production
pnpm build

# Build a single app
pnpm build:api    # cd apps/api && go build -o atlas-api ./cmd/server
pnpm build:client # Next.js standalone build

# Start the all-in-one container/entrypoint
pnpm start

# Tests
pnpm test         # pnpm test:api
pnpm test:api     # cd apps/api && go test -v ./...
pnpm test:client
```

## Monorepo Layout

```
atlas-bucket-manager/
├── apps/
│   ├── api/                 # Atlas API — Go 1.26 + Gin + MinIO-Go + SQLite (CGO-free)
│   │   ├── cmd/server/      # main.go, server_test.go
│   │   ├── internal/
│   │   │   ├── config/      # env loading (PORT, DB_PATH, JWT_SECRET, CORS_ORIGIN)
│   │   │   ├── database/    # modernc.org/sqlite database service & schema migrations
│   │   │   ├── domain/      # entities & domain models
│   │   │   ├── middleware/  # auth (JWT & API Keys), CORS, roles
│   │   │   ├── s3/          # MinIO Go client manager & connection cache
│   │   │   └── modules/     # auth, users, providers, buckets, objects,
│   │   │                    # copy, api-keys, activity, health, integrations
│   │   ├── Dockerfile
│   │   ├── go.mod, go.sum
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

- **`apps/api`** — Go 1.26 + Gin. Modules: `auth`, `users`, `providers`, `buckets`, `objects`, `copy`, `api-keys`, `activity`, `health`, `integrations`. CGO-free SQLite via `modernc.org/sqlite`. Official native S3 via `minio-go/v7`. Native streaming ZIP packaging via Go standard library `archive/zip`.
- **`apps/client`** — Next.js 16 App Router + shadcn/ui + Tailwind 4. Talks to the API through Next.js rewrites (`/api/*` and `/socket.io/*` → `http://localhost:3001`).
- **Entry** — `apps/api/cmd/server/main.go` boots REST + Socket.IO. Health: `GET /health`. API: `GET/POST/.../api/*`. WebSocket: `/socket.io`.
- **Client → API** — `apps/client/next.config.ts` rewrites. The cookie `auth_token` is httpOnly and scoped to the client (3000); Next forwards the request to the API (3001) server-side.

## Environment

Single `.env` at the repo root. `PORT`, `NODE_ENV`, `DB_PATH`, `JWT_SECRET`, `CORS_ORIGIN`.

**Provider credentials are NOT set here.** They're managed through the web UI ("Connect Provider") and stored in SQLite.

## Docker

```bash
docker compose up -d            # All-in-One Container
```

Single multi-stage build: compiles Go API static binary + Next.js standalone runner.
