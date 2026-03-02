/**
 * Retry Utility with Exponential Backoff
 * 
 * Implements retry logic for operations that may fail due to network issues,
 * temporary service unavailability, or other transient errors.
 * 
 * Pattern learned from Mesh.js source code analysis (Nov 14, 2025)
 * Applied with improvements for backend use cases.
 */

import type { Logger } from 'pino';

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 5
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 500
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds between retries
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Backoff multiplier for exponential backoff
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Optional logger for retry events
   */
  logger?: Logger;

  /**
   * Operation name for logging
   */
  operationName?: string;

  /**
   * Optional function to determine if error is retryable
   * @param error - The error that occurred
   * @returns true if operation should be retried
   */
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param operation - Async operation to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with operation result or rejects after all retries exhausted
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => fetch('http://localhost:6300/health'),
 *   {
 *     maxRetries: 5,
 *     initialDelay: 1000,
 *     logger: pinoLogger,
 *     operationName: 'Proof Server Health Check'
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 5,
    initialDelay = 500,
    maxDelay = 10000,
    backoffFactor = 2,
    logger,
    operationName = 'Operation',
    shouldRetry = () => true, // Retry all errors by default
  } = options;

  let lastError: Error;
  let delay = initialDelay;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger?.debug(`[${operationName}] Attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const result = await operation();
      
      if (attempt > 0) {
        const duration = Date.now() - startTime;
        logger?.info(
          `[${operationName}] Succeeded after ${attempt + 1} attempts (${duration}ms)`
        );
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        logger?.debug(`[${operationName}] Error not retryable, failing immediately`);
        throw lastError;
      }

      // If this was the last attempt, throw the error
      if (attempt >= maxRetries) {
        const duration = Date.now() - startTime;
        logger?.error(
          `[${operationName}] Failed after ${attempt + 1} attempts (${duration}ms): ${lastError.message}`
        );
        throw lastError;
      }

      // Log retry attempt
      logger?.warn(
        `[${operationName}] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`
      );

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  // TypeScript exhaustiveness check - should never reach here
  throw lastError!;
}

/**
 * Retry an operation with detailed result tracking
 * 
 * Similar to retryWithBackoff but returns detailed retry metadata
 * instead of throwing on failure.
 * 
 * @param operation - Async operation to retry
 * @param options - Retry configuration options
 * @returns Promise with detailed retry result
 */
export async function retryWithBackoffDetailed<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;

  try {
    const result = await retryWithBackoff(operation, {
      ...options,
      // Track attempts in a closure
      logger: {
        ...options.logger,
        debug: (...args: any[]) => {
          attempts++;
          options.logger?.debug(...args);
        },
      } as Logger,
    });

    return {
      success: true,
      result,
      attempts,
      totalDuration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      attempts: attempts || 1,
      totalDuration: Date.now() - startTime,
    };
  }
}

/**
 * Common retry predicates for specific error types
 */
export const RetryPredicates = {
  /**
   * Retry network-related errors (ECONNREFUSED, ETIMEDOUT, etc.)
   */
  networkErrors: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return (
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('network') ||
      message.includes('socket')
    );
  },

  /**
   * Retry 5xx server errors but not 4xx client errors
   */
  serverErrors: (error: Error): boolean => {
    // Check if error has status code (e.g., from fetch)
    const status = (error as any).status || (error as any).statusCode;
    return status >= 500 && status < 600;
  },

  /**
   * Retry timeout errors
   */
  timeoutErrors: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  },

  /**
   * Combine multiple predicates (retry if ANY predicate returns true)
   */
  any: (...predicates: Array<(error: Error) => boolean>) => {
    return (error: Error): boolean => {
      return predicates.some((predicate) => predicate(error));
    };
  },

  /**
   * Combine multiple predicates (retry only if ALL predicates return true)
   */
  all: (...predicates: Array<(error: Error) => boolean>) => {
    return (error: Error): boolean => {
      return predicates.every((predicate) => predicate(error));
    };
  },
};
