/**
 * ============================================================================
 * AGENTS RUNTIME - CONFIGURATION
 * ============================================================================
 * 
 * Centralized configuration for the Agents Runtime service.
 * 
 * PURPOSE:
 * This service executes AI agents using Google ADK framework and Claude API.
 * Configuration manages API keys, agent behaviors, and service settings.
 * 
 * KEY RESPONSIBILITIES:
 * - Load and validate environment variables
 * - Configure Google ADK and Claude API clients
 * - Set agent execution parameters
 * - Define TTS integration settings
 * - Manage logging and server configuration
 * 
 * CONFIGURATION SOURCES:
 * 1. Environment variables (.env file)
 * 2. Defaults (for development)
 * 3. Runtime overrides (for testing)
 * 
 * DESIGN PHILOSOPHY:
 * - Fail-fast: Invalid config = crash on startup (not at runtime)
 * - Type-safe: Use Zod for validation
 * - Clear errors: Tell user exactly what's wrong
 * - Documented: Every setting explained
 * 
 * RELATED FILES:
 * @see src/index.ts - Uses this config to start server
 * @see src/claude-client.ts - Uses Claude API configuration
 * @see src/adk-integration.ts - Uses Google ADK configuration
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// ENVIRONMENT VARIABLE HELPERS
// ============================================================================

/**
 * Get environment variable or throw error if missing
 * 
 * PURPOSE:
 * Fail-fast approach - if required config is missing, we crash immediately
 * with a clear error message rather than failing mysteriously later.
 */
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
      `   Please add ${name} to your .env file`
    );
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Get numeric environment variable
 */
function getNumberEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`❌ Invalid number for ${name}: ${value}`);
  }
  return parsed;
}

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

/**
 * Zod schema for validating entire configuration
 * 
 * PURPOSE:
 * Type-safe validation of all config values at startup.
 * Catches configuration errors before they cause runtime issues.
 */
const configSchema = z.object({
  // Server configuration
  server: z.object({
    port: z.number().int().min(1000).max(65535),
    host: z.string(),
    nodeEnv: z.enum(['development', 'production', 'test']),
  }),

  // Claude API configuration
  claude: z.object({
    apiKey: z.string().min(1),
    model: z.string(),
    maxTokens: z.number().int().positive(),
    temperature: z.number().min(0).max(1),
    useExtendedThinking: z.boolean(),
  }),

  // Google ADK configuration (placeholder - will expand in implementation)
  adk: z.object({
    enabled: z.boolean(),
    projectId: z.string().optional(),
    region: z.string(),
  }),

  // TTS Service integration
  tts: z.object({
    enabled: z.boolean(),
    serviceUrl: z.string().url(),
    timeout: z.number().int().positive(),
  }),

  // Agent execution settings
  agents: z.object({
    executionTimeout: z.number().int().positive(),
    maxConcurrent: z.number().int().positive(),
    retryAttempts: z.number().int().nonnegative(),
  }),

  // Logging configuration
  logging: z.object({
    level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
    pretty: z.boolean(),
  }),
});

// ============================================================================
// BUILD CONFIGURATION
// ============================================================================

/**
 * Determine environment
 */
const nodeEnv = getOptionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test';
const isDev = nodeEnv === 'development';

/**
 * Build configuration object from environment variables
 * 
 * LOADING ORDER:
 * 1. Try to load from environment
 * 2. Fall back to sensible defaults
 * 3. Validate with Zod schema
 * 4. Throw detailed error if invalid
 */
