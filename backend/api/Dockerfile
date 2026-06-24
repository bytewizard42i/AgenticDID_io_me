# ============================================================================
# API GATEWAY - DOCKERFILE
# ============================================================================
#
# Multi-stage Docker build for the AgenticDID API Gateway service.
#
# DESIGN PHILOSOPHY:
# - Multi-stage build: Smaller final image (only runtime dependencies)
# - Bun runtime: Fast JavaScript runtime with built-in TypeScript support
# - Layer caching: Optimize build times by copying dependencies first
# - Non-root user: Security best practice
# - Health checks: Container orchestration support
#
# BUILD STAGES:
# 1. base: Install dependencies
# 2. build: Compile TypeScript (if needed)
# 3. production: Final minimal image
#
# USAGE:
#   docker build -t agenticdid-api:latest .
#   docker run -p 3000:3000 --env-file .env agenticdid-api:latest
#
# RELATED FILES:
# @see docker-compose.yml - Orchestrates this container with others
# @see package.json - Defines dependencies and scripts
# @see src/config.ts - Reads environment variables
#
# @author AgenticDID Team
# @version 1.0.0
# ============================================================================

# ============================================================================
# STAGE 1: BASE - Install dependencies
# ============================================================================
FROM oven/bun:1.1.30-slim AS base

# Set working directory
WORKDIR /app

# Copy dependency files first (for layer caching)
# If package.json doesn't change, Docker can reuse this layer
COPY package.json bun.lockb* ./

# Install dependencies
# --frozen-lockfile ensures reproducible builds
# No --production flag includes devDependencies (needed for TypeScript types)
RUN bun install --frozen-lockfile

# ============================================================================
# STAGE 2: BUILD - Compile TypeScript (if needed)
# ============================================================================
FROM base AS build

# Copy source code
COPY . .

# TypeScript compilation
# Note: Bun can run TypeScript directly, but compiling to JS is faster for production
# If you prefer to skip this and run TS directly, remove this stage and adjust final stage
RUN bun build src/index.ts --target=bun --outdir=dist

# ============================================================================
# STAGE 3: PRODUCTION - Final minimal image
# ============================================================================
FROM oven/bun:1.1.30-slim AS production

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only production dependencies
# This creates a smaller final image
COPY package.json ./
RUN bun install --frozen-lockfile --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Create non-root user for security
# Running as root is a security risk
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
# This is the default port, can be overridden with PORT env var
EXPOSE 3000

# Health check
# Docker/Kubernetes can use this to verify container is healthy
# Checks /health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run --bun healthcheck.ts || exit 1

# Add healthcheck script
# This script makes an HTTP request to /health
RUN echo 'const response = await fetch("http://localhost:3000/health"); \
if (!response.ok) process.exit(1);' > healthcheck.ts

# Start the application
# Use Bun's native TypeScript support for fastest startup
CMD ["bun", "run", "src/index.ts"]

# ============================================================================
# BUILD ARGUMENTS & ENVIRONMENT VARIABLES
# ============================================================================
#
# REQUIRED ENV VARS (provide via --env-file or docker-compose):
# - PORT: Server port (default: 3000)
# - ANTHROPIC_API_KEY: Claude API key
# - AGENTS_SERVICE_URL: URL of Agents Runtime
# - MIDNIGHT_GATEWAY_URL: URL of Midnight Gateway
# - TTS_SERVICE_URL: URL of TTS service
# - JWT_SECRET: Secret for signing JWT tokens
#
# OPTIONAL ENV VARS:
# - LOG_LEVEL: Logging verbosity (default: info)
# - CORS_ORIGIN: CORS allowed origin (default: *)
# - RATE_LIMIT_MAX: Max requests per minute (default: 100)
# - TOKEN_EXPIRATION_SECONDS: JWT expiration (default: 120)
# - LISTEN_IN_MODE_ENABLED: Enable TTS narration (default: true)
#
# ============================================================================

# ============================================================================
# DOCKER BUILD OPTIMIZATION TIPS
# ============================================================================
#
# 1. Use .dockerignore to exclude unnecessary files:
#    - node_modules/
#    - dist/
#    - *.log
#    - .git/
#    - README.md
#
# 2. Build with BuildKit for better caching:
#    DOCKER_BUILDKIT=1 docker build .
#
# 3. Multi-platform builds:
#    docker buildx build --platform linux/amd64,linux/arm64 .
#
# 4. Cache mounts for faster rebuilds:
#    RUN --mount=type=cache,target=/root/.bun/install/cache bun install
#
# 5. Check image size:
#    docker images agenticdid-api:latest
#    Target: <200MB
#
# ============================================================================

# ============================================================================
# TROUBLESHOOTING
# ============================================================================
#
# Container won't start:
# - Check logs: docker logs <container-id>
# - Verify env vars: docker exec <container-id> env
# - Test health: docker exec <container-id> curl localhost:3000/health
#
# Build fails:
# - Clear build cache: docker builder prune
# - Check Bun version: oven/bun:1.1.30-slim
# - Verify package.json is valid
#
# Slow builds:
# - Enable BuildKit: export DOCKER_BUILDKIT=1
# - Use cache mounts (see optimization tips)
# - Check .dockerignore excludes node_modules
#
# ============================================================================
