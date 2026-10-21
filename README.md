# 🪣 Atlas Bucket Manager

> A high-performance, unified Multi-Cloud UI & API for managing S3-compatible storage (MinIO, AWS S3, Cloudflare R2, DigitalOcean Spaces, Wasabi). Built with **Next.js 16 + shadcn/ui** for the frontend and **Go 1.26 + Gin + MinIO-Go** for the backend API.

Atlas is a lightweight, secure, and modern web interface designed to bridge the gap between local development and cloud production. Manage visibility, explore files, download folders as `.zip` in real-time, and perform global searches across all your storage providers in one unified place.

**Tech Stack**: Next.js 16 (App Router) · shadcn/ui · Tailwind CSS 4 · Go 1.26 · Gin · MinIO-Go v7 · CGO-free modernc.org/sqlite · Socket.IO · Framer Motion

---

## ✨ Multi-Cloud Features

- **🌐 Unified Dashboard**: View buckets from MinIO, AWS S3, R2, and Wasabi in a single view with provider badges.
- **⚡ Blazing Fast Go Backend**: Instant startup (< 30ms), minimal RAM footprint (~20MB vs 250MB in Node), and official native Go MinIO SDK.
- **📦 On-The-Fly ZIP Streaming**: Download entire folders or multi-item selections as `.zip` using native Go `archive/zip` streaming directly from S3 without saving temporary files to disk.
- **🔍 Global Search**: Search for any file across **all buckets and all providers** simultaneously.
- **🛡️ Secure Preview Tunnel (QuickLook)**: Preview private images, videos, audio, code, and PDFs through an internal proxy. No CORS, no exposed ports.
- **📤 Bulk Operations**: Multi-file upload with quota limit enforcement (`max_size`) and bulk deletion.
- **🔗 Smart Share Links**: Public proxy stream endpoint for generating working direct download & view links without requiring authentication.
- **📊 Storage Stats**: Instant calculation of total size and object count per bucket.
- **🪣 Concurrent Copy Bucket Engine**: Multi-threaded goroutine worker pool for parallel object copying between providers with live progress over Socket.IO.
- **🗑️ Safe Deletion**: Type the bucket name to confirm; automatic recursive content cleanup.
- **🔑 API Keys**: Scoped Bearer keys (`atl_…`) for programmatic access, authenticated with SHA-256.
- **👥 Multi-user, Multi-role**: Owner / admin / editor / viewer with secure HttpOnly JWT cookies and invitation link flow.
- **🎨 Fluid Theme Animations**: Framer Motion animated theme toggling and layout pill indicators.
- **🌍 Internationalization**: EN, ES, PT, FR, JA, ZH with persistent preferences.

---

## 🔌 Supported Providers

- **MinIO** (Amazon S3 compatible) ✅
- **AWS S3** ✅
- **Cloudflare R2** ✅
- **DigitalOcean Spaces** ✅
- **Wasabi Hot Cloud Storage** ✅
- **Any S3-compatible API** ✅

---

## 🧱 Monorepo Layout

```
atlas-bucket-manager/
├── apps/
│   ├── api/                 # Atlas API — Go 1.26 + Gin + MinIO-Go + SQLite (CGO-free)
│   │   ├── cmd/server/      # main.go, server_test.go
│   │   ├── internal/        # config, database, domain, middleware, s3, modules
│   │   ├── Dockerfile       # Go standalone Dockerfile
│   │   └── go.mod, go.sum
│   └── client/              # @atlas/client — Next.js 16 + shadcn/ui + Tailwind 4
│       ├── app/             # App router routes & pages
│       ├── components/      # UI components, modals, layout
│       ├── lib/             # API client, store, utils
│       └── package.json
├── docker-compose.yml       # All-in-One Container (API + Web)
├── Dockerfile               # Multi-stage production container
├── pnpm-workspace.yaml
├── package.json             # Workspace scripts
└── .env / .env.example
```

---

## 🚀 Quick Start (Docker)

```bash
cp .env.example .env
docker compose up -d                 # All-in-One Container (API + Web on :3000)
```

Visit `http://localhost:3000`. Configure providers via the UI through the "Connect Provider" modal.

---

## 🛠️ Local Development

### Prerequisites
- **Node.js**: `>= 20`
- **pnpm**: `^9.12.0`
- **Go**: `>= 1.24`

### Installation & Run

```bash
# 1. Install frontend dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Run the Go API (port 3001)
pnpm dev:api

# 4. In another terminal, run the Next.js Client (port 3000)
pnpm dev:client
```

Visit `http://localhost:3000`. The frontend communicates with the Go API via Next.js proxy rewrites (`/api/*` and `/socket.io/*` → `http://localhost:3001`).

---

## 🧪 Testing

```bash
# Run all Go API unit & integration tests
pnpm test:api

# Run client tests
pnpm test:client
```

---

## 🏗️ Production Build

```bash
# Build both Go API binary and Next.js standalone runner
pnpm build
```

---

## 📄 License

MIT © [Ameth Galarcio](https://amethgm.com)
