# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy all app package.json files
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Install all workspace dependencies (honors better-sqlite3 build script)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/client/node_modules ./apps/client/node_modules

# Copy source
COPY package.json pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY apps/client ./apps/client

# Build the API (NestJS)
RUN corepack enable && pnpm --filter @atlas/api run build

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:22-bookworm-slim AS api

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Create runtime dirs
RUN mkdir -p /app/apps/api/data /app/apps/api/uploads /app/apps/api/temp

WORKDIR /app/apps/api

ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

CMD ["node", "dist/main.js"]
