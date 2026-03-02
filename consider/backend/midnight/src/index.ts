/**
 * Midnight Gateway - Fastify Server
 * 
 * HTTP API for ZK proof verification and credential validation.
 * This is the bridge between task agents and Midnight Network.
 * 
 * Endpoints:
 * - POST /verify - Verify a credential presentation
 * - GET /health - Health check
 * - GET /issuer/:did - Get issuer information
 * - GET /stats - Service statistics
 * 
 * Port: 3003 (configured via env)
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pino } from 'pino';
import { loadConfig, type MidnightConfig } from './config.js';
import { createMidnightProviders, type MidnightProviders } from './providers.js';
import { createContractLoader, type ContractLoader } from './contract-loader.js';
import { ZKProofVerifier } from './verifier.js';
import { FraudDetector } from './fraud-detection.js';
import { CredentialType, RiskScore } from './types.js';
import type {
  IssuerCategory,
  VerificationLevel,
  VerificationRequest,
  VerificationResponse,
  IssuerRecord,
} from './types.js';

/**
 * Initialize logger
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

/**
 * Main application class
 */
class MidnightGateway {
  private fastify: ReturnType<typeof Fastify>;
  private config: MidnightConfig;
  private providers?: MidnightProviders;
  private contractLoader?: ContractLoader;
  private verifier?: ZKProofVerifier;
  private fraudDetector?: FraudDetector;
  private startTime: Date = new Date();

  constructor() {
    this.config = loadConfig();
    
    // Initialize Fastify
    this.fastify = Fastify({
      logger: logger as any,
      requestIdLogLabel: 'reqId',
      disableRequestLogging: false,
      trustProxy: true,
    });

    // Register plugins
    this.registerPlugins();
    
    // Register routes
    this.registerRoutes();
    
    // Register error handlers
    this.registerErrorHandlers();
  }

  /**
   * Register Fastify plugins
   */
  private registerPlugins(): void {
    // CORS
    this.fastify.register(cors, {
      origin: this.config.corsOrigins,
      credentials: true,
    });
  }

  /**
   * Register HTTP routes
   */
  private registerRoutes(): void {
    /**
     * Health Check
     * GET /health
     */
    this.fastify.get('/health', async (request, reply) => {
      const uptime = Date.now() - this.startTime.getTime();
      
      return {
        status: 'healthy',
        service: 'midnight-gateway',
        version: '1.0.0',
        uptime: Math.floor(uptime / 1000), // seconds
        timestamp: new Date().toISOString(),
        providers: {
          proof: !!this.providers?.proofProvider,
          publicData: !!this.providers?.publicDataProvider,
          zkConfig: !!this.providers?.zkConfigProvider,
        },
        contracts: {
          loaded: this.contractLoader?.getAllContracts().size || 0,
        },
      };
    });

    /**
     * Verify Credential
     * POST /verify
     * 
     * Body: VerificationRequest
     * Response: VerificationResponse
     */
    this.fastify.post<{
      Body: VerificationRequest;
    }>('/verify', async (request, reply) => {
      const startTime = Date.now();
      
      try {
        if (!this.verifier) {
          return reply.code(503).send({
            valid: false,
            error: 'Verifier not initialized',
            errorCode: 'SERVICE_UNAVAILABLE',
          });
        }

        const { credentialType, issuerDid, proof, challenge } = request.body;

        // Validate request
        if (!credentialType || !issuerDid || !proof) {
          return reply.code(400).send({
            valid: false,
            error: 'Missing required fields: credentialType, issuerDid, proof',
            errorCode: 'INVALID_REQUEST',
          });
        }

        // Log verification attempt
        logger.info({
          credentialType,
          issuerDid,
          challenge: challenge ? 'present' : 'none',
        }, 'Verification request received');

        // Verify credential
        const result = await this.verifier.verifyCredential({
          credentialType,
          issuerDid,
          proof,
          challenge,
        });

        const duration = Date.now() - startTime;
        
        logger.info({
          valid: result.valid,
          riskScore: result.riskScore,
          duration,
        }, 'Verification complete');

        // Set appropriate status code
        const statusCode = result.valid ? 200 : 403;
        
        return reply.code(statusCode).send(result);

      } catch (error) {
        logger.error({ error }, 'Verification error');
        
        return reply.code(500).send({
          valid: false,
          error: 'Internal verification error',
          errorCode: 'INTERNAL_ERROR',
        });
      }
    });

    /**
     * Get Issuer Information
     * GET /issuer/:did
     * 
     * Returns issuer record from registry
     */
    this.fastify.get<{
      Params: { did: string };
    }>('/issuer/:did', async (request, reply) => {
      try {
        if (!this.contractLoader) {
          return reply.code(503).send({
            error: 'Contract loader not initialized',
          });
        }

        const { did } = request.params;

        // Fetch issuer from registry contract
        // Note: This is a placeholder - actual implementation depends on contract API
        logger.info({ issuerDid: did }, 'Fetching issuer information');

        // TODO: Implement actual contract call
        // const issuer = await registryContract.api.getIssuer(did);

        // For now, return placeholder response
        return reply.code(501).send({
          error: 'Issuer lookup not yet implemented',
          issuerDid: did,
        });

      } catch (error) {
        logger.error({ error }, 'Error fetching issuer');
        
        return reply.code(500).send({
          error: 'Failed to fetch issuer information',
        });
      }
    });

    /**
     * Get Service Statistics
     * GET /stats
     */
    this.fastify.get('/stats', async (request, reply) => {
      const uptime = Date.now() - this.startTime.getTime();
      
      return {
        service: 'midnight-gateway',
        uptime: Math.floor(uptime / 1000),
        config: {
          mode: this.config.mode,
          networkId: this.config.networkId,
          proofServerUrl: this.config.proofServerUrl,
          indexerUrl: this.config.indexerUrl,
        },
        contracts: {
          loaded: this.contractLoader?.getAllContracts().size || 0,
          types: Array.from(this.contractLoader?.getAllContracts().keys() || []),
        },
        verifier: {
          cacheStats: this.verifier?.getCacheStats() || {
            size: 0,
            enabled: false,
            ttl: 0,
          },
          config: this.verifier?.getConfig() || {},
        },
        timestamp: new Date().toISOString(),
      };
    });

    /**
     * Root endpoint
     * GET /
     */
    this.fastify.get('/', async (request, reply) => {
      return {
        service: 'AgenticDID Midnight Gateway',
        version: '1.0.0',
        description: 'ZK proof verification service for AgenticDID protocol',
        endpoints: {
          health: 'GET /health',
          verify: 'POST /verify',
          issuer: 'GET /issuer/:did',
          stats: 'GET /stats',
        },
        documentation: 'https://github.com/AgenticDID/protocol',
      };
    });
  }

