/**
 * ============================================================================
 * HEALTH CHECK ROUTES
 * ============================================================================
 *
 * PURPOSE:
 * Provide simple endpoints to check if the API Gateway (and its dependent
 * services) are healthy and responding.
 *
 * ENDPOINTS:
 * - GET /health
 *   - Basic health check for the API Gateway itself
 * - GET /services/health
 *   - Aggregated health check for all dependent services
 *   - Checks: Agents Runtime, Midnight Gateway, TTS Service
 *
 * DESIGN GOALS:
 * - Fast: Minimal work, always responds quickly
 * - Safe: Does not expose sensitive information
 * - Useful: Returns enough info for debugging
 *
 * RESPONSE FORMAT:
 * ```json
 * {
 *   "status": "ok",
 *   "timestamp": 1731585600000,
 *   "services": {
 *     "apiGateway": { "status": "ok" },
 *     "agentsRuntime": { "status": "ok" },
 *     "midnightGateway": { "status": "degraded" },
 *     "ttsService": { "status": "down" }
 *   }
 * }
 * ```
 *
 * ============================================================================
 */

import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

/**
 * Helper to check a single service via its /health endpoint.
 */
async function checkServiceHealth(url: string): Promise<'ok' | 'down'> {
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/health`, {
      method: 'GET',
      // Short timeout using AbortController for responsiveness
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return 'down';
    }

    return 'ok';
  } catch {
    return 'down';
  }
}

/**
 * Register health routes.
 */
export async function registerHealthRoutes(app: FastifyInstance) {
  /**
   * Basic health check for the API Gateway itself.
   *
   * This does NOT check dependent services.
   */
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: Date.now(),
      service: 'api-gateway',
      version: '2.0.0',
    };
  });

  /**
   * Aggregated health check for all services.
   *
   * This is useful for dashboards and uptime monitoring.
   */
  app.get('/services/health', async () => {
    const [agentsStatus, midnightStatus, ttsStatus] = await Promise.all([
      checkServiceHealth(config.services.agentsRuntimeUrl),
      checkServiceHealth(config.services.midnightGatewayUrl),
      checkServiceHealth(config.services.ttsServiceUrl),
    ]);

    return {
      status: 'ok',
      timestamp: Date.now(),
      services: {
        apiGateway: { status: 'ok' },
        agentsRuntime: { status: agentsStatus },
        midnightGateway: { status: midnightStatus },
        ttsService: { status: ttsStatus },
      },
    };
  });

  app.log.info('✅ Health routes registered');
}

/**
 * END OF FILE
 * ============================================================================
 */
