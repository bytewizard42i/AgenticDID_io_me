/**
 * AgenticDID SDK - Main Entry Point
 * Privacy-preserving identity protocol for AI agents
 */

// Types
export * from './types.js';

// Crypto utilities
export {
  createPIDFromSeed,
  generateRandomPID,
  generateKeyPair,
  computeJWKThumbprint,
  hashCredential,
} from './crypto.js';

// Proof generation
export { signChallenge, buildSDProof, buildVP, verifyVPSignature } from './proof.js';

// Agent management
export { createAgent, isCredentialExpired } from './agent.js';
