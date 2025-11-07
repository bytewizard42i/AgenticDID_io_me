/**
 * API Routes
 */

import { FastifyInstance } from 'fastify';
import { VP } from '@agenticdid/sdk';
import { generateChallenge, storeChallenge, getChallenge } from './challenge.js';
import { verifyVP } from './verifier.js';
import { generateCapabilityToken } from './token.js';

export async function registerRoutes(app: FastifyInstance) {
  /**
   * Health check
   */
  app.get('/healthz', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  /**
   * POST /challenge - Get a fresh challenge
   */
  app.post<{
    Body: { audience?: string };
  }>('/challenge', async (request, reply) => {
    const { audience = 'agenticdid.io' } = request.body || {};

    const challenge = generateChallenge(audience, 60);
    storeChallenge(challenge);

    app.log.info({ nonce: challenge.nonce }, 'Challenge generated');

    return challenge;
  });

  /**
   * POST /present - Present a VP and get capability token
   */
  app.post<{
    Body: { vp: VP; challenge_nonce: string };
  }>('/present', async (request, reply) => {
    const { vp, challenge_nonce } = request.body;

    if (!vp || !challenge_nonce) {
      reply.code(400);
      return { error: 'Missing vp or challenge_nonce' };
    }

    // Retrieve stored challenge
    const challenge = getChallenge(challenge_nonce);
    if (!challenge) {
      reply.code(400);
      return { error: 'Invalid or expired challenge' };
    }

    // Verify VP
    const result = await verifyVP(vp, challenge);

    if (!result.valid) {
      app.log.warn({ pid: vp.pid, error: result.error }, 'VP verification failed');
      reply.code(403);
      return { error: result.error || 'Verification failed' };
    }

    // Generate capability token
    const token = generateCapabilityToken({
      pid: result.pid!,
      audience: challenge.aud,
      scopes: result.scopes || [],
    });

    app.log.info({ pid: result.pid, role: result.role }, 'VP verified, token issued');

    return {
      token,
      pid: result.pid,
      role: result.role,
      scopes: result.scopes,
      expires_in: 120,
    };
  });

  /**
   * GET /verify - Verify a capability token
   */
  app.get<{
    Querystring: { token: string };
  }>('/verify', async (request, reply) => {
    const { token } = request.query;

    if (!token) {
      reply.code(400);
      return { error: 'Missing token' };
    }

    const claims = verifyCapabilityToken(token);

    if (!claims) {
      reply.code(401);
      return { error: 'Invalid or expired token' };
    }

    return { valid: true, claims };
  });
}

/**
 * Verify capability token helper
 */
import { verifyCapabilityToken } from './token.js';
