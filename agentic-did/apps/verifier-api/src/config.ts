/**
 * ============================================================================
 * VERIFIER API CONFIGURATION
 * ============================================================================
 * 
 * Centralized configuration for the verifier API server.
 * All settings loaded from environment variables with sensible defaults.
 * 
 * CONFIGURATION SOURCES:
 * 1. .env file (loaded by dotenv)
 * 2. Environment variables (override .env)
 * 3. Default values (fallback if not set)
 * 
 * SECURITY NOTES:
 * - Never commit .env files to git
 * - Change JWT_SECRET in production
 * - Use environment-specific .env files (.env.development, .env.production)
 * 
 * @see ../../.env.example - Template for environment variables
 * ============================================================================
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object
 * All values typed and parsed for type safety
 */
export const config = {
  /**
   * Server Port
   * Default: 8787 (chosen to not conflict with common ports)
   * 
   * USAGE:
   * - Development: 8787 (localhost)
   * - Docker: Maps to container port via docker-compose
   * - Production: Set via PORT environment variable
   */
  port: parseInt(process.env.PORT || '8787', 10),

  /**
   * JWT Secret for signing capability tokens
   * 
   * SECURITY CRITICAL:
   * - Default 'dev-only-secret' is for development ONLY
   * - MUST be changed in production to long random string
   * - Used to sign and verify capability tokens
   * - If compromised, attackers can forge tokens
   * 
   * GENERATE SECURE SECRET:
   * openssl rand -base64 32
   */
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',

  /**
   * Token Time-To-Live in seconds
   * Default: 120 seconds (2 minutes)
   * 
   * WHY SHORT TTL:
   * - Limits window for token theft/reuse
   * - Forces re-verification for longer sessions
   * - Balances security vs user experience
   * 
   * TYPICAL VALUES:
   * - Demo: 120s (current)
   * - Production: 300-600s (5-10 minutes)
   */
  tokenTTL: parseInt(process.env.TOKEN_TTL_SECONDS || '120', 10),

  /**
   * Midnight Adapter URL
   * Default: http://localhost:8788
   * 
   * DEMO MODE:
   * Currently points to MOCK adapter (doesn't actually exist as separate service)
   * Mock adapter is integrated directly in this codebase
   * 
   * PRODUCTION MODE:
   * Will point to real Midnight proof server
   * Example: https://proof-server.midnight.network
   */
  midnightAdapterUrl: process.env.MIDNIGHT_ADAPTER_URL || 'http://localhost:8788',

  /**
   * Node Environment
   * Values: 'development' | 'production' | 'test'
   * 
   * AFFECTS:
   * - Logging verbosity
   * - CORS policy
   * - Error detail exposure
   * - Performance optimizations
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * JWT Issuer Claim
   * Identifies who issued the capability token
   * 
   * USAGE:
   * - Included in JWT 'iss' claim
   * - Verified by services accepting tokens
   * - Should match your domain in production
   */
  issuer: process.env.ISSUER || 'https://agenticdid.io',
};

/**
 * Convenience flag for development mode checks
 * 
 * USAGE:
 * if (isDev) {
 *   // Enable verbose logging, allow CORS from anywhere, etc.
 * }
 */
export const isDev = config.nodeEnv === 'development';
