/**
 * Agent credential management
 */

import { AgentCredential, Disclosed } from './types.js';
import { generateRandomPID, generateKeyPair, hashCredential } from './crypto.js';

/**
 * Create a new agent credential
 */
export async function createAgent(
  role: Disclosed['role'],
  scopes: string[]
): Promise<AgentCredential> {
  const pid = generateRandomPID();
  const { privateKey, publicKey } = await generateKeyPair();

  const credentialContent = JSON.stringify({ pid, role, scopes });
  const cred_hash = hashCredential(credentialContent);

  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  return {
    pid,
    role,
    scopes,
    privateKey,
    publicKey,
    cred_hash,
    issued_at: now,
    expires_at: now + oneYear,
  };
}

/**
 * Check if credential is expired
 */
export function isCredentialExpired(credential: AgentCredential): boolean {
  return Date.now() > credential.expires_at;
}
