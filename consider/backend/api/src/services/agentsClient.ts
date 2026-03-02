/**
 * ============================================================================
 * AGENTS RUNTIME SERVICE CLIENT
 * ============================================================================
 * 
 * HTTP client for communicating with the Agents Runtime service.
 * 
 * The Agents Runtime is responsible for:
 * - Executing AI agents with specific goals
 * - Integrating with Google ADK for agent framework
 * - Calling Claude API for reasoning
 * - Coordinating with TTS service for Listen In Mode
 * 
 * KEY RESPONSIBILITIES:
 * - Make HTTP requests to Agents Runtime API
 * - Handle request/response serialization
 * - Implement retry logic for transient failures
 * - Provide type-safe API methods
 * - Log interactions for debugging
 * 
 * DATA FLOW:
 * ```
 * API Gateway Route
 *   → AgentsClient.executeAgent()
 *     → HTTP POST to Agents Runtime
 *       → Agent executes with ADK + Claude
 *         → Returns execution result
 *   ← Client returns typed response
 * ← Route returns to frontend
 * ```
 * 
 * TECHNOLOGY STACK:
 * - fetch API: Standard HTTP client
 * - zod: Response validation
 * - pino: Structured logging
 * 
 * RELATED FILES:
 * @see src/routes/agents.ts - Uses this client to proxy agent requests
 * @see src/config.ts - Provides baseUrl configuration
 * @see src/index.ts - Registers this client in FastifyInstance
 * 
 * FUTURE PHASES:
 * Phase 2 will implement the actual Agents Runtime service that this client calls.
 * For now, this client is ready but will receive connection errors until Phase 2.
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import { z } from 'zod';
import type { FastifyBaseLogger } from 'fastify';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Request payload for executing an agent
 * 
 * FIELDS:
 * - agentId: Which agent to execute (comet, banker, researcher, etc.)
 * - goal: Natural language description of what user wants
 * - context: Optional additional context for the agent
 * - listenInMode: Whether to enable real-time TTS narration
 */
export interface ExecuteAgentRequest {
  agentId?: string; // Optional - system can pick best agent if not specified
  goal: string;
  context?: Record<string, unknown>;
  listenInMode?: boolean;
}

/**
 * Response from agent execution
 * 
 * FIELDS:
 * - success: Whether agent completed successfully
 * - result: Agent's response/output
 * - reasoning: Agent's step-by-step thought process
 * - audioUrl: Optional URL to TTS audio (if Listen In Mode enabled)
 * - executionTimeMs: How long the agent took to run
 */
export interface ExecuteAgentResponse {
  success: boolean;
  result: string;
  reasoning?: string[];
  audioUrl?: string;
  executionTimeMs: number;
}

/**
 * Health check response from Agents Runtime
 */
export interface AgentsHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    adk: boolean;
    claude: boolean;
    tts: boolean;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for validating agent execution responses
 * 
 * PURPOSE:
 * Ensures the Agents Runtime returns data in the expected format.
 * Catches API contract violations early.
 */
const executeAgentResponseSchema = z.object({
  success: z.boolean(),
  result: z.string(),
  reasoning: z.array(z.string()).optional(),
  audioUrl: z.string().url().optional(),
  executionTimeMs: z.number().nonnegative(),
});

const agentsHealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  timestamp: z.string(),
  checks: z.object({
    adk: z.boolean(),
    claude: z.boolean(),
    tts: z.boolean(),
  }),
});

// ============================================================================
// CLIENT CLASS
// ============================================================================

/**
 * HTTP client for Agents Runtime service
 * 
 * USAGE:
 * ```typescript
 * const client = new AgentsClient('http://agents:3001', logger);
 * 
 * const result = await client.executeAgent({
 *   agentId: 'comet',
 *   goal: 'Send $50 to Alice',
 *   listenInMode: true
 * });
 * 
 * console.log(result.result); // "Transaction successful"
 * console.log(result.audioUrl); // "http://tts/audio/123.mp3"
 * ```
 * 
 * ERROR HANDLING:
 * - Network errors: Throws with original error message
 * - HTTP errors: Throws with status code and error response
 * - Validation errors: Throws if response doesn't match schema
 * 
 * RETRY LOGIC:
 * Currently no retries. If needed, add exponential backoff in Phase 7.
 */
