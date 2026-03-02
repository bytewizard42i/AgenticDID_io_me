# ============================================================================
# AGENTS RUNTIME - DOCKERFILE
# ============================================================================
#
# Multi-stage Docker build for the AgenticDID Agents Runtime service.
#
# PURPOSE:
# Containerize the Agents Runtime service that executes AI agents using
# Google ADK and Claude API.
#
# BUILD STAGES:
# 1. base: Install dependencies
# 2. production: Final minimal image
#
# USAGE:
#   docker build -t agenticdid-agents:latest .
#   docker run -p 3001:3001 --env-file .env agenticdid-agents:latest
#
# RELATED FILES:
# @see docker-compose.yml - Orchestrates this with other services
# @see package.json - Defines dependencies
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
COPY package.json bun.lockb* ./

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

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun run --bun healthcheck.ts || exit 1

# Add healthcheck script
USER root
RUN echo 'const response = await fetch("http://localhost:3001/health"); \
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
# - ANTHROPIC_API_KEY: Claude API key
#
# OPTIONAL:
# - PORT: Server port (default: 3001)
# - NODE_ENV: Environment (default: development)
# - CLAUDE_MODEL: Claude model (default: claude-opus-4-20250514)
# - ADK_ENABLED: Enable Google ADK (default: true)
# - TTS_ENABLED: Enable TTS integration (default: true)
# - TTS_SERVICE_URL: TTS service URL (default: http://tts:3003)
#
# See src/config.ts for full list of configuration options
#
# ============================================================================
