/**
 * ============================================================================
 * AGENTS RUNTIME - MAIN SERVER
 * ============================================================================
 * 
 * Fastify server that executes AI agents using Google ADK and Claude API.
 * 
 * PURPOSE:
 * This service receives agent execution requests from the API Gateway,
 * coordinates agent behavior using Google ADK framework, uses Claude for
 * reasoning, and optionally narrates steps via TTS service.
 * 
 * KEY RESPONSIBILITIES:
 * - Accept agent execution requests (/execute)
 * - Coordinate Google ADK agent framework
 * - Call Claude API for AI reasoning
 * - Integrate with TTS for Listen In Mode
 * - Return execution results to API Gateway
 * - Provide health checks
 * 
 * DATA FLOW:
 * ```
 * API Gateway → POST /execute → Agent Executor
 *                               ↓
 *                         Google ADK (agent framework)
 *                               ↓
 *                         Claude API (reasoning)
 *                               ↓
 *                         TTS Service (optional narration)
 *                               ↓
 *                         Result returned to API Gateway
 * ```
 * 
 * AGENT TYPES:
 * - Comet: Personal orchestrator (user-side agent)
 * - Banker: Financial service agent
 * - Shopper: E-commerce agent
 * - Traveler: Travel booking agent
 * - Researcher: Information gathering agent
 * 
 * RELATED FILES:
 * @see src/config.ts - Server configuration
 * @see src/claude-client.ts - Claude API integration
 * @see src/adk-integration.ts - Google ADK setup
 * @see src/agents/ - Agent definitions
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, isDevelopment } from './config.js';
import { AgentExecutor } from './executor.js';

// ============================================================================
// CREATE FASTIFY INSTANCE
// ============================================================================

/**
 * Initialize Fastify with production-ready settings
 * 
 * CONFIGURATION:
 * - Structured logging with Pino
 * - Pretty printing in development
 * - Request ID tracking
 * - Detailed error logging
 */
