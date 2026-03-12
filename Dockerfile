# ============================================
# Stage 1: Dependencies (Production only)
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only and prune
RUN npm ci --omit=dev --ignore-scripts

# ============================================
# Stage 2: Builder (Full dependencies + Build)
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application (CSS + Frontend + Backend)
RUN npm run build

# ============================================
# Stage 3: Runtime (Production image - OPTIMIZED)
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S atlasapp -u 1001 -G nodejs

# Copy only production node_modules (pruned)
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

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER atlasapp

# Start command
CMD ["node", "dist/server.js"]
