/**
 * ============================================================================
 * VERIFIABLE PRESENTATION (VP) VERIFICATION LOGIC
 * ============================================================================
 * 
 * This module contains the core verification logic for agent credentials.
 * It validates Verifiable Presentations (VPs) using a multi-step process.
 * 
 * WHAT IS A VERIFIABLE PRESENTATION (VP):
 * A VP is a cryptographic proof bundle that demonstrates an agent possesses
 * valid credentials without revealing the underlying credential details.
 * 
 * VP STRUCTURE:
 * {
 *   pid: "agent_identifier",           // Public agent ID
 *   proof: "zk_proof_data",             // Zero-knowledge proof
 *   disclosed: {                        // Fields agent chooses to reveal
 *     role: "Banker",
 *     scopes: ["bank:transfer", "bank:balance"]
 *   },
 *   receipt: {                          // Credential verification data
 *     cred_hash: "credential_hash",
 *     attestation: "signature"
 *   },
 *   sd_proof: "selective_disclosure_proof"  // Proves disclosed fields are valid
 * }
 * 
 * VERIFICATION FLOW:
 * 1. Validate VP structure (all required fields present)
 * 2. Verify credential via Midnight adapter (check revocation, expiration)
 * 3. Verify disclosed role matches credential policy
 * 4. Verify selective disclosure proof (DEMO: TODO, PRODUCTION: ZK verification)
 * 5. Return verification result
 * 
 * SECURITY MODEL:
 * - Challenge prevents replay attacks (not checked here, done at route level)
 * - Receipt verification ensures credential is valid
 * - Role matching prevents privilege escalation
 * - SD proof ensures disclosed fields weren't tampered with
 * 
 * DEMO vs PRODUCTION:
 * - DEMO: Selective disclosure proof existence check only
 * - PRODUCTION: Full ZK proof cryptographic verification
 * 
 * @see @agenticdid/sdk - VP and Challenge type definitions
 * @see @agenticdid/midnight-adapter - Credential verification (MOCK)
 * @see ../../../docs/AGENT_DELEGATION_WORKFLOW.md - Complete flow explanation
 * 
 * @version 1.0.0 (Demo)
 * @author AgenticDID.io Team
 * ============================================================================
 */

import { VP, Challenge } from '@agenticdid/sdk';
import { MidnightAdapter } from '@agenticdid/midnight-adapter';
import { config } from './config.js';

/**
 * Initialize Midnight Adapter for credential verification
 * 
 * CONFIGURATION:
 * - proofServerUrl: URL for proof verification (unused in mock mode)
 * - enableMockMode: true (forces mock verification for demo)
 * 
 * MOCK MODE:
 * The adapter is hardcoded to mock mode in demo.
 * It simulates Midnight Network queries without actual blockchain calls.
 */
const midnightAdapter = new MidnightAdapter({
  proofServerUrl: config.midnightAdapterUrl,
  enableMockMode: true,  // DEMO: Always mock
});

/**
 * Verification Result Type
 * 
 * Returned by verifyVP() to indicate success or failure.
 * 
 * SUCCESS CASE:
 * { valid: true, pid: "agent_id", role: "Banker", scopes: ["bank:*"] }
 * 
 * FAILURE CASES:
 * { valid: false, error: "Credential revoked" }
 * { valid: false, error: "Role mismatch" }
 * { valid: false, error: "Invalid VP structure" }
 */
export type VerificationResult = {
  valid: boolean;        // true if verification passed
  pid?: string;          // Agent public identifier (if valid)
  role?: string;         // Agent role (if valid)
  scopes?: string[];     // Agent scopes/permissions (if valid)
  error?: string;        // Error message (if invalid)
};

