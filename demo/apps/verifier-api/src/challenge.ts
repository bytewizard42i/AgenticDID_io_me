/**
 * Challenge generation and management
 */

import crypto from 'crypto';
import { Challenge } from '@agenticdid/sdk';

/**
 * Generate a fresh challenge nonce
 */
export function generateChallenge(audience: string, ttlSeconds: number = 60): Challenge {
  const nonce = crypto.randomBytes(32).toString('base64url');
  const exp = Date.now() + ttlSeconds * 1000;

  return {
    nonce,
    aud: audience,
    exp,
  };
}

/**
 * Verify challenge hasn't expired
 */
export function isChallengeValid(challenge: Challenge): boolean {
  return Date.now() < challenge.exp;
}

// In-memory challenge store (MVP)
// TODO: Use Redis or similar for production
const challengeStore = new Map<string, Challenge>();

/**
 * Store challenge for later validation
 */
export function storeChallenge(challenge: Challenge): void {
  challengeStore.set(challenge.nonce, challenge);

  // Auto-cleanup after expiry
  setTimeout(() => {
    challengeStore.delete(challenge.nonce);
  }, challenge.exp - Date.now() + 5000);
}

/**
 * Retrieve and validate stored challenge
 */
export function getChallenge(nonce: string): Challenge | null {
  const challenge = challengeStore.get(nonce);
  if (!challenge) return null;
  if (!isChallengeValid(challenge)) {
    challengeStore.delete(nonce);
    return null;
  }
  return challenge;
}
