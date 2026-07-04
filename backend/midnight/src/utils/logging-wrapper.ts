/**
 * Logging Wrapper Utility for Midnight Providers
 * 
 * Wraps Midnight SDK providers with automatic logging and error tracking
 * without modifying their core functionality.
 * 
 * Pattern learned from Mesh.js source code analysis (Nov 14, 2025)
 * Enhanced with TypeScript Proxy pattern for automatic instrumentation.
 */

import type { Logger } from 'pino';

export interface LoggingOptions {
  /**
   * Logger instance to use
   */
  logger: Logger;

  /**
   * Provider name for log messages
   */
  providerName: string;

  /**
   * Log successful operations (can be noisy)
   * @default true
   */
  logSuccess?: boolean;

  /**
   * Log method arguments (may contain sensitive data)
   * @default false
   */
  logArguments?: boolean;

  /**
   * Log method results (may be large)
   * @default false
   */
  logResults?: boolean;

  /**
   * Methods to exclude from logging
   */
  excludeMethods?: string[];
}

/**
 * Wrap a provider with automatic logging
 * 
 * Uses TypeScript Proxy to intercept method calls and add logging
 * without modifying the original provider implementation.
 * 
 * @param provider - The provider to wrap
 * @param options - Logging configuration
 * @returns Proxied provider with logging
 * 
 * @example
 * ```typescript
 * const proofProvider = httpClientProofProvider('http://localhost:6300');
 * const wrapped = wrapWithLogging(proofProvider, {
 *   logger: pinoLogger,
 *   providerName: 'ProofProvider',
 *   logSuccess: true
 * });
 * 
 * // Now all method calls are logged automatically
 * await wrapped.proveTx(tx, config);
 * ```
 */
export function wrapWithLogging<T extends object>(
  provider: T,
  options: LoggingOptions
): T {
  const {
    logger,
    providerName,
    logSuccess = true,
    logArguments = false,
    logResults = false,
    excludeMethods = [],
  } = options;

  return new Proxy(provider, {
    get(target: T, prop: string | symbol): any {
      const original = target[prop as keyof T];

      // Don't wrap non-function properties
      if (typeof original !== 'function') {
        return original;
      }

      // Don't wrap excluded methods
      if (excludeMethods.includes(String(prop))) {
        return original;
      }

      // Return wrapped function
      return async function wrappedMethod(...args: any[]) {
        const methodName = String(prop);
        const startTime = Date.now();

        // Log method call
        if (logArguments) {
          logger.debug(
            { provider: providerName, method: methodName, args },
            `[${providerName}] Calling ${methodName}`
          );
        } else {
          logger.debug(
            { provider: providerName, method: methodName },
            `[${providerName}] Calling ${methodName}`
          );
        }

        try {
          // Call original method
          const result = await (original as Function).apply(target, args);
          const duration = Date.now() - startTime;

          // Log success
          if (logSuccess) {
            if (logResults) {
              logger.info(
                { provider: providerName, method: methodName, duration, result },
                `[${providerName}] ${methodName} succeeded (${duration}ms)`
              );
            } else {
              logger.info(
                { provider: providerName, method: methodName, duration },
                `[${providerName}] ${methodName} succeeded (${duration}ms)`
              );
            }
          }

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Log error
          logger.error(
            {
              provider: providerName,
              method: methodName,
              duration,
              error: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            },
            `[${providerName}] ${methodName} failed after ${duration}ms: ${errorMessage}`
          );

          // Re-throw original error
          throw error;
        }
      };
    },
  });
}

/**
 * Wrap multiple providers with logging
 * 
 * Convenience function to wrap multiple providers at once.
 * 
 * @param providers - Object containing providers to wrap
 * @param logger - Logger instance
 * @param options - Optional per-provider configuration
 * @returns Object with wrapped providers
 * 
 * @example
 * ```typescript
 * const wrapped = wrapProvidersWithLogging(
 *   {
 *     proofProvider,
 *     publicDataProvider,
 *     zkConfigProvider
 *   },
 *   logger,
 *   {
 *     proofProvider: { logSuccess: true },
 *     publicDataProvider: { excludeMethods: ['getBlock'] }
 *   }
 * );
 * ```
 */
export function wrapProvidersWithLogging<T extends Record<string, any>>(
  providers: T,
  logger: Logger,
  options: Partial<Record<keyof T, Partial<LoggingOptions>>> = {}
): T {
  const wrapped: any = {};

  for (const [name, provider] of Object.entries(providers)) {
    const providerOptions: LoggingOptions = {
      logger,
      providerName: name,
      ...options[name as keyof T],
    };

    wrapped[name] = wrapWithLogging(provider, providerOptions);
  }

  return wrapped as T;
}

/**
 * Create a child logger for a specific provider
 * 
 * Creates a child logger with provider-specific context automatically added.
 * 
 * @param logger - Parent logger
 * @param providerName - Provider name for context
 * @returns Child logger
 */
export function createProviderLogger(logger: Logger, providerName: string): Logger {
  return logger.child({ provider: providerName });
}

/**
 * Performance monitoring wrapper
 * 
 * Wraps a provider to track performance metrics for all method calls.
 * 
 * @param provider - Provider to wrap
 * @param onMetric - Callback for performance metrics
 * @returns Wrapped provider
 */
export function wrapWithPerformanceMonitoring<T extends object>(
  provider: T,
  onMetric: (metric: PerformanceMetric) => void
): T {
  return new Proxy(provider, {
    get(target: T, prop: string | symbol): any {
      const original = target[prop as keyof T];

      if (typeof original !== 'function') {
        return original;
      }

      return async function monitoredMethod(...args: any[]) {
        const methodName = String(prop);
        const startTime = Date.now();
        let success = false;
        let error: Error | undefined;

        try {
          const result = await (original as Function).apply(target, args);
          success = true;
          return result;
        } catch (err) {
          error = err as Error;
          throw err;
        } finally {
          const duration = Date.now() - startTime;
          
          // Build metric object conditionally for exactOptionalPropertyTypes
          const metric: PerformanceMetric = {
            method: methodName,
            duration,
            success,
            timestamp: new Date(),
          };
          
          if (error?.message) {
            metric.error = error.message;
          }
          
          onMetric(metric);
        }
      };
    },
  });
}

export interface PerformanceMetric {
  method: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}
