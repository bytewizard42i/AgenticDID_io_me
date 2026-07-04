/**
 * ============================================================================
 * MIDNIGHT GATEWAY SERVICE CLIENT
 * ============================================================================
 * 
 * HTTP client for communicating with the Midnight Gateway service.
 * 
 * The Midnight Gateway is responsible for:
 * - Verifying Verifiable Presentations (VPs) with agent credentials
 * - Interacting with Midnight Network for ZK proof verification
 * - Coordinating with Midnight proof server (Docker container)
 * - Checking credential revocation status
 * 
 * KEY RESPONSIBILITIES:
 * - Verify agent credential VPs via ZK proofs
 * - Handle proof verification requests
 * - Manage connection to Midnight Network devnet
 * - Provide type-safe API for credential verification
 * 
 * DATA FLOW:
 * ```
 * API Gateway Auth Route
 *   → MidnightClient.verifyPresentation()
 *     → HTTP POST to Midnight Gateway
 *       → Gateway submits to Midnight Network
 *         → ZK proof verified on-chain
 *           → Credential status checked
 *             → Result returned
 *   ← Client returns verification result
 * ← Route issues capability token if valid
 * ```
 * 
 * TECHNOLOGY STACK:
 * - fetch API: Standard HTTP client
 * - zod: Response validation
 * - pino: Structured logging
 * 
 * MIDNIGHT NETWORK INTEGRATION:
 * - Network: Devnet (testnet)
 * - Token: tDUST (test tokens from faucet)
 * - Contract: Credential Registry (Compact language)
 * - Proof Server: Docker container with Midnight SDK
 * 
 * RELATED FILES:
 * @see src/routes/auth.ts - Uses this client to verify credentials
 * @see src/config.ts - Provides Midnight Gateway URL
 * @see ../../../contracts/ - Midnight smart contracts (Phase 3)
 * 
 * SECURITY NOTES:
 * - Never trust VP without verification via this client
 * - Always check revocation status
 * - Verify proof challenge matches what we issued
 * - Log all verification attempts for audit trail
 * 
 * FUTURE PHASES:
 * Phase 3 will implement the actual Midnight Gateway service.
 * For now, this client is ready but will fail until Phase 3 completes.
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
 * Request to verify a Verifiable Presentation
 * 
 * FIELDS:
 * - presentation: The VP in JSON-LD format containing agent credentials
 * - challenge: Nonce we issued to prevent replay attacks
 * - agentType: Type of agent being verified (comet, banker, etc.)
 * 
 * SECURITY:
 * The challenge MUST match what we previously issued via /challenge endpoint.
 * This prevents replay attacks where an attacker reuses an old VP.
 */
export interface VerifyPresentationRequest {
  presentation: Record<string, unknown>; // JSON-LD VP
  challenge: string;
  agentType: string;
}

/**
 * Result of VP verification
 * 
 * FIELDS:
 * - valid: Whether the presentation is cryptographically valid
 * - agentDid: DID of the verified agent
 * - capabilities: Array of capabilities the agent is authorized for
 * - isRevoked: Whether this credential has been revoked
 * - proofVerified: Whether the ZK proof was verified on Midnight Network
 * - verificationTime: ISO timestamp of verification
 */
export interface VerifyPresentationResponse {
  valid: boolean;
  agentDid?: string;
  pid?: string; // Privacy-preserving identifier
  role?: string; // Agent role
  capabilities?: string[];
  scopes?: string[]; // Authorization scopes
  isRevoked?: boolean;
  proofVerified?: boolean;
  verificationTime: string;
  error?: string;
}

/**
 * Health status of Midnight Gateway
 */
export interface MidnightHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    midnightNetwork: boolean;
    proofServer: boolean;
    contractDeployed: boolean;
  };
  networkInfo?: {
    network: 'devnet' | 'testnet' | 'mainnet';
    contractAddress?: string;
  };
}

/**
 * Credential revocation request
 * 
 * PURPOSE:
 * Allow authorized parties to revoke agent credentials.
 * Revoked credentials will fail verification.
 * 
 * SECURITY:
 * This endpoint requires special authorization (not implemented in Phase 1).
 */
export interface RevokeCredentialRequest {
  agentDid: string;
  reason: string;
  revokedBy: string; // DID of entity performing revocation
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for validating VP verification responses
 */
const verifyPresentationResponseSchema = z.object({
  valid: z.boolean(),
  agentDid: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  isRevoked: z.boolean().optional(),
  proofVerified: z.boolean().optional(),
  verificationTime: z.string(),
  error: z.string().optional(),
});

const midnightHealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  timestamp: z.string(),
  checks: z.object({
    midnightNetwork: z.boolean(),
    proofServer: z.boolean(),
    contractDeployed: z.boolean(),
  }),
  networkInfo: z.object({
    network: z.enum(['devnet', 'testnet', 'mainnet']),
    contractAddress: z.string().optional(),
  }).optional(),
});

// ============================================================================
// CLIENT CLASS
// ============================================================================

/**
 * HTTP client for Midnight Gateway service
 * 
 * USAGE:
 * ```typescript
 * const client = new MidnightClient('http://midnight:3002', logger);
 * 
 * // Verify an agent's credential
 * const result = await client.verifyPresentation({
 *   presentation: vpFromFrontend,
 *   challenge: storedChallenge,
 *   agentType: 'comet'
 * });
 * 
 * if (result.valid && !result.isRevoked) {
 *   // Issue capability token
 * }
 * ```
 * 
 * ERROR HANDLING:
 * - Network errors: Throws with connection error message
 * - Invalid VP: Returns { valid: false, error: '...' }
 * - Revoked credential: Returns { valid: true, isRevoked: true }
 * - Midnight Network down: Throws error (cannot verify)
 * 
 * PERFORMANCE:
 * VP verification involves ZK proof checking on-chain, which takes 2-5 seconds.
 * Timeout is set to 30 seconds to accommodate network latency.
 */
