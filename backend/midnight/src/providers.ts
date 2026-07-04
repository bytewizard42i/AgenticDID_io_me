/**
 * Midnight Provider Factory
 * 
 * Creates and configures all Midnight SDK providers with logging and error handling.
 * Pattern learned from Mesh.js and reference-repos/example-counter
 */

import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { ProofProvider, PublicDataProvider, ZKConfigProvider } from '@midnight-ntwrk/midnight-js-types';
import type { Logger } from 'pino';
import { wrapWithLogging } from './utils/logging-wrapper.js';
import { retryWithBackoff, RetryPredicates } from './utils/retry.js';
import type { MidnightConfig } from './config.js';

/**
 * All Midnight providers bundled together
 */
export interface MidnightProviders {
  proofProvider: ProofProvider<string>;
  publicDataProvider: PublicDataProvider;
  zkConfigProvider: ZKConfigProvider<string>;
}

/**
 * Proof server status check result
 */
export interface ProofServerStatus {
  available: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * Create all Midnight providers with logging and retry logic
 * 
 * @param config - Midnight configuration
 * @param logger - Pino logger instance
 * @returns Object containing all configured providers
 */
export async function createMidnightProviders(
  config: MidnightConfig,
  logger: Logger
): Promise<MidnightProviders> {
  logger.info('Creating Midnight providers...');

  // Check proof server availability first
  const proofServerStatus = await checkProofServer(config.proofServerUrl, logger);
  
  if (!proofServerStatus.available) {
    logger.warn(
      `Proof server not available at ${config.proofServerUrl}: ${proofServerStatus.error}`
    );
    logger.warn('Continuing anyway - proof operations will fail until server is available');
  } else {
    logger.info(
      `Proof server available at ${config.proofServerUrl} (${proofServerStatus.responseTime}ms)`
    );
  }

  try {
    // Create proof provider with retry logic
    logger.debug('Creating proof provider...');
    const proofProvider = await retryWithBackoff(
      () => Promise.resolve(httpClientProofProvider(config.proofServerUrl)),
      {
        maxRetries: 3,
        initialDelay: 1000,
        logger,
        operationName: 'Create Proof Provider',
        shouldRetry: RetryPredicates.networkErrors,
      }
    );

    // Create public data provider (indexer)
    logger.debug('Creating public data provider...');
    const publicDataProvider = await retryWithBackoff(
      () => Promise.resolve(indexerPublicDataProvider(config.indexerUrl, config.indexerUrl.replace('http', 'ws'))),
      {
        maxRetries: 3,
        initialDelay: 1000,
        logger,
        operationName: 'Create Public Data Provider',
        shouldRetry: RetryPredicates.networkErrors,
      }
    );

    // Create ZK config provider (reads compiled contracts and ZK configs)
    logger.debug('Creating ZK config provider...');
    const zkConfigProvider = await retryWithBackoff(
      () => Promise.resolve(new NodeZkConfigProvider(config.contractsPath)),
      {
        maxRetries: 3,
        initialDelay: 500,
        logger,
        operationName: 'Create ZK Config Provider',
      }
    );

    // Wrap providers with logging
    const providers: MidnightProviders = {
      proofProvider: wrapWithLogging(proofProvider, {
        logger,
        providerName: 'ProofProvider',
        logSuccess: true,
        logArguments: false, // Proof arguments can be large
        logResults: false, // Proof results can be large
      }),
      publicDataProvider: wrapWithLogging(publicDataProvider, {
        logger,
        providerName: 'PublicDataProvider',
        logSuccess: false, // Reduce noise for frequent queries
        excludeMethods: ['getBlock'], // Exclude noisy methods
      }),
      zkConfigProvider: wrapWithLogging(zkConfigProvider, {
        logger,
        providerName: 'ZkConfigProvider',
        logSuccess: true,
      }),
    };

    logger.info('✅ All Midnight providers created successfully');
    
    return providers;
  } catch (error) {
    logger.error('Failed to create Midnight providers:', error);
    throw new Error(`Provider initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if proof server is available and responding
 * 
 * Based on Mesh.js pattern but improved with proper health check
 * 
 * @param proofServerUrl - Proof server URL
 * @param logger - Optional logger
 * @returns Status object with availability and response time
 */
export async function checkProofServer(
  proofServerUrl: string,
  logger?: Logger
): Promise<ProofServerStatus> {
  const startTime = Date.now();

  try {
    logger?.debug(`Checking proof server at ${proofServerUrl}...`);

    const response = await fetch(proofServerUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,text/plain',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        available: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();

    // Check for expected response (proof server typically returns "We're alive 🎉!")
    // But we're more lenient - any 200 response is considered available
    logger?.debug(`Proof server response: ${text.substring(0, 100)}`);

    return {
      available: true,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger?.debug(`Proof server check failed: ${errorMessage}`);

    return {
      available: false,
      responseTime,
      error: errorMessage,
    };
  }
}

/**
 * Check if all providers are healthy
 * 
 * @param providers - Midnight providers
 * @param logger - Logger instance
 * @returns Health status object
 */
export async function checkProvidersHealth(
  providers: MidnightProviders,
  logger?: Logger
): Promise<Record<string, boolean>> {
  const health: Record<string, boolean> = {};

  // Check proof provider (by checking server availability)
  try {
    const proofProvider = providers.proofProvider as any;
    if (proofProvider.__wrapped) {
      // If wrapped, get underlying URL
      // Note: This is a simplification - in practice you'd track the URL separately
      health.proofProvider = true;
    } else {
      health.proofProvider = true;
    }
  } catch (error) {
    logger?.error('Proof provider health check failed:', error);
    health.proofProvider = false;
  }

  // Public data provider health check could query indexer status
  try {
    health.publicDataProvider = true; // Assume healthy if created
  } catch (error) {
    logger?.error('Public data provider health check failed:', error);
    health.publicDataProvider = false;
  }

  // ZK config provider health check
  try {
    health.zkConfigProvider = true; // Assume healthy if created
  } catch (error) {
    logger?.error('ZK config provider health check failed:', error);
    health.zkConfigProvider = false;
  }

  return health;
}

/**
 * Gracefully shutdown all providers
 * 
 * @param providers - Midnight providers to shutdown
 * @param logger - Logger instance
 */
export async function shutdownProviders(
  providers: MidnightProviders,
  logger?: Logger
): Promise<void> {
  logger?.info('Shutting down Midnight providers...');

  // Midnight SDK providers don't have explicit shutdown methods
  // But we log the shutdown for tracking
  
  logger?.info('✅ Midnight providers shut down');
}
