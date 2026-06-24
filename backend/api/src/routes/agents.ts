/**
 * ============================================================================
 * AGENT EXECUTION ROUTES
 * ============================================================================
 *
 * PURPOSE:
 * Provide HTTP endpoints for the frontend to execute agents using the
 * same workflow as the demo, but backed by the real Agents Runtime service
 * (Google ADK + Claude + TTS).
 *
 * ENDPOINTS:
 * - GET /agents/available
 *   - List available agents (for UI to display choices)
 * - POST /agents/execute
 *   - Execute a specific agent or let the system pick one based on goal
 *
 * REQUEST/RESPONSE SHAPE:
 * This is designed to feel like the demo while giving us room to
 * evolve the agent system.
 *
 * ============================================================================
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { agentsClient } from '../services/agentsClient.js';
import { tokenService } from '../services/tokenService.js';

/**
 * Schema for agent execution request.
 */
const executeAgentBodySchema = z.object({
  goal: z.string().min(1, 'Goal is required'),
  agentId: z.string().optional(),
  listenIn: z.boolean().optional().default(true),
  // Capability token from /present
  token: z.string(),
});

/**
 * Register agent-related routes.
 */
export async function registerAgentRoutes(app: FastifyInstance) {
  /**
   * GET /agents/available
   *
   * Return a list of available agents and a short description of
   * what they do. This is used by the frontend to display options
   * to the user.
   */
  app.get('/agents/available', async () => {
    const agents = await agentsClient.listAgents();
    return { agents };
  });

  /**
   * POST /agents/execute
   *
   * Execute an agent with a given goal and capability token.
   *
   * REQUEST BODY:
   * ```json
   * {
   *   "goal": "Send $50 to Alice",
   *   "agentId": "banker",        // optional
   *   "listenIn": true,            // optional, default true
   *   "token": "<jwt>"            // required
   * }
   * ```
   */
  app.post('/agents/execute', async (request, reply) => {
    const parsed = executeAgentBodySchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { error: 'Invalid request body', details: parsed.error.flatten() };
    }

    const { goal, agentId, listenIn, token } = parsed.data;

    // Verify capability token
    const claims = tokenService.verifyToken(token);
    if (!claims) {
      reply.status(401);
      return { error: 'Invalid or expired token' };
    }

    // Delegate actual execution to Agents Runtime service
    const result = await agentsClient.executeAgent({
      goal,
      agentId,
      listenInMode: listenIn,
      context: { claims },
    });

    return result;
  });

  app.log.info('✅ Agent routes registered');
}

/**
 * END OF FILE
 * ============================================================================
 */
