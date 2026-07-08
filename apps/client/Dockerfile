# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/client/package.json ./apps/client/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/client/node_modules ./apps/client/node_modules

COPY package.json pnpm-workspace.yaml ./
COPY apps/client ./apps/client

RUN corepack enable && pnpm --filter @atlas/client run build

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S atlas && adduser -S -u 1001 atlas

COPY --from=builder --chown=atlas:atlas /app/apps/client/.next/standalone ./
COPY --from=builder --chown=atlas:atlas /app/apps/client/.next/static ./.next/static
COPY --from=builder --chown=atlas:atlas /app/apps/client/public ./public

USER atlas
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
