/**
 * ============================================================================
 * AGENTICDID SDK - CORE TYPE DEFINITIONS
 * ============================================================================
 * 
 * This module defines all TypeScript types used throughout the AgenticDID
 * protocol for privacy-preserving AI agent identity and authentication.
 * 
 * KEY CONCEPTS:
 * 
 * 1. CHALLENGE-RESPONSE AUTHENTICATION
 *    Verifier issues a challenge, agent proves identity by responding
 *    Prevents replay attacks and ensures freshness
 * 
 * 2. VERIFIABLE PRESENTATIONS (VP)
 *    Cryptographic proof bundles that demonstrate credential possession
 *    without revealing the underlying credential or private data
 * 
 * 3. SELECTIVE DISCLOSURE
 *    Agent chooses which attributes to reveal (role, scopes)
 *    Other attributes remain private (private key, full credential)
 * 
 * 4. CAPABILITY TOKENS
 *    Short-lived tokens issued after successful verification
 *    Grant temporary authorization to perform specific actions
 * 
 * DATA PRIVACY MODEL:
 * - Public: pid (agent identifier), disclosed role/scopes
 * - Private: privateKey, full credential details, undisclosed attributes
 * - Proven: Agent possesses valid credential (via ZK proof)
 * 
 * @see ./agent.ts - Agent credential creation and management
 * @see ./proof.ts - VP generation and verification
 * @see ../../docs/AGENT_DELEGATION_WORKFLOW.md - Complete protocol flow
 * 
 * @version 1.0.0 (Demo)
 * @author AgenticDID.io Team
 * ============================================================================
 */

import * as crypto from 'crypto';

/**
 * Challenge Type
 * 
 * Issued by verifier to prevent replay attacks and ensure freshness.
 * Agent must respond to this challenge to prove they're live and authorized.
 * 
 * CHALLENGE-RESPONSE FLOW:
 * 1. Frontend requests challenge from verifier API
 * 2. Verifier generates random nonce + expiration
 * 3. Agent signs challenge with private key
 * 4. Agent sends signed challenge back (in VP)
 * 5. Verifier checks signature and nonce freshness
 * 
 * SECURITY PROPERTIES:
 * - Nonce is random: prevents replay of old proofs
 * - Expiration is short: limits window for attacks
 * - Audience is specific: prevents cross-site attacks
 * 
 * @property nonce - Random string (prevents replay)
 * @property aud - Intended audience/recipient URL
 * @property exp - Expiration timestamp (Unix seconds)
 */
export type Challenge = {
  nonce: string;    // Random hex string, e.g., "a3f2...b8c1"
  aud: string;      // Target audience, e.g., "https://api.example.com"
  exp: number;      // Unix timestamp when challenge expires
};

/**
 * Disclosed Type
 * 
 * Attributes that an agent selectively reveals in their VP.
 * These are the ONLY fields visible to the verifier.
 * 
 * SELECTIVE DISCLOSURE:
 * Agent proves they have a credential with these attributes
 * WITHOUT revealing:
 * - The full credential
 * - Private key
 * - Other credential fields
 * - Credential issuer details
 * 
 * ROLE-BASED ACCESS:
 * Different roles have different permissions:
 * - Banker: Financial operations
 * - Traveler: Booking and travel services
 * - Admin: Administrative functions
 * 
 * @property role - Agent's role (determines capabilities)
 * @property scopes - Specific permissions (domain:action format)
 */
export type Disclosed = {
  role: 'Banker' | 'Traveler' | 'Admin';  // Role determines base permissions
  scopes: string[];                        // Fine-grained permissions
  // Example scopes: ['bank:transfer', 'bank:balance', 'travel:book']
};

/**
 * Midnight Receipt Type
 * 
 * Cryptographic receipt proving credential exists in Midnight registry.
 * Links the VP to on-chain credential state.
 * 
 * DEMO MODE:
 * - attestation: Base64 encoded mock signature
 * - cred_hash: Hash of credential content for lookup
 * 
 * PRODUCTION MODE:
 * - attestation: Real cryptographic proof from Midnight Network
 * - cred_hash: On-chain credential identifier
 * 
 * PURPOSE:
 * Allows verifier to check:
 * 1. Credential exists in registry
 * 2. Credential hasn't been revoked
 * 3. Credential hasn't expired
 * 4. Credential policy (role, scopes)
 * 
 * @property attestation - Cryptographic signature/proof
 * @property cred_hash - Credential identifier for registry lookup
 */
export type MidnightReceipt = {
  attestation: string;  // Midnight-signed receipt (demo: mock)
  cred_hash: string;    // Credential state hash (demo: base64)
};

