# ============================================================================
# MIDNIGHT GATEWAY - DOCKERFILE
# ============================================================================
#
# Multi-stage Docker build for the Midnight Network Gateway service.
#
# PURPOSE:
# Containerize the Midnight Gateway service that handles ZK proofs and
# smart contract interactions with Midnight Network.
#
# BUILD STAGES:
# 1. base: Install dependencies
# 2. production: Final minimal image
#
# USAGE:
#   docker build -t agenticdid-midnight:latest .
#   docker run -p 3003:3003 --env-file .env agenticdid-midnight:latest
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
COPY package.json bun.lock* ./

# Install all dependencies (including dev for TypeScript)
RUN bun install --frozen-lockfile

# ============================================================================
# STAGE 2: PRODUCTION - Final minimal image
# ============================================================================
FROM oven/bun:1.1.30-slim AS production

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy production dependencies
COPY package.json ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run --bun healthcheck.ts || exit 1

# Add healthcheck script
USER root
RUN echo 'const response = await fetch("http://localhost:3003/health"); \
if (!response.ok) process.exit(1);' > healthcheck.ts && \
    chown nodejs:nodejs healthcheck.ts
USER nodejs

# Start the application
CMD ["bun", "run", "src/index.ts"]

# ============================================================================
# ENVIRONMENT VARIABLES REQUIRED
# ============================================================================
#
# REQUIRED:
# - MIDNIGHT_RPC_URL: Midnight Network RPC endpoint
#
# OPTIONAL:
# - PORT: Server port (default: 3003)
# - NODE_ENV: Environment (default: development)
# - MIDNIGHT_CHAIN_ID: Chain ID (default: midnight-testnet-1)
# - ENABLE_SPOOF_TRANSACTIONS: Enable spoof transactions (default: true)
# - SPOOF_TRANSACTION_RATIO: Ratio of spoof transactions (default: 0.8)
#
# ============================================================================
