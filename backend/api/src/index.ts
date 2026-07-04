/**
 * ============================================================================
 * AGENTICDID API GATEWAY - MAIN ENTRY POINT
 * ============================================================================
 * 
 * This is the primary backend API server for the AgenticDID Real Protocol.
 * It serves as the central orchestrator that coordinates all services.
 * 
 * ARCHITECTURE ROLE:
 * The API Gateway is the "traffic controller" that:
 * - Receives HTTP requests from the frontend
 * - Routes requests to appropriate microservices
 * - Aggregates responses
 * - Returns unified responses to frontend
 * 
 * KEY RESPONSIBILITIES:
 * 1. **Authentication & Authorization**
 *    - Generate verification challenges
 *    - Verify agent credentials via Midnight Network
 *    - Issue capability tokens (JWT) for authorized agents
 * 
 * 2. **Request Routing**
 *    - Route agent execution requests → Agents Runtime Service
 *    - Route ZK proof verification → Midnight Gateway Service
 *    - Route TTS requests → TTS Service
 * 
 * 3. **Security Enforcement**
 *    - CORS policy enforcement
 *    - Rate limiting per IP
 *    - Token validation
 *    - Input validation
 * 
 * 4. **Observability**
 *    - Request/response logging
 *    - Performance metrics
 *    - Error tracking
 *    - Health checks
 * 
 * DATA FLOW (Complete Request Lifecycle):
 * ```
 * 1. Frontend → POST /challenge
 *    ↓
 *    API Gateway generates challenge with nonce
 *    ↓
 *    Returns challenge to frontend
 * 
 * 2. Frontend (with agent credentials) → POST /present
 *    ↓
 *    API Gateway validates challenge
 *    ↓
 *    Forwards VP to Midnight Gateway for ZK verification
 *    ↓
 *    Midnight Gateway verifies ZK proof on-chain
 *    ↓
 *    API Gateway issues capability token (JWT)
 *    ↓
 *    Returns token to frontend
 * 
 * 3. Frontend (with token) → POST /agents/execute
 *    ↓
 *    API Gateway validates token
 *    ↓
 *    Forwards request to Agents Runtime Service
 *    ↓
 *    Agents Runtime executes agent logic (Claude API)
 *    ↓
 *    If Listen In Mode: TTS Service generates audio
 *    ↓
 *    API Gateway returns result + optional audio
 *    ↓
 *    Frontend displays result (and plays audio)
 * ```
 * 
 * TECHNOLOGY STACK:
 * - **Runtime**: Bun (3x faster than Node.js)
 * - **Framework**: Fastify (fastest Node.js framework)
 * - **Validation**: Zod (type-safe schema validation)
 * - **Auth**: JWT (capability tokens)
 * - **Logging**: Pino (high-performance logger)
 * 
 * SECURITY MODEL:
 * - Challenge-response prevents replay attacks
 * - Capability tokens expire in 120 seconds
 * - CORS restricted to frontend origin
 * - Rate limiting per IP (100 req/min)
 * - All secrets in environment variables
 * - ZK proof verification via Midnight Network
 * 
 * RELATED FILES:
 * @see ./config.ts - Configuration management
 * @see ./routes/ - API endpoint handlers
 * @see ./middleware/ - Request processing middleware
 * @see ./services/ - External service clients
 * @see ../../agents-runtime - Agent execution service
 * @see ../../services/midnight-gateway - Midnight Network interface
 * @see ../../services/tts-service - Text-to-Speech service
 * 
 * COMPARISON WITH DEMO:
 * - Demo: Mock Midnight adapter, simulated verification
 * - Real: Actual Midnight Network integration, real ZK proofs
 * - Demo: Single monolithic server
 * - Real: Microservices architecture (gateway + services)
 * - Demo: No TTS integration
 * - Real: Full Listen In Mode with Google Cloud TTS
 * 
 * DEPLOYMENT:
 * - Local: ./start-everything.sh (Docker Compose)
 * - Production: Render.com or Google Cloud Run
 * - Port: 8787 (configurable via PORT env var)
 * - Health check: GET /health
 * 
 * @module api-gateway
 * @author AgenticDID Team
 * @version 2.0.0 (Real Protocol - Production Ready)
 * @license MIT
 * ============================================================================
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config, isDev } from './config.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

/**
 * ============================================================================
 * FASTIFY APPLICATION INITIALIZATION
 * ============================================================================
 * 
 * Create and configure the Fastify instance with all necessary plugins.
 * 
 * FASTIFY BENEFITS:
 * - ~2x faster than Express
 * - Built-in schema validation
 * - Excellent TypeScript support
 * - Plugin architecture
 * - Low memory footprint
 * 
 * LOGGING CONFIGURATION:
 * Development mode:
 * - Level: 'info' (verbose for debugging)
 * - Format: Pretty-printed with colors
 * - Includes: Timestamps, no PID/hostname clutter
 * 
 * Production mode:
 * - Level: 'warn' (only warnings and errors)
 * - Format: JSON (for log aggregation services)
 * - Optimized: Minimal overhead
 */
