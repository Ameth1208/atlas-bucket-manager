# ============================================
# Stage 1: Dependencies (Production only)
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only with clean cache
RUN npm i --only=production --ignore-scripts && \
    npm cache clean --force

# ============================================
# Stage 2: Builder (Full dependencies + Build)
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm i --ignore-scripts

# Copy source code
COPY . .

# Build the application (CSS + Frontend + Backend)
RUN npm run build

# ============================================
# Stage 3: Runtime (Production image)
# ============================================
FROM node:22-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S atlasapp -u 1001 -G nodejs

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=atlasapp:nodejs /app/node_modules ./node_modules

# Copy compiled backend from builder
COPY --from=builder --chown=atlasapp:nodejs /app/dist ./dist

# Copy frontend assets from builder
COPY --from=builder --chown=atlasapp:nodejs /app/dist-frontend ./dist-frontend
COPY --from=builder --chown=atlasapp:nodejs /app/public ./public

# Copy package.json for metadata
COPY --from=builder --chown=atlasapp:nodejs /app/package*.json ./

# Create uploads and temp directories with correct permissions
RUN mkdir -p /app/uploads /app/temp && \
    chown -R atlasapp:nodejs /app/uploads /app/temp

# Switch to non-root user
USER atlasapp

# Set environment to production (NO default port - user must specify)
ENV NODE_ENV=production

# No EXPOSE - port is completely dynamic and user-defined

# Health check disabled by default (requires PORT to be set)
# Enable by rebuilding with: --build-arg ENABLE_HEALTHCHECK=true
# Or override in docker-compose/docker run

# Start command
CMD ["node", "dist/server.js"]