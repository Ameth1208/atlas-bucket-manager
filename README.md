# 🪣 Atlas Bucket Manager

> A high-performance, unified Multi-Cloud UI for managing S3-compatible storage (MinIO, AWS S3, R2, Spaces). Built with **Next.js 16 + shadcn/ui** for the web and **NestJS 10 + Clean Architecture** for the API.

Atlas is a lightweight, secure, and modern web interface designed to bridge the gap between local development and cloud production. Manage visibility, explore files, and perform global searches across all your storage providers in one unified place.

**Tech Stack**: Next.js 16 (App Router) · shadcn/ui · Tailwind CSS 4 · NestJS 10 · TypeScript · Socket.io · better-sqlite3 · MinIO SDK

---

## ✨ Multi-Cloud Features

- **🌐 Unified Dashboard**: View buckets from MinIO and AWS S3 in a single view with provider-specific badges.
- **🔍 Global Search**: Search for any file across **all buckets and all providers** at the same time.
- **🛡️ Secure Preview Tunnel**: Preview private images, videos, audio, and PDFs through an internal proxy. No CORS, no exposed ports.
- **📤 Bulk Operations**: Multi-file upload and bulk deletion with checkbox selection.
- **🔗 Smart Share Links**: Generate temporary download links with custom expiration (1 min → 7 days).
- **📊 Storage Stats**: Instant calculation of total size and object count per bucket.
- **🪣 Copy Bucket Engine**: Stream-based backup between providers with live progress over WebSocket (MB/s, ETA, cancel, skip/overwrite).
- **🗑️ Safe Deletion**: Type the bucket name to confirm; automatic content cleanup.
- **🔑 API Keys**: Scoped Bearer keys (`atl_…`) for programmatic access, with per-key bucket filters.
- **👥 Multi-user, Multi-role**: Owner / admin / viewer with JWT cookies.
- **🌍 Internationalization**: EN, ES, PT, FR, JA, ZH with persistent preference.
- **♿ Accessible**: WCAG 2.1 AA, keyboard navigation, screen reader labels.

---

## 🔌 Supported Providers

- **MinIO** (Amazon S3 compatible) ✅
- **AWS S3** ✅
- **Cloudflare R2** ✅
- **DigitalOcean Spaces** ✅
- **Wasabi Hot Cloud Storage** ✅
- **Any S3-compatible API** ✅

Roadmap: Google Cloud Storage, Azure Blob, Backblaze B2, Oracle Cloud.

---

## 🧱 Monorepo Layout

This is a **pnpm workspace** with two apps:

```
atlas-bucket-manager/
├── apps/
│   ├── api/      # @atlas/api — NestJS 10 + Clean Architecture
│   └── client/   # @atlas/client — Next.js 16 + shadcn/ui + Tailwind 4
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json  # workspace root (dev/build/test scripts)
└── .env / .env.example
```

The API is built with **NestJS** (`nest build`). The client is built with **Next.js**.

---

## 🚀 Quick Start (Docker)

```bash
cp .env.example .env
docker compose up -d                 # API + Web
docker compose --profile minio up -d # + local MinIO
```

Visit `http://localhost:3000`. The API listens on `:3001` (internal). Configure providers either via the UI or via `.env`.

---

## 🛠️ Development

```bash
# 1. Install once at the root
pnpm install

# 2. Configure env
cp .env.example .env
# (edit .env — at minimum set JWT_SECRET and provider keys)

# 3. Run both apps in parallel
pnpm dev
#   API    → http://localhost:3001/health
#   Client → http://localhost:3000

# Run a single app
pnpm dev:api
pnpm dev:client
```

---

## 🧪 Testing

```bash
pnpm test          # all
pnpm test:api      # API unit tests (Jest)
```

API tests live in `apps/api/test/` and mock the repository via `MockBucketRepository`.

---

## ☕ Support

If you find this project useful:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/amethgmc)

---

&copy; 2026 [Ameth Galarcio](https://amethgm.com). Open Source under MIT License.