/**
 * Verify a Verifiable Presentation (VP) against a challenge
 * 
 * THIS IS THE MAIN VERIFICATION FUNCTION
 * Called by the /verify endpoint when frontend submits an agent's credentials.
 * 
 * VERIFICATION STEPS:
 * 1. Structure validation - Ensure all required fields present
 * 2. Receipt verification - Check credential status via Midnight adapter
 * 3. Role verification - Ensure disclosed role matches credential policy
 * 4. Proof verification - Validate selective disclosure proof (DEMO: basic check)
 * 
 * @param vp - Verifiable Presentation from agent
 * @param challenge - Challenge that was issued (prevents replay attacks)
 * @returns VerificationResult with status and agent details
 * 
 * ERROR HANDLING:
 * All errors are caught and returned as { valid: false, error: "..." }
 * This prevents exceptions from crashing the API.
 * 
 * USAGE:
 * const result = await verifyVP(vp, challenge);
 * if (result.valid) {
 *   // Issue capability token
 * } else {
 *   // Reject with result.error
 * }
 */
export async function verifyVP(vp: VP, challenge: Challenge): Promise<VerificationResult> {
  try {
    /**
     * STEP 1: Validate VP Structure
     * 
     * REQUIRED FIELDS:
     * - pid: Public agent identifier
     * - proof: Zero-knowledge proof data
     * - disclosed: Fields agent reveals (role, scopes)
     * - receipt: Credential verification data (hash, attestation)
     * 
     * WHY THIS CHECK:
     * Malformed VPs indicate client-side issues or tampering.
     * Fail fast before expensive cryptographic operations.
     */
    if (!vp.pid || !vp.proof || !vp.disclosed || !vp.receipt) {
      return { valid: false, error: 'Invalid VP structure' };
    }

    /**
     * STEP 2: Verify Credential Receipt via Midnight Adapter
     * 
     * WHAT THIS DOES:
     * - Checks if credential hash exists in registry
     * - Verifies credential hasn't been revoked
     * - Confirms credential hasn't expired
     * - Retrieves credential policy (role, scopes)
     * 
     * DEMO MODE:
     * Midnight adapter uses string matching on credential hash.
     * Example: hash contains "banker" → returns Banker role
     * 
     * PRODUCTION MODE:
     * Would query on-chain AgenticDIDRegistry contract:
     * 1. Look up credential by hash
     * 2. Check revocation bitmap
     * 3. Verify expiration timestamp
     * 4. Return on-chain policy data
     * 
     * RECEIPT STRUCTURE:
     * {
     *   cred_hash: "base64_encoded_credential_hash",
     *   attestation: "cryptographic_signature"
     * }
     */
    const receiptResult = await midnightAdapter.verifyReceipt({
      cred_hash: vp.receipt.cred_hash,
      attestation: vp.receipt.attestation,
    });

    // Check for revocation - credential issuer has disabled this credential
    if (receiptResult.status === 'revoked') {
      return { valid: false, error: 'Credential revoked' };
    }

    // Check for expiration - credential past its validity period
    if (receiptResult.status === 'expired') {
      return { valid: false, error: 'Credential expired' };
    }

    // Catch-all for any other non-valid status
    if (receiptResult.status !== 'valid') {
      return { valid: false, error: 'Credential status unknown' };
    }

    /**
     * STEP 3: Verify Role Matches Credential Policy
     * 
     * SECURITY CHECK:
     * Ensures agent isn't lying about their role in disclosed fields.
     * The role they claim (vp.disclosed.role) must match what's in
     * their credential (receiptResult.policy.role).
     * 
     * WHY THIS MATTERS:
     * Prevents privilege escalation attacks where an agent with "Traveler"
     * credentials tries to claim they're a "Banker" to access bank APIs.
     * 
     * EXAMPLE ATTACK PREVENTED:
     * - Agent has Traveler credential (from registry)
     * - Agent discloses role: "Banker" (in VP)
     * - This check catches the mismatch and rejects
     * 
     * DEBUG LOGGING:
     * Logs role comparison for troubleshooting verification failures.
     */
    if (receiptResult.policy) {
      const policyRole = receiptResult.policy.role;
      const disclosedRole = vp.disclosed.role;

      console.log('🔍 Role comparison:', { policyRole, disclosedRole, credHash: vp.receipt.cred_hash });

      if (policyRole !== disclosedRole) {
        return { valid: false, error: 'Role mismatch' };
      }
    }

    /**
     * STEP 4: Verify Selective Disclosure Proof
     * 
     * WHAT IS SELECTIVE DISCLOSURE:
     * Agent proves they possess a credential with certain fields
     * without revealing the entire credential or other private data.
     * 
     * DEMO IMPLEMENTATION (Current):
     * - Only checks that sd_proof field exists
     * - Does NOT verify cryptographic validity
     * - Sufficient for demonstrating UX flow
     * 
     * PRODUCTION IMPLEMENTATION (Phase 2):
     * Would perform full ZK proof verification:
     * 1. Parse sd_proof as zero-knowledge proof
     * 2. Verify proof against disclosed fields
     * 3. Ensure proof was generated from valid credential
     * 4. Confirm proof corresponds to challenge nonce
     * 5. Cryptographically verify signature
     * 
     * ZK PROOF PROPERTIES:
     * - Proves: "I have a credential with role X and scopes Y"
     * - Without revealing: Credential itself, private key, other fields
     * - Cannot forge: Cryptographically impossible without valid credential
     * 
     * TODO FOR PRODUCTION:
     * Replace simple existence check with:
     * - Midnight proof server verification
     * - Circuit-specific proof validation
     * - Challenge-response binding verification
     */
    if (!vp.sd_proof) {
      return { valid: false, error: 'Missing SD proof' };
    }

    /**
     * STEP 5: All Checks Passed - Return Success
     * 
     * At this point we've verified:
     * ✅ VP structure is valid
     * ✅ Credential exists and is active (not revoked/expired)
     * ✅ Disclosed role matches credential policy
     * ✅ Selective disclosure proof present (demo: existence check)
     * 
     * RETURN DATA:
     * - valid: true (indicates successful verification)
     * - pid: Agent's public identifier
     * - role: Verified agent role (from disclosed fields)
     * - scopes: Agent's permissions (from disclosed fields)
     * 
     * NEXT STEP:
     * Route handler will use this data to issue a capability token (JWT)
     * that grants the agent temporary authorization.
     */
    return {
      valid: true,
      pid: vp.pid,
      role: vp.disclosed.role,
      scopes: vp.disclosed.scopes,
    };
  } catch (error) {
    /**
     * ERROR HANDLING
     * 
     * PHILOSOPHY:
     * Never throw exceptions from verification function.
     * Always return a VerificationResult, even for errors.
     * 
     * WHY:
     * - API remains stable (no 500 errors from exceptions)
     * - Client gets clear error messages
     * - Easier to log and monitor failures
     * 
     * ERROR TYPES CAUGHT:
     * - Network errors (adapter calls fail)
     * - Parsing errors (malformed data)
     * - Type errors (unexpected data types)
     * - Any other unexpected exceptions
     */
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Check if agent has required scope
 * 
 * SCOPE CHECKING UTILITY
 * Determines if an agent's scopes include a required permission.
 * 
 * SCOPE FORMAT:
 * Scopes are strings like "bank:transfer", "bank:balance", "travel:book"
 * Format: "domain:action"
 * 
 * WILDCARD SUPPORT:
 * "*" scope grants all permissions (superuser)
 * 
 * USAGE:
 * if (hasScope(agent.scopes, 'bank:transfer')) {
 *   // Agent can perform bank transfers
 * }
 * 
 * @param scopes - Array of agent's scopes from verified VP
 * @param required - Required scope to check for
 * @returns true if agent has the required scope or wildcard
 * 
 * EXAMPLES:
 * hasScope(['bank:transfer', 'bank:balance'], 'bank:transfer') → true
 * hasScope(['bank:balance'], 'bank:transfer') → false
 * hasScope(['*'], 'anything') → true (wildcard)
 */
export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes(required) || scopes.includes('*');
}
