/**
 * Cryptographic utilities for AgenticDID
 */

import * as crypto from 'crypto';
import bs58 from 'bs58';
import { SignJWT, importJWK } from 'jose';

/**
 * Generate a privacy-preserving digital identifier (PID) from seed
 */
export function createPIDFromSeed(seed: Uint8Array): string {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return 'pid:' + bs58.encode(hash);
}

/**
 * Generate a random PID (for demo/testing)
 */
export function generateRandomPID(): string {
  const randomBytes = crypto.randomBytes(32);
  return createPIDFromSeed(randomBytes);
}

/**
 * Generate an ES256 key pair for agent signing
 */
export async function generateKeyPair(): Promise<{
  privateKey: crypto.webcrypto.CryptoKey;
  publicKey: crypto.webcrypto.CryptoKey;
  publicKeyJWK: any;
}> {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyJWK = await crypto.subtle.exportKey('jwk', publicKey);

  return { privateKey, publicKey, publicKeyJWK };
}

/**
 * Compute JWK thumbprint (for DPoP binding)
 */
export function computeJWKThumbprint(jwk: any): string {
  const fields = ['crv', 'kty', 'x', 'y'];
  const filtered = fields
    .filter((k) => jwk[k])
    .reduce((acc, k) => ({ ...acc, [k]: jwk[k] }), {});
  const canonical = JSON.stringify(filtered);
  const hash = crypto.createHash('sha256').update(canonical).digest();
  return bs58.encode(hash);
}

/**
 * Hash credential content for state anchor
 */
export function hashCredential(content: string): string {
  const hash = crypto.createHash('sha256').update(content).digest();
  return bs58.encode(hash);
}
