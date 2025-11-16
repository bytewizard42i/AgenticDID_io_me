/**
 * ============================================================================
 * MIDNIGHT ADAPTER - MOCK IMPLEMENTATION FOR DEMO
 * ============================================================================
 * 
 * ⚠️ CRITICAL: THIS IS A MOCK IMPLEMENTATION FOR HACKATHON DEMO ⚠️
 * 
 * This adapter simulates Midnight Network integration without requiring
 * actual blockchain connectivity. It enables fast, reliable demonstrations
 * without external dependencies.
 * 
 * WHAT THIS MOCK DOES:
 * - Simulates credential verification based on string matching
 * - Returns hardcoded policy data for demo agents (Banker, Traveler, Shopper)
 * - Implements simple revocation logic for demonstration
 * - Provides consistent, predictable behavior for hackathon judges
 * 
 * WHAT THE REAL VERSION WILL DO:
 * - Query on-chain AgenticDIDRegistry contract via Midnight Network
 * - Verify actual zero-knowledge proofs cryptographically
 * - Check real revocation status from blockchain state
 * - Integrate with Midnight proof server for ZK verification
 * - Use Mesh SDK to interact with Midnight Network testnet
 * 
 * DEMO vs PRODUCTION:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ DEMO (Current)          │ PRODUCTION (Phase 2)                 │
 * ├─────────────────────────┼──────────────────────────────────────│
 * │ String matching         │ On-chain contract queries            │
 * │ Hardcoded roles         │ Cryptographic proof verification     │
 * │ Simple revocation check │ Blockchain revocation registry       │
 * │ No network calls        │ Real Midnight Network integration    │
 * │ Instant response        │ ~500ms for ZK proof verification     │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * WHY USE A MOCK:
 * 1. Hackathon Environment: No testnet access required, works offline
 * 2. Reliability: No network issues, always available for demos
 * 3. Speed: <1ms verification vs ~500ms with real ZK proofs
 * 4. Focus: Demonstrates UX and architecture without blockchain complexity
 * 5. Testability: Easy to test all scenarios (valid, revoked, expired)
 * 
 * PRODUCTION MIGRATION PATH:
 * This file will be replaced with RealMidnightAdapter that:
 * 1. Connects to Midnight Network RPC endpoint
 * 2. Queries AgenticDIDRegistry.compact contract
 * 3. Verifies ZK proofs using Midnight proof server
 * 4. Returns real on-chain credential data
 * 
 * @see ../midnight-adapter-v2/ - Future real implementation (Phase 2)
 * @see ../../../contracts/AgenticDIDRegistry.compact - On-chain registry
 * @see ../../../contracts/CredentialVerifier.compact - Proof verifier
 * @see ../../../docs/PHASE2_IMPLEMENTATION.md - Migration roadmap
 * 
 * @version 1.0.0 (Demo - Mock Implementation)
 * @author AgenticDID.io Team
 * ============================================================================
 */

import {
  VerifyReceiptInput,
  VerifyReceiptResult,
  MidnightAdapterConfig,
  CredentialStatus,
} from './types.js';

/**
 * Midnight Adapter Class
 * 
 * MOCK MODE (Current):
 * This class simulates Midnight Network integration for demo purposes.
 * All methods return plausible mock data based on simple heuristics.
 * 
 * CONFIGURATION:
 * - enableMockMode: Always true in this version
 * - Future: Will support real mode with RPC URL, contract addresses
 */
export class MidnightAdapter {
  private config: MidnightAdapterConfig;

  /**
   * Initialize the Midnight Adapter
   * 
   * @param config - Configuration object
   * 
   * MOCK MODE HARDCODED:
   * enableMockMode is forcibly set to true in constructor
   * This ensures demo never tries to make real network calls
   */
  constructor(config: MidnightAdapterConfig = {}) {
    this.config = {
      enableMockMode: true,  // ALWAYS true in demo version
      ...config,
    };
  }

  /**
   * Verify a Midnight receipt and check credential state
   * 
   * THIS IS THE CORE VERIFICATION METHOD
   * 
   * DEMO MODE (Current):
   * - Uses mockVerifyReceipt() to simulate verification
   * - No actual cryptographic verification
   * - Returns hardcoded policy data based on credential hash
   * 
   * PRODUCTION MODE (Phase 2):
   * Will perform these steps:
   * 1. Parse attestation (ZK proof from verifiable presentation)
   * 2. Verify cryptographic signature using public key
   * 3. Query AgenticDIDRegistry contract for credential data
   * 4. Check revocation bitmap on-chain
   * 5. Verify ZK proof using Midnight proof server
   * 6. Return real on-chain status + policy
   * 
   * @param input - Verification request containing credential hash and attestation
   * @returns Verification result with status and policy
   * 
   * STATUS VALUES:
   * - 'valid': Credential is active and proof verified
   * - 'revoked': Credential has been revoked by issuer
   * - 'expired': Credential past expiration time
   * - 'invalid': Proof verification failed or credential not found
   */
  async verifyReceipt(input: VerifyReceiptInput): Promise<VerifyReceiptResult> {
    // DEMO: Always use mock mode
    if (this.config.enableMockMode) {
      return this.mockVerifyReceipt(input);
    }

    // PRODUCTION: Real Midnight verification (not implemented in demo)
    // 1. Parse attestation (ZK proof)
    // 2. Verify signature with agent's public key
    // 3. Query state from AgenticDIDRegistry.compact contract
    // 4. Check revocation list on-chain
    // 5. Verify ZK proof using Midnight proof server
    // 6. Return verified status + policy from contract

    throw new Error('Real Midnight verification not yet implemented');
  }