  /**
   * Register error handlers
   */
  private registerErrorHandlers(): void {
    // 404 handler
    this.fastify.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
        statusCode: 404,
      });
    });

    // Global error handler
    this.fastify.setErrorHandler((error, request, reply) => {
      logger.error({
        error,
        url: request.url,
        method: request.method,
      }, 'Unhandled error');

      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message,
        statusCode: 500,
      });
    });
  }

  /**
   * Initialize services
   * 
   * Sets up providers, contract loader, and verifier
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Midnight Gateway...');

    try {
      // Step 1: Create providers
      logger.info('Creating Midnight providers...');
      this.providers = await createMidnightProviders(this.config, logger);
      logger.info('✅ Providers created');

      // Step 2: Create contract loader
      logger.info('Creating contract loader...');
      this.contractLoader = await createContractLoader(this.config, logger);
      logger.info('✅ Contract loader created');

      // Step 3: Initialize verifier
      logger.info('Initializing ZK proof verifier...');
      this.verifier = new ZKProofVerifier(
        this.config,
        this.providers,
        this.contractLoader,
        logger,
      );
      await this.verifier.initialize();
      logger.info('✅ Verifier initialized');

      // Step 4: Create fraud detector
      this.fraudDetector = new FraudDetector(logger);
      logger.info('✅ Fraud detector ready');

      logger.info('🚀 Midnight Gateway initialization complete');

    } catch (error) {
      logger.error({ error }, '❌ Initialization failed');
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      const address = await this.fastify.listen({
        port: this.config.serverPort,
        host: this.config.serverHost,
      });

      logger.info(`🌟 Midnight Gateway listening on ${address}`);
      logger.info(`📊 Stats: ${address}/stats`);
      logger.info(`💚 Health: ${address}/health`);
      logger.info(`🔐 Verify: POST ${address}/verify`);

    } catch (error) {
      logger.error({ error }, 'Failed to start server');
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Midnight Gateway...');

    try {
      // Close Fastify server
      await this.fastify.close();
      logger.info('✅ Server closed');

      // Shutdown providers
      if (this.providers?.shutdown) {
        await this.providers.shutdown();
        logger.info('✅ Providers shutdown');
      }

      logger.info('👋 Midnight Gateway shutdown complete');

    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      throw error;
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const gateway = new MidnightGateway();

  // Handle shutdown signals
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down...`);
      await gateway.shutdown();
      process.exit(0);
    });
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled rejection');
    process.exit(1);
  });

  try {
    // Initialize services
    await gateway.initialize();

    // Start server
    await gateway.start();

  } catch (error) {
    logger.error({ error }, 'Failed to start Midnight Gateway');
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { MidnightGateway };
