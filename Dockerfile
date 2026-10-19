# ============================================
# Stage 1: Build (API & Web)
# ============================================
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY apps/client ./apps/client

# Build API (NestJS)
RUN pnpm --filter @atlas/api run build

# Build Client (Next.js standalone)
RUN pnpm --filter @atlas/client run build

# ============================================
# Stage 2: Runtime (All-in-One)
# ============================================
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DB_PATH=/app/data

# Copy all node_modules with prebuilt native addons (better-sqlite3)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy compiled Client standalone
COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public

# Copy entrypoint runner
COPY docker-entrypoint.js ./docker-entrypoint.js

# Create runtime directories
RUN mkdir -p /app/data /app/uploads /app/temp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "docker-entrypoint.js"]
