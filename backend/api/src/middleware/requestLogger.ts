/**
 * ============================================================================
 * REQUEST LOGGER MIDDLEWARE
 * ============================================================================
 *
 * PURPOSE:
 * Log every incoming HTTP request with useful metadata for debugging
 * and observability, without logging sensitive payloads by default.
 *
 * WHAT WE LOG:
 * - HTTP method (GET, POST, ...)
 * - URL path and query string
 * - Client IP address
 * - Response status code
 * - Request duration (ms)
 *
 * WHAT WE AVOID LOGGING BY DEFAULT:
 * - Request body (may contain secrets)
 * - Response body (may contain PII)
 * - Headers like Authorization, cookies
 *
 * DESIGN CHOICES:
 * - Lightweight timing using high-resolution timer
 * - Structured logs using Fastify's logger (Pino)
 * - Optional debug mode to log request/response bodies
 *
 * RELATED FILES:
 * @see ../config.ts - logging configuration (debug flag)
 * @see ../index.ts - registration of this middleware
 * @see ./errorHandler.ts - error logging
 *
 * ============================================================================
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config.js';

/**
 * Fastify plugin that logs incoming requests and outgoing responses.
 *
 * IMPLEMENTATION STRATEGY:
 * - Use onRequest hook to record start time
 * - Use onResponse hook to compute duration and log summary
 */
export async function requestLogger(app: FastifyInstance) {
  // Hook executed at the very beginning of the request lifecycle
  app.addHook('onRequest', async (request) => {
    // Store high-resolution start time on the request object
    (request as any).startTime = process.hrtime.bigint();
  });

  // Hook executed right before sending the response
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const endTime = process.hrtime.bigint();
    const startTime = (request as any).startTime as bigint | undefined;

    const durationMs = startTime
      ? Number(endTime - startTime) / 1_000_000 // nanoseconds → milliseconds
      : undefined;

    const logPayload: Record<string, unknown> = {
      method: request.method,
      url: request.url,
      ip: request.ip,
      statusCode: reply.statusCode,
      durationMs,
    };

    // In debug mode, include more details (careful with PII)
    if (config.logging.debugEnabled) {
      logPayload.headers = {
        // Include some non-sensitive headers
        'user-agent': request.headers['user-agent'],
        'x-request-id': request.headers['x-request-id'],
      };
    }

    app.log.info(logPayload, 'HTTP request completed');
  });
}

/**
 * END OF FILE
 * ============================================================================
 */