export class AgentsClient {
  private readonly baseUrl: string;
  private readonly logger: FastifyBaseLogger;
  private readonly timeout: number = 60000; // 60 seconds for agent execution

  /**
   * Create a new Agents Runtime client
   * 
   * @param baseUrl - Base URL of Agents Runtime (e.g., 'http://agents:3001')
   * @param logger - Pino logger instance for structured logging
   */
  constructor(baseUrl: string, logger: FastifyBaseLogger) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.logger = logger.child({ component: 'AgentsClient' });
    
    this.logger.info({ baseUrl: this.baseUrl }, 'Agents client initialized');
  }

  /**
   * Execute an AI agent with a specific goal
   * 
   * PURPOSE:
   * Main method for running agents. Sends request to Agents Runtime,
   * which coordinates ADK, Claude, and optionally TTS.
   * 
   * PROCESS:
   * 1. Validate request parameters
   * 2. Make HTTP POST to /execute
   * 3. Wait for agent to complete (can take 10-30 seconds)
   * 4. Validate response structure
   * 5. Return typed result
   * 
   * @param request - Agent execution parameters
   * @returns Execution result with agent's response
   * @throws Error if request fails or response invalid
   */
  async executeAgent(request: ExecuteAgentRequest): Promise<ExecuteAgentResponse> {
    const startTime = Date.now();
    
    this.logger.info(
      { agentId: request.agentId, goal: request.goal },
      'Executing agent via runtime'
    );

    try {
      // Make HTTP request to Agents Runtime
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          { status: response.status, error: errorText },
          'Agent execution failed'
        );
        throw new Error(`Agent execution failed: ${response.status} ${errorText}`);
      }

      // Parse and validate response
      const data = await response.json();
      const validated = executeAgentResponseSchema.parse(data);

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          agentId: request.agentId,
          success: validated.success,
          duration,
        },
        'Agent execution completed'
      );

      return validated;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log different error types appropriately
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          { agentId: request.agentId, duration, timeout: this.timeout },
          'Agent execution timed out'
        );
        throw new Error(`Agent execution timed out after ${this.timeout}ms`);
      }

      this.logger.error(
        { error, agentId: request.agentId, duration },
        'Agent execution error'
      );
      
      throw error;
    }
  }

  /**
   * Check health of Agents Runtime service
   * 
   * PURPOSE:
   * Verify that Agents Runtime is running and its dependencies are healthy.
   * Used by API Gateway's health check endpoint.
   * 
   * @returns Health status of Agents Runtime
   * @throws Error if health check fails
   */
  async checkHealth(): Promise<AgentsHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health checks
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return agentsHealthResponseSchema.parse(data);
    } catch (error) {
      this.logger.error({ error }, 'Agents health check failed');
      throw error;
    }
  }

  /**
   * Get list of available agents
   * 
   * PURPOSE:
   * Fetch metadata about available agents (Comet, Banker, etc.)
   * Used by frontend to populate agent selection UI.
   * 
   * RESPONSE FORMAT:
   * [
   *   { id: 'comet', name: 'Comet', description: '...', capabilities: [...] },
   *   { id: 'banker', name: 'Banker', description: '...', capabilities: [...] }
   * ]
   * 
   * @returns Array of available agents
   */
  async listAgents(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.status}`);
      }

      return await response.json() as Array<{
        id: string;
        name: string;
        description: string;
        capabilities: string[];
      }>;
    } catch (error) {
      this.logger.error({ error }, 'Failed to list agents');
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Create a default instance for convenience
 * This will be initialized properly in index.ts with logger
 */
import { config } from '../config.js';

// Placeholder logger for module-level export
// Will be replaced with proper Fastify logger when app starts
const placeholderLogger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  child: () => placeholderLogger,
} as any;

export const agentsClient = new AgentsClient(
  config.services.agentsRuntimeUrl,
  placeholderLogger
);

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */

export default AgentsClient;
