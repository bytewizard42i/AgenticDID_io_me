/**
 * ============================================================================
 * AUTHENTICATION ROUTES (CHALLENGE / PRESENT / VERIFY)
 * ============================================================================
 *
 * PURPOSE:
 * Implement the same authentication workflow as the demo, but wired for
 * real infrastructure. This file mirrors the behavior of the demo's
 * verifier API routes, with a few improvements and clearer structure.
 *
 * ENDPOINTS:
 * - POST /challenge
 *   - Generate a fresh verification challenge (nonce, audience, expiry)
 * - POST /present
 *   - Accept a Verifiable Presentation (VP) + challenge nonce
 *   - Verify VP via Midnight Gateway
 *   - Issue short-lived capability token if valid
 * - GET /verify
 *   - Verify a capability token (JWT) and return claims
 *
 * DEMO PARITY:
 * This is designed to match the demo behavior:
 * - Same request/response shapes (where possible)
 * - Same field names (vp, challenge_nonce, token, pid, role, scopes)
 * - Same token TTL (120 seconds)
 *
 * DIFFERENCES FROM DEMO:
 * - Uses real Midnight Gateway instead of mock adapter
 * - Uses centralized configuration
 * - Better error handling and logging
 *
 * RELATED FILES:
 * @see ../../../AgenticDID_DEMO-LAND/agentic-did/apps/verifier-api/src/routes.ts
 * @see ../services/midnightClient.ts - Midnight integration
 * @see ../services/tokenService.ts    - Token generation/verification
 *
 * ============================================================================
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { midnightClient } from '../services/midnightClient.js';
import { tokenService } from '../services/tokenService.js';

/**
 * Types representing the Verifiable Presentation (VP) from the SDK.
 *
 * In the real implementation we will import this from the AgenticDID SDK,
 * but for now we define a minimal shape needed for the API.
 */
const vpSchema = z.object({
  pid: z.string(), // Privacy-preserving Identifier
  proofs: z.array(z.unknown()),
  // Additional fields can be added as needed
});

/**
 * In-memory store for challenges (demo-style).
 *
 * NOTE: For production we would typically use Redis or a database for
 * challenge storage, but in this phase we keep it simple and in-memory
 * just like the demo.
 */
interface Challenge {
  nonce: string;
  aud: string; // audience
  exp: number; // unix timestamp (seconds)
}

const challengeStore = new Map<string, Challenge>();

/**
 * Generate a cryptographically strong random nonce.
 */
function generateNonce(bytes: number = 16): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Buffer.from(buffer).toString('hex');
}

/**
 * Generate a new challenge for a given audience.
 */
function generateChallenge(audience: string, ttlSeconds: number): Challenge {
  const nonce = generateNonce();
  const nowSeconds = Math.floor(Date.now() / 1000);

  return {
    nonce,
    aud: audience,
    exp: nowSeconds + ttlSeconds,
  };
}

/**
 * Store challenge in memory.
 */
function storeChallenge(challenge: Challenge) {
  challengeStore.set(challenge.nonce, challenge);
}

/**
 * Retrieve a challenge by nonce, ensuring it is not expired.
 */
function getChallenge(nonce: string): Challenge | null {
  const challenge = challengeStore.get(nonce);
  if (!challenge) return null;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (challenge.exp < nowSeconds) {
    challengeStore.delete(nonce);
    return null;
  }

  return challenge;
}

/**
 * Register authentication routes.
 */
export async function registerAuthRoutes(app: FastifyInstance) {
  /**
   * POST /challenge
   *
   * Generate a fresh verification challenge.
   *
   * REQUEST BODY:
   * ```json
   * { "audience": "agenticdid.io" }
   * ```
   *
   * RESPONSE:
   * ```json
   * {
   *   "nonce": "...",
   *   "aud": "agenticdid.io",
   *   "exp": 1731585600
   * }
   * ```
   */
  app.post('/challenge', async (request, reply) => {
    const bodySchema = z.object({
      audience: z.string().default('agenticdid.io'),
    });

    const parsed = bodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.status(400);
      return { error: 'Invalid request body', details: parsed.error.flatten() };
    }

    const { audience } = parsed.data;

    const challenge = generateChallenge(audience, 60);
    storeChallenge(challenge);

    app.log.info({ nonce: challenge.nonce, audience }, 'Challenge generated');

    return challenge;
  });

  /**
   * POST /present
   *
   * Accept a Verifiable Presentation (VP) and challenge nonce, verify via
   * Midnight Gateway, and issue a capability token.
   *
   * REQUEST BODY:
   * ```json
   * {
   *   "vp": { ... },
   *   "challenge_nonce": "abc123"
   * }
   * ```
   *
   * RESPONSE (success):
   * ```json
   * {
   *   "token": "<jwt>",
   *   "pid": "pid123",
   *   "role": "agent",
   *   "scopes": ["balance:read"],
   *   "expires_in": 120
   * }
   * ```
   */
  app.post('/present', async (request, reply) => {
    const bodySchema = z.object({
      vp: vpSchema,
      challenge_nonce: z.string(),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { error: 'Missing or invalid vp or challenge_nonce' };
    }

    const { vp, challenge_nonce } = parsed.data;

    // Retrieve stored challenge
    const challenge = getChallenge(challenge_nonce);
    if (!challenge) {
      reply.status(400);
      return { error: 'Invalid or expired challenge' };
    }

    // Verify VP via Midnight Gateway
    const verificationResult = await midnightClient.verifyPresentation({
      presentation: vp as Record<string, unknown>,
      challenge: challenge_nonce,
      agentType: 'agent', // Could be extracted from VP if needed
    });

    if (!verificationResult.valid) {
      app.log.warn(
        { pid: vp.pid, error: verificationResult.error },
        'VP verification failed'
      );
      reply.status(403);
      return { error: verificationResult.error || 'Verification failed' };
    }

    // Generate capability token
    if (!verificationResult.pid) {
      reply.status(403);
      return { error: 'Verification result missing pid' };
    }

    const tokenPayload = {
      pid: verificationResult.pid,
      audience: challenge.aud,
      scopes: verificationResult.scopes ?? [],
    };

    const token = tokenService.generateToken(tokenPayload);

    app.log.info(
      { pid: verificationResult.pid, role: verificationResult.role },
      'VP verified, token issued'
    );

    return {
      token,
      pid: verificationResult.pid,
      role: verificationResult.role,
      scopes: verificationResult.scopes,
      expires_in: config.security.tokenExpirationSeconds,
    };
  });

  /**
   * GET /verify
   *
   * Verify a capability token and return its claims.
   *
   * QUERY:
   * - token: string (required)
   *
   * RESPONSE (success):
   * ```json
   * {
   *   "valid": true,
   *   "claims": { ... }
   * }
   * ```
   */
  app.get('/verify', async (request, reply) => {
    const querySchema = z.object({
      token: z.string(),
    });

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return { error: 'Missing token' };
    }

    const { token } = parsed.data;

    const claims = tokenService.verifyToken(token);

    if (!claims) {
      reply.status(401);
      return { error: 'Invalid or expired token' };
    }

    return { valid: true, claims };
  });

  app.log.info('✅ Auth routes registered');
}

/**
 * END OF FILE
 * ============================================================================
 */
