/**
 * ============================================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ============================================================================
 *
 * PURPOSE:
 * Centralized error handling for the API Gateway. Any error that is not
 * handled by a route or plugin will flow through this handler.
 *
 * RESPONSIBILITIES:
 * - Log errors with useful context
 * - Convert unknown errors into a consistent JSON response
 * - Hide sensitive details in production
 * - Preserve full details in development for debugging
 *
 * ERROR RESPONSE FORMAT:
 * ```json
 * {
 *   "error": "Human-readable message",
 *   "code": "INTERNAL_SERVER_ERROR",
 *   "statusCode": 500,
 *   "timestamp": "2025-11-14T10:30:00.000Z",
 *   "requestId": "req-abc-123"  // if available
 * }
 * ```
 *
 * RELATED FILES:
 * @see ../index.ts - where this handler is registered
 * @see ./requestLogger.ts - request logging middleware
 *
 * DESIGN NOTES:
 * - We intentionally do NOT expose stack traces or internal details
 *   in production, to avoid leaking sensitive information.
 * - In development, we include more details to help debugging.
 * - We support both standard Error objects and Fastify errors.
 *
 * ============================================================================
 */

import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { isDev } from '../config.js';

/**
 * Shape of the error response body sent to clients.
 */
interface ErrorResponseBody {
  error: string;
  code: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Map an error object to an HTTP status code.
 *
 * For now we use a simple mapping:
 * - Fastify HTTP errors: use their statusCode if present
 * - Otherwise: 500 Internal Server Error
 *
 * This can be extended later to handle custom error types.
 */
function getStatusCode(error: FastifyError): number {
  if (typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  return 500;
}

/**
 * Map an error object to an error code string.
 *
 * This is a machine-readable error identifier that can be used by
 * frontend code or logs to categorize errors.
 */
function getErrorCode(error: FastifyError): string {
  // Use Fastify error code if available (e.g., FST_ERR_VALIDATION)
  if (error.code) {
    return error.code;
  }

  // Fallback based on status code
  const status = getStatusCode(error);
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

/**
 * Extract a human-readable message from an error object.
 */
function getErrorMessage(error: FastifyError): string {
  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Global error handler function compatible with Fastify.
 *
 * @param this - Fastify instance (bound by Fastify)
 * @param error - Error thrown during request processing
 * @param request - Incoming HTTP request
 * @param reply - HTTP response object
 */
export function errorHandler(this: FastifyInstance, error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const statusCode = getStatusCode(error);
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const timestamp = new Date().toISOString();

  const requestId = (request as any).id as string | undefined;

  // Log full error with context
  this.log.error(
    {
      err: error,
      code,
      statusCode,
      requestId,
      method: request.method,
      url: request.url,
      ip: request.ip,
    },
    'Unhandled error during request'
  );

  const responseBody: ErrorResponseBody = {
    error: message,
    code,
    statusCode,
    timestamp,
    requestId,
  };

  // In development, include more details for debugging
  if (isDev) {
    (responseBody as any).stack = error.stack;
  }

  // Ensure we do not send headers twice
  if (!reply.sent) {
    reply.status(statusCode).send(responseBody);
  }
}

/**
 * END OF FILE
 * ============================================================================
 */
