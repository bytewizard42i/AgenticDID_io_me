/**
 * ============================================================================
 * ROUTE REGISTRATION ENTRY POINT
 * ============================================================================
 *
 * PURPOSE:
 * Central place to register all API routes with the Fastify application.
 *
 * WHY SEPARATE FILES:
 * - Keeps `index.ts` (server startup) focused and readable
 * - Groups related endpoints together (health, auth, agents, etc.)
 * - Makes it easy to find and modify specific API areas
 *
 * ROUTE GROUPS:
 * - Health & Status: `/health`, `/services/health`
 * - Authentication: `/challenge`, `/present`, `/verify`
 * - Agents: `/agents/*`
 * - TTS: `/tts/*`
 * - Midnight: `/midnight/*`
 *
 * This file only wires them together.
 *
 * RELATED FILES:
 * @see ./health.ts - Health check endpoints
 * @see ./auth.ts - Challenge/response authentication
 * @see ./agents.ts - Agent execution endpoints
 *
 * ============================================================================
 */

import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health.js';
import { registerAuthRoutes } from './auth.js';
import { registerAgentRoutes } from './agents.js';

/**
 * Register all route groups with the Fastify app.
 */
export async function registerRoutes(app: FastifyInstance) {
  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerAgentRoutes(app);

  app.log.info('✅ All route groups registered');
}

/**
 * END OF FILE
 * ============================================================================
 */