/**
 * Verifiable Presentation (VP) Type
 * 
 * THIS IS THE CORE DATA STRUCTURE FOR AGENT AUTHENTICATION
 * 
 * A VP is a complete proof bundle that an agent sends to prove:
 * - Identity: "I am agent with PID X"
 * - Possession: "I possess a valid credential"
 * - Authorization: "My credential grants me role Y with scopes Z"
 * - Freshness: "I'm responding to your challenge (not replay)"
 * 
 * VP COMPONENTS:
 * 1. pid: Public identifier (not secret)
 * 2. proof: Signature over challenge (proves private key possession)
 * 3. sd_proof: Selective disclosure proof (ZK proof in production)
 * 4. disclosed: Attributes agent reveals (role, scopes)
 * 5. receipt: Link to on-chain credential (Midnight)
 * 
 * VERIFICATION PROCESS:
 * Verifier checks each component:
 * - Signature valid? (proof field)
 * - Credential exists? (receipt lookup)
 * - Not revoked? (registry check)
 * - Role matches? (disclosed vs receipt policy)
 * - ZK proof valid? (sd_proof verification)
 * 
 * @property pid - Privacy-preserving identifier (public)
 * @property proof - Signature over challenge (proves key possession)
 * @property sd_proof - Selective disclosure / ZK proof
 * @property disclosed - Revealed attributes (role, scopes)
 * @property receipt - Midnight credential receipt
 */
export type VP = {
  pid: string;                  // Agent's public identifier
  proof: string;                // Cryptographic proof (signature)
  sd_proof: string;             // Selective disclosure ZK proof
  disclosed: Disclosed;         // Attributes agent reveals
  receipt: MidnightReceipt;     // Credential registry receipt
};

/**
 * Capability Token Claims Type
 * 
 * JWT claims for capability tokens issued after successful verification.
 * These tokens grant temporary authorization to agents.
 * 
 * CAPABILITY TOKEN MODEL:
 * After verifying a VP, verifier issues a short-lived token that:
 * - Grants specific permissions (scopes)
 * - Expires quickly (typically 2-10 minutes)
 * - Is bound to agent's key (cnf/DPoP)
 * - Cannot be transferred to another agent
 * 
 * JWT STRUCTURE:
 * Header: { alg: "HS256", typ: "JWT" }
 * Payload: { ...CapClaims }
 * Signature: HMAC-SHA256(header.payload, secret)
 * 
 * STANDARD JWT CLAIMS:
 * - iss: Who issued the token
 * - sub: Who the token is for (agent PID)
 * - aud: Where the token can be used
 * - exp: When the token expires
 * 
 * CUSTOM CLAIMS:
 * - scope: What the agent can do
 * - cnf: Proof of possession binding (DPoP)
 * 
 * @property iss - Issuer (verifier API URL)
 * @property sub - Subject (agent PID)
 * @property aud - Audience (protected resource)
 * @property scope - Granted permissions
 * @property exp - Expiration timestamp
 * @property cnf - Confirmation (key binding)
 */
export type CapClaims = {
  iss: string;              // Issuer: verifier API URL
  sub: string;              // Subject: agent PID
  aud: string;              // Audience: protected resource origin
  scope: string[];          // Granted scopes (permissions)
  exp: number;              // Expiration: Unix timestamp
  cnf: { jkt: string };     // Confirmation: key thumbprint (DPoP binding)
};

/**
 * Agent Credential Type
 * 
 * PRIVATE DATA - NEVER TRANSMITTED
 * Complete credential held by agent, includes private key.
 * 
 * PRIVACY MODEL:
 * - Stored only on agent's device/system
 * - Never sent to verifier or over network
 * - Used to generate VPs (proofs of possession)
 * - Private key proves credential ownership
 * 
 * LIFECYCLE:
 * 1. Creation: Agent generates key pair + credential
 * 2. Registration: Agent registers public key + DID on-chain (production)
 * 3. Usage: Agent creates VPs to prove possession
 * 4. Expiration: Credential expires after validity period
 * 5. Revocation: Issuer can revoke if compromised
 * 
 * COMPONENTS:
 * - pid: Public identifier (safe to share)
 * - role/scopes: Permissions (can be disclosed)
 * - privateKey: CRITICAL - proves ownership
 * - publicKey: Can be shared (for signature verification)
 * - cred_hash: Identifier in registry
 * - timestamps: Track validity period
 * 
 * @property pid - Public identifier
 * @property role - Agent role
 * @property scopes - Agent permissions
 * @property privateKey - PRIVATE - signing key
 * @property publicKey - Public verification key
 * @property cred_hash - Credential hash (registry ID)
 * @property issued_at - Creation timestamp
 * @property expires_at - Expiration timestamp
 */
export type AgentCredential = {
  pid: string;                                  // Public ID
  role: Disclosed['role'];                      // Agent role
  scopes: string[];                             // Permissions
  privateKey: crypto.webcrypto.CryptoKey;       // PRIVATE - for signing
  publicKey: crypto.webcrypto.CryptoKey;        // Public - for verification
  cred_hash: string;                            // Registry identifier
  issued_at: number;                            // Unix timestamp
  expires_at: number;                           // Unix timestamp
};