export class MidnightClient {
  private readonly baseUrl: string;
  private readonly logger: FastifyBaseLogger;
  private readonly timeout: number = 30000; // 30 seconds for ZK proof verification

  /**
   * Create a new Midnight Gateway client
   * 
   * @param baseUrl - Base URL of Midnight Gateway (e.g., 'http://midnight:3002')
   * @param logger - Pino logger instance for structured logging
   */
  constructor(baseUrl: string, logger: FastifyBaseLogger) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.logger = logger.child({ component: 'MidnightClient' });
    
    this.logger.info({ baseUrl: this.baseUrl }, 'Midnight client initialized');
  }

  /**
   * Verify a Verifiable Presentation containing agent credentials
   * 
   * PURPOSE:
   * This is THE critical security function. It verifies that:
   * 1. The VP is cryptographically valid (signatures check out)
   * 2. The ZK proof verifies on Midnight Network
   * 3. The credential has not been revoked
   * 4. The challenge matches (prevents replay attacks)
   * 
   * PROCESS:
   * 1. Send VP to Midnight Gateway
   * 2. Gateway extracts proof and submits to Midnight Network
   * 3. Network verifies ZK proof on-chain
   * 4. Gateway checks revocation status in contract
   * 5. Return verification result
   * 
   * SECURITY CRITICAL:
   * Never issue a capability token without calling this first.
   * Always check both `valid` and `!isRevoked` before authorization.
   * 
   * @param request - VP and challenge to verify
   * @returns Verification result with agent DID and capabilities
   * @throws Error if verification service is unavailable
   */
  async verifyPresentation(
    request: VerifyPresentationRequest
  ): Promise<VerifyPresentationResponse> {
    const startTime = Date.now();
    
    this.logger.info(
      { agentType: request.agentType, challenge: request.challenge },
      'Verifying presentation via Midnight Gateway'
    );

    try {
      // Make HTTP request to Midnight Gateway
      const response = await fetch(`${this.baseUrl}/verify`, {
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
          'Presentation verification failed'
        );
        
        // Return invalid result rather than throwing
        // This allows caller to handle gracefully
        return {
          valid: false,
          verificationTime: new Date().toISOString(),
          error: `Verification service error: ${response.status}`,
        };
      }

      // Parse and validate response
      const data = await response.json();
      const validated = verifyPresentationResponseSchema.parse(data);

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          valid: validated.valid,
          isRevoked: validated.isRevoked,
          agentDid: validated.agentDid,
          duration,
        },
        'Presentation verification completed'
      );

      return validated;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          { duration, timeout: this.timeout },
          'Presentation verification timed out'
        );
        return {
          valid: false,
          verificationTime: new Date().toISOString(),
          error: 'Verification timed out',
        };
      }

      // Handle other errors
      this.logger.error(
        { error, duration },
        'Presentation verification error'
      );
      
      throw error;
    }
  }

  /**
   * Check health of Midnight Gateway service
   * 
   * PURPOSE:
   * Verify that Midnight Gateway is running and connected to Midnight Network.
   * Used by API Gateway's health check endpoint.
   * 
   * CHECKS:
   * - Gateway service is running
   * - Can connect to Midnight Network devnet
   * - Proof server (Docker) is accessible
   * - Credential Registry contract is deployed
   * 
   * @returns Health status with network info
   * @throws Error if health check fails
   */
  async checkHealth(): Promise<MidnightHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health checks
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return midnightHealthResponseSchema.parse(data);
    } catch (error) {
      this.logger.error({ error }, 'Midnight health check failed');
      throw error;
    }
  }

  /**
   * Revoke an agent credential
   * 
   * PURPOSE:
   * Mark a credential as revoked in the Midnight Network contract.
   * Revoked credentials will fail future verification attempts.
   * 
   * USE CASES:
   * - Compromised agent key
   * - Agent misbehavior
   * - Expired authorization
   * - Administrative action
   * 
   * SECURITY:
   * This is a privileged operation. In production, requires special authorization.
   * For demo, we may allow revocation for testing purposes.
   * 
   * @param request - Revocation details
   * @throws Error if revocation fails
   */
  async revokeCredential(request: RevokeCredentialRequest): Promise<void> {
    this.logger.info(
      { agentDid: request.agentDid, reason: request.reason },
      'Revoking credential'
    );

    try {
      const response = await fetch(`${this.baseUrl}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Revocation failed: ${response.status} ${errorText}`);
      }

      this.logger.info(
        { agentDid: request.agentDid },
        'Credential revoked successfully'
      );
    } catch (error) {
      this.logger.error({ error, agentDid: request.agentDid }, 'Revocation failed');
      throw error;
    }
  }

  /**
   * Get network information
   * 
   * PURPOSE:
   * Retrieve information about the Midnight Network connection.
   * Useful for debugging and status displays.
   * 
   * @returns Network information
   */
  async getNetworkInfo(): Promise<{
    network: string;
    contractAddress?: string;
    blockHeight?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/network-info`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Failed to get network info: ${response.status}`);
      }

      return await response.json() as {
        network: string;
        contractAddress?: string;
        blockHeight?: number;
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to get network info');
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
const placeholderLogger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  child: () => placeholderLogger,
} as any;

export const midnightClient = new MidnightClient(
  config.services.midnightGatewayUrl,
  placeholderLogger
);

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */

export default MidnightClient;
