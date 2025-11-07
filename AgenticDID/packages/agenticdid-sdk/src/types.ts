/**
 * AgenticDID SDK - Core Types
 * Privacy-preserving identity protocol for AI agents
 */

import * as crypto from 'crypto';

/** Challenge from verifier */
export type Challenge = {
  nonce: string;
  aud: string;
  exp: number;
};

/** Minimally disclosed claims */
export type Disclosed = {
  role: 'Banker' | 'Traveler' | 'Admin';
  scopes: string[];
};

/** Midnight receipt for credential state */
export type MidnightReceipt = {
  attestation: string; // Midnight-signed receipt
  cred_hash: string;   // credential state hash
};

/** Verifiable Presentation (proof bundle) */
export type VP = {
  pid: string;           // privacy-preserving digital identifier
  proof: string;         // signature over (nonce|aud|exp)
  sd_proof: string;      // selective disclosure / ZK payload
  disclosed: Disclosed;  // minimally revealed claims
  receipt: MidnightReceipt;
};

/** Capability token claims (JWT-like) */
export type CapClaims = {
  iss: string;           // verifier API URL
  sub: string;           // agent PID
  aud: string;           // protected resource origin
  scope: string[];       // granted scopes
  exp: number;           // short TTL
  cnf: { jkt: string };  // key thumbprint (DPoP binding)
};

/** Agent credential (held privately) */
export type AgentCredential = {
  pid: string;
  role: Disclosed['role'];
  scopes: string[];
  privateKey: crypto.webcrypto.CryptoKey;
  publicKey: crypto.webcrypto.CryptoKey;
  cred_hash: string;
  issued_at: number;
  expires_at: number;
};