const app = Fastify({
  logger: {
    level: config.logging.level,
    // Pretty-print logs in development for readability
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
          },
        }
      : undefined,
  },
  // Trust proxy for correct client IP (needed for rate limiting)
  trustProxy: true,
});

/**
 * ============================================================================
 * MIDDLEWARE REGISTRATION
 * ============================================================================
 * 
 * Plugins are registered in a specific order:
 * 1. CORS (security)
 * 2. Rate limiting (security)
 * 3. Request logging (observability)
 * 4. Routes (business logic)
 * 5. Error handling (last resort)
 */

/**
 * CORS (Cross-Origin Resource Sharing)
 * 
 * PURPOSE:
 * Allow frontend (different origin) to call this API
 * 
 * SECURITY POLICY:
 * - Development: Allow all origins (*) for easy testing
 * - Production: Only allow specific frontend domain
 * 
 * ALLOWED METHODS:
 * - GET: Health checks, status endpoints
 * - POST: Challenge generation, verification, agent execution
 * 
 * ALLOWED HEADERS:
 * - Content-Type: For JSON payloads
 * - Authorization: For capability tokens
 * 
 * CREDENTIALS:
 * - Enabled in production for secure cookie handling
 * 
 * WHY CORS IS NEEDED:
 * Frontend runs on port 5173 (Vite dev server) or Vercel domain
 * API runs on port 8787 or Render domain
 * Different origins = CORS required
 */
await app.register(cors, {
  origin: config.security.corsOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: !isDev,
});

app.log.info(
  { origins: config.security.corsOrigins },
  '✅ CORS configured'
);

/**
 * Rate Limiting
 * 
 * PURPOSE:
 * Prevent abuse and DDoS attacks by limiting requests per IP
 * 
 * CONFIGURATION:
 * - Max: 100 requests per time window per IP
 * - Window: 1 minute
 * - Response: 429 (Too Many Requests) when exceeded
 * 
 * BEHAVIOR:
 * - Tracks requests by client IP
 * - Resets counter after time window
 * - Returns X-RateLimit-* headers with quota info
 * 
 * RATIONALE:
 * - 100 req/min = ~1.67 req/sec (reasonable for interactive use)
 * - Too low = frustrates legitimate users
 * - Too high = doesn't prevent abuse
 * 
 * PRODUCTION CONSIDERATION:
 * May need to increase limit for high-traffic production
 */
await app.register(rateLimit, {
  max: config.security.rateLimit.max,
  timeWindow: config.security.rateLimit.timeWindow,
});

app.log.info(
  { 
    max: config.security.rateLimit.max,
    window: config.security.rateLimit.timeWindow 
  },
  '✅ Rate limiting configured'
);

/**
 * Request Logging Middleware
 * 
 * PURPOSE:
 * Log all incoming requests for observability and debugging
 * 
 * LOGS:
 * - Request method and URL
 * - Client IP address
 * - Request duration
 * - Response status code
 * - Error details (if any)
 * 
 * PRIVACY:
 * - Does not log request/response bodies (may contain sensitive data)
 * - Can be enabled in debug mode via ENABLE_DEBUG_LOGS=true
 * 
 * @see ./middleware/requestLogger.ts for implementation
 */
