/**
 * Proof generation and VP assembly
 */

import * as crypto from 'crypto';
import { Challenge, VP, Disclosed, MidnightReceipt, AgentCredential } from './types.js';
import { computeJWKThumbprint } from './crypto.js';

/**
 * Sign a challenge (nonce|aud|exp)
 */
export async function signChallenge(
  privateKey: crypto.webcrypto.CryptoKey,
  challenge: Challenge
): Promise<string> {
  const payload = `${challenge.nonce}|${challenge.aud}|${challenge.exp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    data
  );

  return Buffer.from(signature).toString('base64url');
}

/**
 * Build selective disclosure proof (MVP: stub, expand with ZK later)
 */
export function buildSDProof(disclosed: Disclosed, credentialHash: string): string {
  // MVP: Simple hash-based commitment
  // TODO: Replace with proper ZK selective disclosure
  const payload = JSON.stringify({ disclosed, credentialHash });
  const hash = crypto.createHash('sha256').update(payload).digest();
  return Buffer.from(hash).toString('base64url');
}

/**
 * Create a Midnight receipt (MVP: stub for demo)
 */
export function createMidnightReceipt(cred_hash: string): MidnightReceipt {
  // MVP: Generate a mock attestation
  // TODO: Wire to real Midnight proof server
  const timestamp = Date.now();
  const attestation = crypto
    .createHash('sha256')
    .update(`midnight-receipt:${cred_hash}:${timestamp}`)
    .digest('base64url');

  return {
    attestation,
    cred_hash,
  };
}

/**
 * Build a complete Verifiable Presentation (proof bundle)
 */
export async function buildVP(args: {
  credential: AgentCredential;
  challenge: Challenge;
  disclosed: Disclosed;
}): Promise<VP> {
  const { credential, challenge, disclosed } = args;

  // Sign the challenge
  const proof = await signChallenge(credential.privateKey, challenge);

  // Build selective disclosure proof
  const sd_proof = buildSDProof(disclosed, credential.cred_hash);

  // Get Midnight receipt
  const receipt = createMidnightReceipt(credential.cred_hash);

  return {
    pid: credential.pid,
    proof,
    sd_proof,
    disclosed,
    receipt,
  };
}

/**
 * Verify a VP signature (for client-side checks)
 */
export async function verifyVPSignature(
  vp: VP,
  challenge: Challenge,
  publicKey: crypto.webcrypto.CryptoKey
): Promise<boolean> {
  try {
    const payload = `${challenge.nonce}|${challenge.aud}|${challenge.exp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const signature = Buffer.from(vp.proof, 'base64url');

    return await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      signature,
      data
    );
  } catch {
    return false;
  }
}
