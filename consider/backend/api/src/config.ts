/**
 * ============================================================================
 * API GATEWAY CONFIGURATION
 * ============================================================================
 * 
 * Central configuration file for the AgenticDID API Gateway.
 * All environment variables are read here and validated.
 * 
 * DESIGN PHILOSOPHY:
 * - Single source of truth for all configuration
 * - Type-safe: All values properly typed
 * - Validated: Crashes early if misconfigured (fail-fast principle)
 * - Documented: Every config option explained
 * - Environment-aware: Dev vs production behavior
 * 
 * CONFIGURATION SOURCES (in priority order):
 * 1. Environment variables (.env file or system env)
 * 2. Default values (fallbacks for optional settings)
 * 
 * CRITICAL ENVIRONMENT VARIABLES (must be set):
 * - ANTHROPIC_API_KEY: Claude API for agent reasoning
 * - JWT_SECRET: Secret for signing capability tokens
 * 
 * OPTIONAL ENVIRONMENT VARIABLES (have defaults):
 * - PORT: API server port (default: 8787)
 * - NODE_ENV: Environment mode (default: development)
 * - LOG_LEVEL: Logging verbosity (default: info)
 * - CORS_ORIGINS: Allowed origins for CORS (default: * in dev)
 * 
 * RELATED FILES:
 * @see ../../.env - Environment variable definitions
 * @see ./index.ts - Main entry point that uses this config
 * 
 * @module config
 * @author AgenticDID Team
 * @version 2.0.0 (Real Protocol)
 * ============================================================================
 */

/**
 * Helper function to get environment variable with validation
 * 
 * PURPOSE:
 * - Ensures required env vars are present
 * - Provides clear error messages if missing
 * - Supports optional defaults
 * 
 * USAGE:
 * ```typescript
 * const apiKey = getEnvVar('ANTHROPIC_API_KEY'); // Required, throws if missing
 * const port = getEnvVar('PORT', '8787'); // Optional, uses default if missing
 * ```
 * 
 * @param name - Environment variable name
 * @param defaultValue - Optional default if not set
 * @returns The environment variable value
 * @throws Error if required variable is missing
 */
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  
  if (value === undefined) {
    throw new Error(
      `❌ CONFIGURATION ERROR: Environment variable "${name}" is required but not set.\n` +
      `   Please add it to your .env file or set it in your environment.\n` +
      `   See .env.example for the complete list of required variables.`
    );
  }
  
  return value;
}

/**
 * Check if running in development mode
 * 
 * BEHAVIOR:
 * - Development: NODE_ENV === 'development' (or not set)
 * - Production: NODE_ENV === 'production'
 * 
 * IMPACTS:
 * - Logging level (verbose in dev, minimal in prod)
 * - CORS policy (permissive in dev, strict in prod)
 * - Error messages (detailed in dev, generic in prod)
 * - Performance optimizations (disabled in dev for debugging)
 */
export const isDev = process.env.NODE_ENV !== 'production';

/**
 * Main configuration object
 * 
 * STRUCTURE:
 * All configuration grouped by concern:
 * - server: API server settings (port, host, etc.)
 * - security: Security-related settings (JWT, CORS, rate limiting)
 * - services: External service URLs (agents, midnight, tts)
 * - ai: AI/LLM configuration (API keys, models)
 * - logging: Logging and debugging settings
 * 
 * WHY THIS STRUCTURE:
 * - Easy to find related settings
 * - Type-safe access via TypeScript
 * - Clear separation of concerns
 * - Simple to extend with new categories
 */
