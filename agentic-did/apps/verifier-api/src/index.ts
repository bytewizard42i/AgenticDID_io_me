/**
 * ============================================================================
 * VERIFIER API - MAIN ENTRY POINT
 * ============================================================================
 * 
 * This is the backend API server for AgenticDID verification. It serves as
 * the "Midnight Gatekeeper" - validating agent credentials and issuing
 * capability tokens.
 * 
 * KEY RESPONSIBILITIES:
 * - Generate verification challenges for agents
 * - Verify agent credentials and proofs (via Midnight adapter)
 * - Issue short-lived capability tokens for authorized agents
 * - Provide health check endpoints
 * 
 * DATA FLOW:
 * 1. Frontend requests challenge → /challenge endpoint
 * 2. Agent builds proof with challenge
 * 3. Frontend submits VP (verifiable presentation) → /verify endpoint
 * 4. Backend validates via Midnight adapter
 * 5. Backend issues capability token if valid
 * 6. Frontend uses token to execute goal
 * 
 * TECHNOLOGY STACK:
 * - Fastify: Fast web framework (chosen for performance)
 * - Bun: JavaScript runtime (faster than Node.js)
 * - JWT: Capability token format
 * - CORS: Cross-origin requests from frontend
 * 
 * SECURITY MODEL:
 * - Challenge-response prevents replay attacks
 * - Capability tokens expire in 120 seconds
 * - CORS restricted in production
 * - All verification logic delegated to Midnight adapter
 * 
 * DEMO MODE:
 * Currently uses MOCK Midnight adapter for hackathon demo.
 * Production will integrate real Midnight Network SDK.
 * 
 * @see ./routes.ts - API endpoint definitions
 * @see ./verifier.ts - VP verification logic
 * @see ../../../packages/midnight-adapter - Midnight integration (MOCK)
 * 
 * @author AgenticDID.io Team
 * @version 1.0.0 (Hackathon Demo)
 * ============================================================================
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, isDev } from './config.js';
import { registerRoutes } from './routes.js';

/**
 * Initialize Fastify application with logging configuration
 * 
 * LOGGER CONFIGURATION:
 * - Development: Verbose "info" level with pretty-printing (colored output)
 * - Production: "warn" level only with JSON output (for log aggregation)
 * 
 * WHY FASTIFY:
 * - ~50% faster than Express
 * - Built-in schema validation
 * - Excellent TypeScript support
 * - Low overhead for simple APIs like ours
 */
const app = Fastify({
  logger: {
    level: isDev ? 'info' : 'warn',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

/**
 * Configure CORS (Cross-Origin Resource Sharing)
 * 
 * SECURITY POLICY:
 * - Development: Allow all origins (*) for easy testing
 * - Production: Only allow https://agenticdid.io
 * 
 * ALLOWED METHODS:
 * - GET: Health checks, status endpoints
 * - POST: Challenge generation, verification, token issuance
 * 
 * WHY CORS IS NEEDED:
 * Frontend (port 5175) needs to call API (port 8787) - different origins
 */
await app.register(cors, {
  origin: isDev ? '*' : ['https://agenticdid.io'],
  methods: ['GET', 'POST'],
});

/**
 * Register all API routes
 * 
 * ENDPOINTS REGISTERED:
 * - POST /challenge - Generate verification challenge
 * - POST /verify - Verify VP and get capability token
 * - GET /health - Server health check
 * 
 * @see ./routes.ts for detailed endpoint documentation
 */
await registerRoutes(app);

/**
 * Start the API server
 * 
 * SERVER CONFIGURATION:
 * - Port: 8787 (default) or PORT environment variable
 * - Host: 0.0.0.0 (listen on all network interfaces for Docker)
 * 
 * STARTUP SEQUENCE:
 * 1. Bind to port
 * 2. Log startup message
 * 3. Ready to accept connections
 * 
 * ERROR HANDLING:
 * If port is already in use or other startup error:
 * - Log the error
 * - Exit with code 1 (failure)
 */
try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`🛡️  Midnight Gatekeeper running on http://localhost:${config.port}`);
  console.log(`📋 Environment: ${config.nodeEnv}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
