/**
 * Capability token generation (JWT)
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CapClaims } from '@agenticdid/sdk';
import { config } from './config.js';

/**
 * Generate a short-lived capability token
 */
export function generateCapabilityToken(params: {
  pid: string;
  audience: string;
  scopes: string[];
  publicKeyThumbprint?: string;
}): string {
  const { pid, audience, scopes, publicKeyThumbprint } = params;

  const claims: Partial<CapClaims> = {
    iss: config.issuer,
    sub: pid,
    aud: audience,
    scope: scopes,
    exp: Math.floor(Date.now() / 1000) + config.tokenTTL,
  };

  // Add DPoP binding if public key provided
  if (publicKeyThumbprint) {
    claims.cnf = { jkt: publicKeyThumbprint };
  }

  // Add jti for replay protection
  const jti = crypto.randomBytes(16).toString('hex');

  return jwt.sign({ ...claims, jti }, config.jwtSecret, {
    algorithm: 'HS256',
  });
}

/**
 * Verify a capability token
 */
export function verifyCapabilityToken(token: string): CapClaims | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as CapClaims;
    return decoded;
  } catch {
    return null;
  }
}