export const config = {
  /**
   * ========================================
   * SERVER CONFIGURATION
   * ========================================
   * Settings for the Fastify API server
   */
  server: {
    /**
     * Port to listen on
     * 
     * DEFAULT: 8787 (AgenticDID default port)
     * SOURCE: PORT environment variable
     * 
     * NOTE: Port 8787 chosen because:
     * - Not commonly used (avoids conflicts)
     * - Easy to remember (8-7-8-7 pattern)
     * - Same as demo for consistency
     */
    port: parseInt(getEnvVar('PORT', '8787'), 10),
    
    /**
     * Host to bind to
     * 
     * DEFAULT: 0.0.0.0 (all network interfaces)
     * 
     * WHY 0.0.0.0:
     * - Required for Docker containers
     * - Allows external connections
     * - Localhost (127.0.0.1) would only allow local connections
     */
    host: '0.0.0.0',
    
    /**
     * Environment mode
     * 
     * VALUES: 'development' | 'production' | 'test'
     * SOURCE: NODE_ENV environment variable
     * DEFAULT: 'development'
     */
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  },

  /**
   * ========================================
   * SECURITY CONFIGURATION
   * ========================================
   * Settings for JWT tokens, CORS, rate limiting
   */
  security: {
    /**
     * JWT secret for signing capability tokens
     * 
     * SOURCE: JWT_SECRET environment variable
     * REQUIRED: Yes (throws error if missing)
     * 
     * SECURITY:
     * - Must be random and secret
     * - Change in production
     * - Never commit to git
     * 
     * USAGE:
     * - Signs capability tokens issued after VP verification
     * - Verifies tokens when agents make authenticated requests
     */
    jwtSecret: getEnvVar('JWT_SECRET'),
    
    /**
     * Capability token expiration time (in seconds)
     * 
     * DEFAULT: 120 seconds (2 minutes)
     * 
     * RATIONALE:
     * - Short-lived tokens limit exposure
     * - Long enough for agent to complete task
     * - Forces re-authentication for new goals
     * 
     * SECURITY CONSIDERATION:
     * Shorter = more secure but more auth overhead
     * Longer = more convenient but higher risk if stolen
     */
    tokenExpirationSeconds: 120,
    
    /**
     * CORS allowed origins
     * 
     * DEFAULT:
     * - Development: '*' (allow all origins for easy testing)
     * - Production: Specific frontend URL only
     * 
     * SOURCE: CORS_ORIGINS environment variable (comma-separated)
     * 
     * SECURITY:
     * - Development: Permissive for localhost testing
     * - Production: Strict whitelist to prevent CSRF
     */
    corsOrigins: isDev
      ? '*'
      : getEnvVar('CORS_ORIGINS', 'https://agenticdid.vercel.app').split(','),
    
    /**
     * Rate limiting configuration
     * 
     * PURPOSE: Prevent abuse and DDoS attacks
     * 
     * LIMITS:
     * - Max requests per window per IP
     * - Time window for rate limiting
     * 
     * DEFAULTS:
     * - 100 requests per minute per IP
     * 
     * BEHAVIOR:
     * - Returns 429 (Too Many Requests) when exceeded
     * - Resets after time window expires
     */
    rateLimit: {
      max: parseInt(getEnvVar('API_RATE_LIMIT', '100'), 10),
      timeWindow: '1 minute',
    },
  },

  /**
   * ========================================
   * EXTERNAL SERVICES CONFIGURATION
   * ========================================
   * URLs for microservices we depend on
   */
  services: {
    /**
     * Agents Runtime Service URL
     * 
     * PURPOSE: Execute agent logic (Google ADK + Claude)
     * ENDPOINTS: /execute, /health
     * 
     * DEFAULT: http://localhost:3000
     * SOURCE: AGENTS_RUNTIME_URL environment variable
     * 
     * CALL PATTERN:
     * API Gateway → Agents Runtime → Claude API → Response
     * 
     * @see ../../agents-runtime - The service implementation
     */
    agentsRuntimeUrl: getEnvVar('AGENTS_RUNTIME_URL', 'http://localhost:3000'),
    
    /**
     * Midnight Gateway Service URL
     * 
     * PURPOSE: Interface with Midnight Network for ZK proofs
     * ENDPOINTS: /verify-credential, /generate-proof, /health
     * 
     * DEFAULT: http://localhost:3001
     * SOURCE: MIDNIGHT_GATEWAY_URL environment variable
     * 
     * CALL PATTERN:
     * API Gateway → Midnight Gateway → Midnight Network → Response
     * 
     * @see ../../services/midnight-gateway - The service implementation
     */
    midnightGatewayUrl: getEnvVar('MIDNIGHT_GATEWAY_URL', 'http://localhost:3001'),
    
    /**
     * TTS (Text-to-Speech) Service URL
     * 
     * PURPOSE: Generate audio for Listen In Mode
     * ENDPOINTS: /synthesize, /health
     * 
     * DEFAULT: http://localhost:3002
     * SOURCE: TTS_SERVICE_URL environment variable
     * 
     * CALL PATTERN:
     * API Gateway → TTS Service → Google Cloud TTS → Audio
     * 
     * @see ../../services/tts-service - The service implementation
     */
    ttsServiceUrl: getEnvVar('TTS_SERVICE_URL', 'http://localhost:3002'),
  },

  /**
   * ========================================
   * AI/LLM CONFIGURATION
   * ========================================
   * Settings for AI agents and language models
   */
  ai: {
    /**
     * Anthropic Claude API Key
     * 
     * SOURCE: ANTHROPIC_API_KEY environment variable
     * REQUIRED: Yes (critical for agent reasoning)
     * 
     * USAGE:
     * - Passed to agents runtime service
     * - Used for Claude Opus 4 API calls
     * - Enables extended thinking mode
     * 
     * SECURITY:
     * - Never log or expose this key
     * - Keep in .env file only
     * - Rotate periodically
     */
    anthropicApiKey: getEnvVar('ANTHROPIC_API_KEY'),
    
    /**
     * Default AI model for agents
     * 
     * DEFAULT: claude-opus-4-20250514
     * SOURCE: DEFAULT_AGENT_MODEL environment variable
     * 
     * WHY CLAUDE OPUS 4:
     * - Best reasoning capabilities
     * - Extended thinking mode (10K tokens)
     * - Excellent at complex agent tasks
     * - Production-ready as of Nov 2025
     */
    defaultModel: getEnvVar('DEFAULT_AGENT_MODEL', 'claude-opus-4-20250514'),
    
    /**
     * Enable Listen In Mode (TTS)
     * 
     * DEFAULT: true (enabled)
     * SOURCE: ENABLE_LISTEN_IN_MODE environment variable
     * 
     * WHEN ENABLED:
     * - Agent communication is synthesized to speech
     * - Users can hear agents "thinking"
     * - Transparency feature for trust
     * 
     * WHEN DISABLED:
     * - Text-only agent communication
     * - Lower latency
     * - No TTS API calls
     */
    listenInModeEnabled: getEnvVar('ENABLE_LISTEN_IN_MODE', 'true') === 'true',
  },

  /**
   * ========================================
   * LOGGING CONFIGURATION
   * ========================================
   * Settings for application logging
   */
  logging: {
    /**
     * Log level
     * 
     * LEVELS: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
     * 
     * DEFAULT:
     * - Development: 'info' (verbose for debugging)
     * - Production: 'warn' (only warnings and errors)
     * 
     * SOURCE: LOG_LEVEL environment variable
     * 
     * RECOMMENDATION:
     * - Development: 'info' or 'debug'
     * - Staging: 'info'
     * - Production: 'warn'
     */
    level: getEnvVar('LOG_LEVEL', isDev ? 'info' : 'warn') as 
      'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    
    /**
     * Enable debug logs
     * 
     * DEFAULT: false (disabled in production)
     * SOURCE: ENABLE_DEBUG_LOGS environment variable
     * 
     * WHEN ENABLED:
     * - Extra verbose logging
     * - Request/response bodies logged
     * - Performance metrics included
     * 
     * WARNING:
     * - May log sensitive data
     * - Impacts performance
     * - Only use in development/debugging
     */
    debugEnabled: getEnvVar('ENABLE_DEBUG_LOGS', 'false') === 'true',
  },
};

