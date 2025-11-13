/**
 * ============================================================================
 * AGENT CREDENTIAL MANAGEMENT
 * ============================================================================
 * 
 * Functions for creating and managing agent credentials.
 * Credentials are the foundation of agent identity and authorization.
 * 
 * KEY OPERATIONS:
 * - Create new agent credentials with cryptographic key pairs
 * - Check credential expiration status
 * - Generate credential hashes for registry lookup
 * 
 * SECURITY MODEL:
 * - Each agent has unique cryptographic key pair
 * - Private key proves credential ownership
 * - Public key allows signature verification
 * - Credential hash identifies agent in registry
 * 
 * DEMO vs PRODUCTION:
 * - DEMO: Credentials exist only in memory, not registered on-chain
 * - PRODUCTION: Credentials registered in AgenticDIDRegistry contract
 * 
 * @see ./types.ts - AgentCredential type definition
 * @see ./crypto.ts - Cryptographic utilities
 * 
 * @version 1.0.0 (Demo)
 * @author AgenticDID.io Team
 * ============================================================================
 */

import { AgentCredential, Disclosed } from './types.js';
import { generateRandomPID, generateKeyPair, hashCredential } from './crypto.js';

/**
 * Create a new agent credential
 * 
 * THIS FUNCTION GENERATES A COMPLETE AGENT IDENTITY
 * 
 * WHAT IT DOES:
 * 1. Generates random privacy-preserving identifier (PID)
 * 2. Creates cryptographic key pair (private + public keys)
 * 3. Computes credential hash for registry identification
 * 4. Sets validity period (issued_at and expires_at)
 * 5. Bundles everything into AgentCredential object
 * 
 * CRYPTOGRAPHIC COMPONENTS:
 * - PID: Random hex string, serves as agent's public identifier
 * - Private Key: ECDSA P-256 key for signing (NEVER share this)
 * - Public Key: Corresponding public key for signature verification
 * - Credential Hash: SHA-256 hash of credential content
 * 
 * VALIDITY PERIOD:
 * - Default: 1 year from creation
 * - Can be configured per deployment
 * - Expired credentials must be renewed
 * 
 * DEMO MODE:
 * Credentials are created in-memory only.
 * NOT registered on blockchain.
 * Used for demonstration purposes.
 * 
 * PRODUCTION MODE (Future):
 * After creation, credential would be:
 * 1. Registered in AgenticDIDRegistry contract
 * 2. Linked to user's DID via delegation
 * 3. Verifiable on-chain by verifiers
 * 
 * @param role - Agent role (Banker, Traveler, Admin)
 * @param scopes - Specific permissions granted
 * @returns AgentCredential with keys and metadata
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * const bankerAgent = await createAgent('Banker', [
 *   'bank:transfer',
 *   'bank:balance',
 *   'bank:history'
 * ]);
 * // Agent now has PID, keys, and can create VPs
 * ```
 * 
 * SECURITY NOTES:
 * - Store privateKey securely (encrypted at rest)
 * - Never transmit privateKey over network
 * - Back up credential or have recovery mechanism
 * - Rotate credentials periodically
 */
export async function createAgent(
  role: Disclosed['role'],
  scopes: string[]
): Promise<AgentCredential> {
  // Step 1: Generate unique privacy-preserving identifier
  // This PID is public and can be shared/disclosed
  const pid = generateRandomPID();
  
  // Step 2: Generate cryptographic key pair
  // Private key: For signing VPs and proving credential possession
  // Public key: For verifiers to check signatures
  const { privateKey, publicKey } = await generateKeyPair();

  // Step 3: Compute credential hash
  // Hash uniquely identifies this credential in registry
  // Format: SHA-256(JSON({pid, role, scopes}))
  const credentialContent = JSON.stringify({ pid, role, scopes });
  const cred_hash = hashCredential(credentialContent);

  // Step 4: Set validity timestamps
  // issued_at: When credential was created
  // expires_at: When credential becomes invalid (1 year default)
  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  // Step 5: Return complete credential
  return {
    pid,
    role,
    scopes,
    privateKey,    // PRIVATE - must be protected
    publicKey,     // Public - can be shared
    cred_hash,     // Registry identifier
    issued_at: now,
    expires_at: now + oneYear,
  };
}

/**
 * Check if credential is expired
 * 
 * EXPIRATION CHECKING
 * Credentials have finite validity period for security.
 * 
 * WHY CREDENTIALS EXPIRE:
 * - Limits damage if credential is compromised
 * - Forces periodic re-verification
 * - Allows permission updates
 * - Industry best practice (like SSL certificates)
 * 
 * EXPIRATION HANDLING:
 * - If expired: Agent must renew credential
 * - If near expiration: Warn agent to renew
 * - If valid: Can continue using
 * 
 * @param credential - Agent credential to check
 * @returns true if expired, false if still valid
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * if (isCredentialExpired(agent)) {
 *   console.log('Please renew your credential');
 *   // Initiate renewal process
 * } else {
 *   // Proceed with VP generation
 * }
 * ```
 */
export function isCredentialExpired(credential: AgentCredential): boolean {
  return Date.now() > credential.expires_at;
}
