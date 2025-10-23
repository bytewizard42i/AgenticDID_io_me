# AgenticDID.io Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Builder
FROM oven/bun:1.2.22 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/verifier-api/package.json ./apps/verifier-api/
COPY apps/web/package.json ./apps/web/
COPY packages/sdk/package.json ./packages/sdk/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Production Runtime
FROM oven/bun:1.2.22-slim

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

# Expose ports
# Frontend: 5173
# Backend: 8787
EXPOSE 5173 8787

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:8787/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Default command runs both services
CMD ["bun", "run", "dev"]