const app = Fastify({
  logger: {
    level: config.logging.level,
    ...(config.logging.pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

/**
 * Enable CORS for cross-origin requests
 * 
 * SECURITY:
 * - In development: Allow all origins
 * - In production: Should be restricted to API Gateway only
 */
await app.register(cors, {
  origin: isDevelopment ? '*' : ['http://api:3000', 'http://localhost:3000'],
  credentials: true,
});

// ============================================================================
// INITIALIZE AGENT EXECUTOR
// ============================================================================

/**
 * Create agent executor instance
 * Uses Fastify logger for consistent logging
 */
const executor = new AgentExecutor(app.log);

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

/**
 * GET /health - Service health check
 * 
 * PURPOSE:
 * Used by Docker, Kubernetes, and monitoring systems to verify service health.
 * Checks if service is running and dependencies are accessible.
 * 
 * RESPONSE:
 * {
 *   "status": "healthy" | "degraded" | "unhealthy",
 *   "version": "1.0.0",
 *   "timestamp": "2025-11-14T12:00:00Z",
 *   "checks": {
 *     "claude": true,
 *     "adk": true,
 *     "tts": true
 *   }
 * }
 */
app.get('/health', async () => {
  // TODO: Add actual health checks for dependencies
  // For now, return basic health status
  return {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    checks: {
      claude: true, // Will check Claude API availability
      adk: config.adk.enabled,
      tts: config.tts.enabled,
    },
  };
});

// ============================================================================
// AGENT EXECUTION ROUTE
// ============================================================================

/**
 * POST /execute - Execute an AI agent
 * 
 * PURPOSE:
 * Main endpoint for agent execution. Receives goal from API Gateway,
 * executes appropriate agent, and returns result.
 * 
 * REQUEST BODY:
 * {
 *   "agentId": "comet",              // Which agent to execute
 *   "goal": "Send $50 to Alice",     // Natural language goal
 *   "context": { ... },              // Optional context (credentials, etc.)
 *   "listenInMode": true             // Enable TTS narration
 * }
 * 
 * RESPONSE:
 * {
 *   "success": true,
 *   "result": "Transaction successful",
 *   "reasoning": ["Step 1...", "Step 2..."],
 *   "audioUrl": "http://tts/audio/123.mp3",  // Optional
 *   "executionTimeMs": 15000
 * }
 */
app.post('/execute', async (request, reply) => {
  try {
    // Parse request body
    const { agentId, goal, context, listenInMode } = request.body as {
      agentId?: string;
      goal: string;
      context?: Record<string, unknown>;
      listenInMode?: boolean;
    };

    // Validate required fields
    if (!goal || goal.trim().length === 0) {
      reply.status(400);
      return { error: 'Goal is required' };
    }

    app.log.info(
      { agentId, goal, listenInMode },
      'Executing agent'
    );

    // Execute agent using real executor
    // Build request with required properties
    const executeRequest: any = { goal };
    if (agentId) executeRequest.agentId = agentId;
    if (context) executeRequest.context = context;
    if (listenInMode !== undefined) executeRequest.listenInMode = listenInMode;
    
    const result = await executor.execute(executeRequest);

    // Set appropriate status code
    if (!result.success) {
      reply.status(500);
    }
    
    return result;
  } catch (error) {
    app.log.error({ error }, 'Agent execution error');
    
    reply.status(500);
    return {
      success: false,
      result: 'Agent execution failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: 0,
    };
  }
});

// ============================================================================
// LIST AVAILABLE AGENTS
// ============================================================================

/**
 * GET /agents - List available agents
 * 
 * PURPOSE:
 * Return metadata about available agents for frontend display.
 * 
 * RESPONSE:
 * [
 *   {
 *     "id": "comet",
 *     "name": "Comet",
 *     "description": "Personal orchestrator agent",
 *     "capabilities": ["transfer", "balance"]
 *   },
 *   ...
 * ]
 */
app.get('/agents', async () => {
  // Get agents from executor
  const agents = executor.listAgents();
  
  // Return agent metadata (without system prompts for security)
  return agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    capabilities: agent.capabilities,
  }));
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Handle shutdown signals gracefully
 * 
 * PURPOSE:
 * Ensure in-flight agent executions complete before shutdown.
 * Prevents data loss and provides clean container restarts.
 * 
 * PROCESS:
 * 1. Receive SIGTERM/SIGINT signal
 * 2. Stop accepting new requests
 * 3. Wait for in-flight requests to complete (with timeout)
 * 4. Close database/API connections
 * 5. Exit process
 */
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Stop accepting new requests
    await app.close();
    
    // TODO: Wait for in-flight agent executions to complete
    // TODO: Close any open connections (Claude API, TTS, etc.)
    
    app.log.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    app.log.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// START SERVER
// ============================================================================

/**
 * Start the Fastify server
 * 
 * STARTUP PROCESS:
 * 1. Validate configuration
 * 2. Initialize Claude API client
 * 3. Setup Google ADK (if enabled)
 * 4. Start HTTP server
 * 5. Log startup banner
 */
try {
  await app.listen({
    port: config.server.port,
    host: config.server.host,
  });

  // Log startup success with visual banner
  console.log('\n' + '='.repeat(70));
  console.log('🤖 AGENTICDID AGENTS RUNTIME');
  console.log('='.repeat(70));
  console.log(`\n✅ Server started successfully!\n`);
  console.log(`📍 Agents Runtime:   http://localhost:${config.server.port}`);
  console.log(`🌐 Environment:      ${config.server.nodeEnv}`);
  console.log(`\n🧠 AI Configuration:`);
  console.log(`   Claude Model:     ${config.claude.model}`);
  console.log(`   Extended Thinking: ${config.claude.useExtendedThinking ? 'Enabled' : 'Disabled'}`);
  console.log(`   Google ADK:       ${config.adk.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`\n📡 Integrations:`);
  console.log(`   TTS Service:      ${config.tts.enabled ? config.tts.serviceUrl : 'Disabled'}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   GET  /health          - Health check`);
  console.log(`   GET  /agents          - List available agents`);
  console.log(`   POST /execute         - Execute agent`);
  console.log(`\n⚙️  Settings:`);
  console.log(`   Agent Timeout:    ${config.agents.executionTimeout}ms`);
  console.log(`   Max Concurrent:   ${config.agents.maxConcurrent}`);
  console.log(`   Retry Attempts:   ${config.agents.retryAttempts}`);
  console.log(`\n🚀 Ready to execute agents!\n`);
  console.log('='.repeat(70) + '\n');
} catch (error) {
  app.log.error({ error }, 'Failed to start server');
  process.exit(1);
}

/**
 * ============================================================================
 * END OF FILE
 * ============================================================================
 */