const config = configSchema.parse({
  // Server configuration
  server: {
    port: getNumberEnv('PORT', 3001),
    host: getOptionalEnv('HOST', '0.0.0.0'),
    nodeEnv,
  },

  // Claude API configuration
  // Using Claude Opus 4 with extended thinking for complex reasoning
  claude: {
    apiKey: getEnvVar('ANTHROPIC_API_KEY'),
    model: getOptionalEnv('CLAUDE_MODEL', 'claude-opus-4-20250514'),
    maxTokens: getNumberEnv('CLAUDE_MAX_TOKENS', 4096),
    temperature: parseFloat(getOptionalEnv('CLAUDE_TEMPERATURE', '1.0')),
    useExtendedThinking: getBooleanEnv('CLAUDE_EXTENDED_THINKING', true),
  },

  // Google ADK configuration
  // Note: For hackathon, ADK is required. For MVP, it's optional.
  adk: {
    enabled: getBooleanEnv('ADK_ENABLED', true),
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    region: getOptionalEnv('ADK_REGION', 'us-central1'),
  },

  // TTS Service integration (for Listen In Mode)
  tts: {
    enabled: getBooleanEnv('TTS_ENABLED', true),
    serviceUrl: getOptionalEnv('TTS_SERVICE_URL', 'http://tts:3003'),
    timeout: getNumberEnv('TTS_TIMEOUT', 15000),
  },

  // Agent execution settings
  agents: {
    executionTimeout: getNumberEnv('AGENT_TIMEOUT', 60000), // 60 seconds
    maxConcurrent: getNumberEnv('MAX_CONCURRENT_AGENTS', 10),
    retryAttempts: getNumberEnv('AGENT_RETRY_ATTEMPTS', 2),
  },

  // Logging configuration
  logging: {
    level: getOptionalEnv('LOG_LEVEL', isDev ? 'debug' : 'info') as any,
    pretty: getBooleanEnv('LOG_PRETTY', isDev),
  },
});

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

/**
 * Log configuration summary on startup (excluding secrets)
 * 
 * PURPOSE:
 * - Confirm configuration loaded correctly
 * - Help with debugging deployment issues
 * - Document runtime environment
 */
console.log('✅ Agents Runtime configuration loaded:');
console.log(`   Environment: ${config.server.nodeEnv}`);
console.log(`   Port: ${config.server.port}`);
console.log(`   Claude Model: ${config.claude.model}`);
console.log(`   Extended Thinking: ${config.claude.useExtendedThinking ? 'Enabled' : 'Disabled'}`);
console.log(`   Google ADK: ${config.adk.enabled ? 'Enabled' : 'Disabled'}`);
console.log(`   TTS Integration: ${config.tts.enabled ? 'Enabled' : 'Disabled'}`);
console.log(`   Agent Timeout: ${config.agents.executionTimeout}ms`);
console.log(`   Log Level: ${config.logging.level}`);

/**
 * Export helper for checking environment
 */
export const isProduction = config.server.nodeEnv === 'production';
export const isDevelopment = config.server.nodeEnv === 'development';
export const isTest = config.server.nodeEnv === 'test';

/**
 * ============================================================================
 * CONFIGURATION OBJECT - READY TO USE
 * ============================================================================
 */
export { config };
export default config;

/**
 * ============================================================================
 * CONFIGURATION NOTES
 * ============================================================================
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - ANTHROPIC_API_KEY: Claude API key (get from console.anthropic.com)
 * 
 * OPTIONAL ENVIRONMENT VARIABLES (with defaults):
 * - PORT: Server port (default: 3001)
 * - HOST: Server host (default: 0.0.0.0)
 * - NODE_ENV: Environment (default: development)
 * - CLAUDE_MODEL: Claude model (default: claude-opus-4-20250514)
 * - CLAUDE_MAX_TOKENS: Max output tokens (default: 4096)
 * - CLAUDE_TEMPERATURE: Sampling temperature (default: 1.0)
 * - CLAUDE_EXTENDED_THINKING: Enable extended thinking (default: true)
 * - ADK_ENABLED: Enable Google ADK (default: true)
 * - GOOGLE_CLOUD_PROJECT: GCP project ID (optional)
 * - ADK_REGION: ADK region (default: us-central1)
 * - TTS_ENABLED: Enable TTS integration (default: true)
 * - TTS_SERVICE_URL: TTS service URL (default: http://tts:3003)
 * - TTS_TIMEOUT: TTS request timeout (default: 15000)
 * - AGENT_TIMEOUT: Agent execution timeout (default: 60000)
 * - MAX_CONCURRENT_AGENTS: Max concurrent executions (default: 10)
 * - AGENT_RETRY_ATTEMPTS: Retry failed executions (default: 2)
 * - LOG_LEVEL: Logging verbosity (default: debug in dev, info in prod)
 * - LOG_PRETTY: Pretty print logs (default: true in dev)
 * 
 * SECURITY NOTES:
 * - Never commit .env files with real API keys
 * - Use environment-specific .env files (.env.development, .env.production)
 * - Rotate API keys regularly
 * - Use secret management in production (not .env files)
 * 
 * ============================================================================
 */