  /**
   * Mock verification for MVP demo
   */
  private mockVerifyReceipt(input: VerifyReceiptInput): VerifyReceiptResult {
    // Simple heuristic for demo: certain hashes are "revoked"
    const revokedHashes = ['rogue', 'revoked', 'invalid'];
    const isRevoked = revokedHashes.some((term) => input.cred_hash.includes(term));

    if (isRevoked) {
      return {
        status: 'revoked',
        verified_at: Date.now(),
      };
    }

    // Default: valid with role-based policy
    const policy = this.extractPolicyFromHash(input.cred_hash);

    return {
      status: 'valid',
      policy,
      verified_at: Date.now(),
    };
  }

  /**
   * Extract policy from credential hash (demo helper)
   */
  private extractPolicyFromHash(cred_hash: string): any {
    // Simple mapping for demo
    console.log('🔍 Extracting policy from hash:', cred_hash.substring(0, 50));
    
    // Decode base64 to get the original content
    let decodedHash = cred_hash;
    try {
      decodedHash = Buffer.from(cred_hash, 'base64').toString('utf-8');
      console.log('📝 Decoded hash:', decodedHash.substring(0, 80));
    } catch (e) {
      console.log('⚠️ Could not decode hash, using as-is');
    }
    
    // Map agent types to policies - FOR DEMO: Always return valid for non-rogue agents
    if (decodedHash.includes('bank_agent')) {
      console.log('✅ Found bank_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['bank:transfer', 'bank:balance', 'bank:statements'] };
    }
    if (decodedHash.includes('cex_agent')) {
      console.log('✅ Found cex_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['crypto:trade', 'crypto:balance', 'crypto:withdraw'] };
    }
    if (decodedHash.includes('amazon_agent')) {
      console.log('✅ Found amazon_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['shop:purchase', 'shop:cart', 'shop:track'] };
    }
    if (decodedHash.includes('airline_agent')) {
      console.log('✅ Found airline_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['travel:book', 'travel:cancel', 'travel:checkin'] };
    }
    if (decodedHash.includes('voting_agent')) {
      console.log('✅ Found voting_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['voting:register', 'voting:cast', 'voting:verify'] };
    }
    if (decodedHash.includes('doctors_office_agent')) {
      console.log('✅ Found doctors_office_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['medical:appointment', 'medical:prescription', 'medical:records'] };
    }
    if (decodedHash.includes('stanford_hospital_agent')) {
      console.log('✅ Found stanford_hospital_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['hospital:admit', 'hospital:surgery', 'hospital:emergency', 'hospital:records'] };
    }
    if (decodedHash.includes('stanford_ivf_agent')) {
      console.log('✅ Found stanford_ivf_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['ivf:consultation', 'ivf:treatment', 'ivf:embryo', 'ivf:pregnancy'] };
    }
    if (decodedHash.includes('stanford_college_agent')) {
      console.log('✅ Found stanford_college_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['education:transcript', 'education:enroll', 'education:degree', 'research:lab'] };
    }
    if (decodedHash.includes('blue_cross_agent')) {
      console.log('✅ Found blue_cross_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['insurance:coverage', 'insurance:claim', 'insurance:benefit'] };
    }
    if (decodedHash.includes('medical_records_agent')) {
      console.log('✅ Found medical_records_agent in hash');
      return { role: 'TASK_AGENT', scopes: ['records:aggregate', 'records:consent', 'records:share'] };
    }
    
    // Legacy support for old agent types
    if (decodedHash.includes('banker')) {
      console.log('✅ Found banker (legacy) in hash');
      return { role: 'TASK_AGENT', scopes: ['bank:transfer', 'bank:balance'] };
    }
    if (decodedHash.includes('traveler')) {
      console.log('✅ Found traveler (legacy) in hash');
      return { role: 'TASK_AGENT', scopes: ['travel:book', 'travel:cancel'] };
    }
    if (decodedHash.includes('shopper')) {
      console.log('✅ Found shopper (legacy) in hash');
      return { role: 'TASK_AGENT', scopes: ['shop:purchase', 'shop:cart'] };
    }
    
    // Default - return valid TASK_AGENT role for demo (unless it's rogue)
    console.log('⚠️ No specific agent type found in hash, using default TASK_AGENT');
    return { role: 'TASK_AGENT', scopes: ['*'] };
  }

  /**
   * Check if a credential is revoked
   */
  async isRevoked(cred_hash: string): Promise<boolean> {
    const result = await this.verifyReceipt({
      cred_hash,
      attestation: '',
    });
    return result.status === 'revoked';
  }

  /**
   * Query credential policy
   */
  async getPolicy(cred_hash: string): Promise<any> {
    const result = await this.verifyReceipt({
      cred_hash,
      attestation: '',
    });
    return result.policy;
  }
}

/**
 * Convenience function for quick verification
 */
export async function verifyReceipt(input: VerifyReceiptInput): Promise<VerifyReceiptResult> {
  const adapter = new MidnightAdapter();
  return adapter.verifyReceipt(input);
}