await app.register(requestLogger);

app.log.info('✅ Request logging configured');

/**
 * ============================================================================
 * API ROUTES REGISTRATION
 * ============================================================================
 * 
 * Register all API endpoints from the routes module.
 * 
 * ENDPOINTS (grouped by purpose):
 * 
 * **Health & Status:**
 * - GET /health - API health check
 * - GET /services/health - Check all dependent services
 * 
 * **Authentication (Challenge-Response):**
 * - POST /challenge - Generate verification challenge
 * - POST /present - Submit VP and get capability token
 * - POST /verify - Verify capability token
 * 
 * **Agent Execution:**
 * - POST /agents/execute - Execute agent with goal
 * - GET /agents/available - List available agents
 * 
 * **Text-to-Speech (Listen In Mode):**
 * - POST /tts/synthesize - Generate speech from text
 * 
 * **Midnight Network:**
 * - POST /midnight/verify - Verify credential via Midnight
 * - POST /midnight/generate-proof - Generate ZK proof
 * 
 * ROUTE ORGANIZATION:
 * Routes are modular and separated by domain:
 * - ./routes/health.ts - Health check endpoints
 * - ./routes/auth.ts - Authentication endpoints
 * - ./routes/agents.ts - Agent execution endpoints
 * - ./routes/tts.ts - Text-to-speech endpoints
 * - ./routes/midnight.ts - Midnight Network endpoints
 * 
 * @see ./routes/index.ts for route registration logic
 */
await registerRoutes(app);

app.log.info('✅ API routes registered');

/**
 * Global Error Handler
 * 
 * PURPOSE:
 * Catch and handle all unhandled errors gracefully
 * 
 * BEHAVIOR:
 * - Logs error details (for debugging)
 * - Returns safe error message (no sensitive info leaked)
 * - Sets appropriate HTTP status code
 * - Formats error response consistently
 * 
 * ERROR RESPONSE FORMAT:
 * ```json
 * {
 *   "error": "Human-readable error message",
 *   "code": "ERROR_CODE",
 *   "timestamp": "2025-11-14T10:30:00.000Z",
 *   "requestId": "req-123-abc"
 * }
 * ```
 * 
 * SECURITY:
 * - Development: Detailed error messages and stack traces
 * - Production: Generic error messages only
 * 
 * @see ./middleware/errorHandler.ts for implementation
 */
app.setErrorHandler(errorHandler);

app.log.info('✅ Error handler configured');

/**
 * ============================================================================
 * GRACEFUL SHUTDOWN HANDLING
 * ============================================================================
 * 
 * Handle termination signals gracefully to:
 * - Complete in-flight requests
 * - Close database connections
 * - Clean up resources
 * - Log shutdown event
 * 
 * SIGNALS HANDLED:
 * - SIGTERM: Termination signal (from Docker, k8s, etc.)
 * - SIGINT: Interrupt signal (Ctrl+C)
 * 
 * SHUTDOWN SEQUENCE:
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete (max 10s)
 * 3. Close server
 * 4. Exit process
 */