/**
 * ============================================================================
 * CONFIGURATION VALIDATION
 * ============================================================================
 * 
 * Validate configuration on startup to fail fast if misconfigured.
 * Better to crash immediately than fail mysteriously later.
 */

/**
 * Validate port number is valid
 */
if (config.server.port < 1 || config.server.port > 65535) {
  throw new Error(`Invalid port number: ${config.server.port}. Must be between 1 and 65535.`);
}

/**
 * Validate JWT secret is set and not the default example value
 */
if (config.security.jwtSecret === 'your-super-secret-key-change-this') {
  throw new Error(
    '❌ SECURITY ERROR: JWT_SECRET is still set to the example value.\n' +
    '   Please change it to a random secret value in your .env file.\n' +
    '   You can generate one with: openssl rand -base64 32'
  );
}

/**
 * Warn if JWT secret is too short (security best practice)
 */
if (config.security.jwtSecret.length < 32) {
  console.warn(
    '⚠️  WARNING: JWT_SECRET is shorter than 32 characters.\n' +
    '   For better security, use a longer secret (at least 32 characters).\n' +
    '   You can generate one with: openssl rand -base64 32'
  );
}

/**
 * Log configuration summary on startup (excluding secrets)
 * 
 * PURPOSE:
 * - Confirm configuration loaded correctly
 * - Help with debugging deployment issues
 * - Document runtime environment
 */
console.log('✅ Configuration loaded successfully:');
console.log(`   Environment: ${config.server.nodeEnv}`);
console.log(`   Port: ${config.server.port}`);
console.log(`   CORS Origins: ${isDev ? '*' : Array.isArray(config.security.corsOrigins) ? config.security.corsOrigins.join(', ') : config.security.corsOrigins}`);
console.log(`   Agents Runtime: ${config.services.agentsRuntimeUrl}`);
console.log(`   Midnight Gateway: ${config.services.midnightGatewayUrl}`);
console.log(`   TTS Service: ${config.services.ttsServiceUrl}`);
console.log(`   Listen In Mode: ${config.ai.listenInModeEnabled ? 'Enabled' : 'Disabled'}`);
console.log(`   Log Level: ${config.logging.level}`);

/**
 * Export helper for checking environment
 */
export const isProduction = config.server.nodeEnv === 'production';
export const isTest = config.server.nodeEnv === 'test';

/**
 * ============================================================================
 * END OF CONFIGURATION
 * ============================================================================
 */
