# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy all app package.json files
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
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
FROM node:22-alpine AS api

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S atlasapp -u 1001 -G nodejs

WORKDIR /app

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy compiled API
COPY --from=builder --chown=atlasapp:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=atlasapp:nodejs /app/apps/api/package.json ./apps/api/package.json

# Create runtime dirs
RUN mkdir -p /app/apps/api/data /app/apps/api/uploads /app/apps/api/temp && \
    chown -R atlasapp:nodejs /app/apps/api/data /app/apps/api/uploads /app/apps/api/temp

USER atlasapp
WORKDIR /app/apps/api

ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

CMD ["node", "dist/main.js"]
