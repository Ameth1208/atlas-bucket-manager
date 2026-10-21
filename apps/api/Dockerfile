# ============================================
# Stage 1: Build (Go 1.26 Static Binary)
# ============================================
FROM golang:1.26-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ca-certificates git

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -extldflags '-static'" \
    -o /atlas-api ./cmd/server

# ============================================
# Stage 2: Runtime (Minimal Scratch / Alpine)
# ============================================
FROM alpine:3.21 AS runner

RUN apk add --no-cache ca-certificates tzdata && \
    mkdir -p /app/data /app/uploads /app/temp

WORKDIR /app

COPY --from=builder /atlas-api /app/atlas-api

ENV PORT=3001
ENV NODE_ENV=production
ENV DB_PATH=/app/data
ENV JWT_SECRET=atlas-production-fallback-secret-please-set-jwt-secret
ENV CORS_ORIGIN=http://localhost:3000

EXPOSE 3001

VOLUME ["/app/data"]

ENTRYPOINT ["/app/atlas-api"]
