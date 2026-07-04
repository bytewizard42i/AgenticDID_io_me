/**
 * Canonical IDs for AgenticDID Protocol
 * 
 * These are PROTOCOL LAW - reserved, foundational identities.
 * Following TD Bank philosophy: "One perfect check, then replicate."
 * 
 * NEVER use these IDs for anything other than their canonical purpose.
 * NEVER modify these without protocol governance approval.
 */

/**
 * TRUSTED ISSUER
 * 
 * AgenticDID itself - the root/canonical trusted issuer
 */
export const TRUSTED_ISSUER_0_ID = 'trusted_issuer_0' as const;
export const TRUSTED_ISSUER_0_DID = 'did:agentic:trusted_issuer_0' as const;

/**
 * CANONICAL LOCAL AGENT
 * 
 * Comet - the reference implementation of a user-local agent
 */
export const CANONICAL_AGENT_101_ID = 'canonical_agent_101' as const;
export const CANONICAL_AGENT_101_DID = 'did:agentic:canonical_agent_101' as const;

/**
 * SYSTEM-LEVEL AGENT RANGE
 * 
 * agent_0 through agent_100 are RESERVED for protocol/system agents
 * Examples:
 * - agent_0: AgenticDID Issuer Agent (KYC, credential issuance)
 * - agent_1..100: Future protocol services (governance, audit, meta-registry, etc.)
 * 
 * DO NOT use these IDs for task agents (Banker, Shopper, etc.)
 * Task agents should use IDs outside this range (e.g., agent_banker, agent_crypto)
 */
export const SYSTEM_AGENT_ID_RANGE = {
  start: 0,
  end: 100,
} as const;

/**
 * AGENTICDID ISSUER AGENT
 * 
 * agent_0 - The canonical issuer agent for trusted_issuer_0
 * Handles KYC, credential issuance, and revocation
 */
export const AGENTICDID_ISSUER_AGENT_0_ID = 'agent_0' as const;
export const AGENTICDID_ISSUER_AGENT_0_DID = 'did:agentic:agent_0' as const;

/**
 * Helper: Check if an agent ID is in the reserved system range
 * 
 * @param agentId - Agent ID to check
 * @returns True if agent_0..agent_100
 */
export function isSystemAgentId(agentId: string): boolean {
  if (!agentId.startsWith('agent_')) return false;
  
  const numStr = agentId.split('_')[1];
  if (!numStr) return false;
  
  const n = Number(numStr);
  return Number.isInteger(n) && n >= SYSTEM_AGENT_ID_RANGE.start && n <= SYSTEM_AGENT_ID_RANGE.end;
}

/**
 * Helper: Validate agent ID is NOT in reserved range
 * 
 * Throws error if attempting to use system agent ID for non-system purposes
 * 
 * @param agentId - Agent ID to validate
 * @param purpose - Description of intended use
 */
export function assertNotSystemAgentId(agentId: string, purpose: string): void {
  if (isSystemAgentId(agentId)) {
    throw new Error(
      `Agent ID "${agentId}" is in reserved system range (agent_0..agent_100). ` +
      `Cannot use for: ${purpose}. ` +
      `System agent IDs are protocol-reserved. Use IDs outside this range.`
    );
  }
}

/**
 * CANONICAL CREDENTIAL TYPES
 * 
 * Initial credential types issued by trusted_issuer_0
 */
export const CANONICAL_CREDENTIAL_TYPES = {
  // First credential issued by trusted_issuer_0
  KYC_LEVEL_1: 'KYC_LEVEL_1',
  
  // Simple age verification
  AGE_OVER_18: 'AGE_OVER_18',
} as const;

/**
 * Export all canonical IDs as a single object for reference
 */
export const CANONICAL_IDS = {
  trustedIssuer0: {
    id: TRUSTED_ISSUER_0_ID,
    did: TRUSTED_ISSUER_0_DID,
  },
  comet: {
    id: CANONICAL_AGENT_101_ID,
    did: CANONICAL_AGENT_101_DID,
  },
  issuerAgent0: {
    id: AGENTICDID_ISSUER_AGENT_0_ID,
    did: AGENTICDID_ISSUER_AGENT_0_DID,
  },
  systemAgentRange: SYSTEM_AGENT_ID_RANGE,
} as const;

/**
 * Type exports for use throughout codebase
 */
export type TrustedIssuerId = typeof TRUSTED_ISSUER_0_ID;
export type CanonicalAgentId = typeof CANONICAL_AGENT_101_ID;
export type IssuerAgent0Id = typeof AGENTICDID_ISSUER_AGENT_0_ID;
