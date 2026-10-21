# ============================================
# Stage 1: Build API (Go 1.26 Static Binary)
# ============================================
FROM golang:1.26-alpine AS go-builder
WORKDIR /app

RUN apk add --no-cache ca-certificates git

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -extldflags '-static'" \
    -o /atlas-api ./cmd/server

# ============================================
# Stage 2: Build Web (Next.js Standalone)
# ============================================
FROM node:22-bookworm-slim AS web-builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/client/package.json apps/client/package.json

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN pnpm install --frozen-lockfile

COPY apps/client ./apps/client

# Build Client (Next.js standalone)
RUN pnpm --filter @atlas/client run build

# ============================================
# Stage 3: Runtime (All-in-One: Go API + Next.js)
# ============================================
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DB_PATH=/app/data

# Copy compiled Go API static binary
COPY --from=go-builder /atlas-api /app/atlas-api

# Copy compiled Client standalone
COPY --from=web-builder /app/apps/client/.next/standalone ./
COPY --from=web-builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=web-builder /app/apps/client/public ./apps/client/public

# Copy entrypoint runner
COPY docker-entrypoint.js ./docker-entrypoint.js

# Create runtime directories
RUN mkdir -p /app/data /app/uploads /app/temp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "docker-entrypoint.js"]
