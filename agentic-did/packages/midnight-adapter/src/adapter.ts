/**
 * Midnight Adapter - Credential State Verification
 */

import {
  VerifyReceiptInput,
  VerifyReceiptResult,
  MidnightAdapterConfig,
  CredentialStatus,
} from './types.js';

export class MidnightAdapter {
  private config: MidnightAdapterConfig;

  constructor(config: MidnightAdapterConfig = {}) {
    this.config = {
      enableMockMode: true,
      ...config,
    };
  }

  /**
   * Verify a Midnight receipt and check credential state
   * MVP: Returns mock valid responses
   * TODO: Wire to actual Midnight proof server / Minokawa contract
   */
  async verifyReceipt(input: VerifyReceiptInput): Promise<VerifyReceiptResult> {
    if (this.config.enableMockMode) {
      return this.mockVerifyReceipt(input);
    }

    // TODO: Real Midnight verification
    // 1. Parse attestation
    // 2. Verify signature
    // 3. Query state from Minokawa contract
    // 4. Check revocation list
    // 5. Return status + policy

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
    if (cred_hash.includes('banker')) {
      return { role: 'Banker', scopes: ['bank:transfer', 'bank:balance'] };
    }
    if (cred_hash.includes('traveler')) {
      return { role: 'Traveler', scopes: ['travel:book', 'travel:cancel'] };
    }
    if (cred_hash.includes('shopper')) {
      return { role: 'Shopper', scopes: ['shop:purchase', 'shop:cart'] };
    }
    // Default
    return { role: 'Agent', scopes: ['read'] };
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