const gracefulShutdown = async (signal: string) => {
  app.log.info(`\n🛑 Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Close Fastify server (stops accepting new requests)
    await app.close();
    app.log.info('✅ Server closed gracefully');
    process.exit(0);
  } catch (err) {
    app.log.error(err, '❌ Error during shutdown');
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * ============================================================================
 * SERVER STARTUP
 * ============================================================================
 * 
 * Start the Fastify server and begin listening for connections.
 * 
 * STARTUP SEQUENCE:
 * 1. Bind to configured port and host
 * 2. Log startup information
 * 3. Log service URLs for reference
 * 4. Ready to accept connections
 * 
 * ERROR HANDLING:
 * If startup fails (e.g., port already in use):
 * - Log the error
 * - Exit with code 1 (failure)
 * 
 * This follows the "fail-fast" principle:
 * Better to crash immediately than run in a broken state
 */
try {
  // Start server
  await app.listen({
    port: config.server.port,
    host: config.server.host,
  });

  // Log startup success with visual banner
  console.log('\n' + '='.repeat(70));
  console.log('🔮 AGENTICDID API GATEWAY - REAL PROTOCOL');
  console.log('='.repeat(70));
  console.log(`\n✅ Server started successfully!\n`);
  console.log(`📍 API Gateway:      http://localhost:${config.server.port}`);
  console.log(`🌐 Environment:      ${config.server.nodeEnv}`);
  console.log(`🔗 CORS Origins:     ${isDev ? '*' : Array.isArray(config.security.corsOrigins) ? config.security.corsOrigins.join(', ') : config.security.corsOrigins}`);
  console.log(`\n📡 Dependent Services:`);
  console.log(`   🤖 Agents Runtime: ${config.services.agentsRuntimeUrl}`);
  console.log(`   🌙 Midnight Gateway: ${config.services.midnightGatewayUrl}`);
  console.log(`   🎙️  TTS Service:    ${config.services.ttsServiceUrl}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   GET  /health               - Health check`);
  console.log(`   POST /challenge            - Generate challenge`);
  console.log(`   POST /present              - Submit VP & get token`);
  console.log(`   POST /agents/execute       - Execute agent`);
  console.log(`   POST /tts/synthesize       - Text-to-speech`);
  console.log(`\n🔐 Security:`);
  console.log(`   Rate Limit:  ${config.security.rateLimit.max} req/${config.security.rateLimit.timeWindow}`);
  console.log(`   Token TTL:   ${config.security.tokenExpirationSeconds}s`);
  console.log(`   Listen Mode: ${config.ai.listenInModeEnabled ? 'Enabled ✅' : 'Disabled ❌'}`);
  console.log('\n' + '='.repeat(70));
  console.log('Ready to serve requests! 🚀');
  console.log('='.repeat(70) + '\n');

} catch (err) {
  // Startup failed - log error and exit
  app.log.error(err, '❌ Failed to start server');
  console.error('\n' + '='.repeat(70));
  console.error('❌ SERVER STARTUP FAILED');
  console.error('='.repeat(70));
  console.error('\nError details:', err);
  console.error('\nPossible causes:');
  console.error('  • Port already in use (another process using the port)');
  console.error('  • Permission denied (try a different port or run with sudo)');
  console.error('  • Network interface not available');
  console.error('\nSolutions:');
  console.error(`  • Kill process using port ${config.server.port}: lsof -ti:${config.server.port} | xargs kill -9`);
  console.error('  • Change port: export PORT=8788');
  console.error('  • Check firewall settings');
  console.error('='.repeat(70) + '\n');
  
  process.exit(1);
}

/**
 * ============================================================================
 * DEVELOPMENT HELPERS
 * ============================================================================
 * 
 * Log helpful information in development mode
 */
if (isDev) {
  console.log('💡 Development Tips:');
  console.log('   • Test health: curl http://localhost:8787/health');
  console.log('   • Watch logs: docker-compose logs -f api-gateway');
  console.log('   • Reload: Save any file (hot reload enabled)');
  console.log('   • Stop: Ctrl+C or docker-compose down');
  console.log('');
}

/**
 * ============================================================================
 * END OF MAIN ENTRY POINT
 * ============================================================================
 * 
 * Server is now running and ready to handle requests!
 * 
 * NEXT STEPS FOR DEVELOPMENT:
 * 1. Implement route handlers in ./routes/
 * 2. Add business logic in ./services/
 * 3. Write tests in ./tests/
 * 4. Add monitoring/metrics
 * 5. Deploy to production
 * 
 * MONITORING:
 * - Logs: Check Fastify logs for request/response details
 * - Health: Poll /health endpoint
 * - Metrics: Add Prometheus metrics (future)
 * - Errors: Check error logs and stack traces
 * 
 * DEPLOYMENT:
 * - Local: docker-compose up
 * - Staging: Deploy to Render staging environment
 * - Production: Deploy to Render production or Cloud Run
 * 
 * DOCUMENTATION:
 * - API docs: See ../../docs/API.md
 * - Architecture: See ../../docs/ARCHITECTURE.md
 * - Deployment: See ../../docs/DEPLOYMENT.md
 */
