/**
 * VP Verification Logic
 */

import { VP, Challenge } from '@agenticdid/sdk';
import { MidnightAdapter } from '@agenticdid/midnight-adapter';
import { config } from './config.js';

const midnightAdapter = new MidnightAdapter({
  proofServerUrl: config.midnightAdapterUrl,
  enableMockMode: true,
});

export type VerificationResult = {
  valid: boolean;
  pid?: string;
  role?: string;
  scopes?: string[];
  error?: string;
};

/**
 * Verify a VP (proof bundle) against a challenge
 */
export async function verifyVP(vp: VP, challenge: Challenge): Promise<VerificationResult> {
  try {
    // 1. Validate structure
    if (!vp.pid || !vp.proof || !vp.disclosed || !vp.receipt) {
      return { valid: false, error: 'Invalid VP structure' };
    }

    // 2. Verify receipt with Midnight adapter
    const receiptResult = await midnightAdapter.verifyReceipt({
      cred_hash: vp.receipt.cred_hash,
      attestation: vp.receipt.attestation,
    });

    if (receiptResult.status === 'revoked') {
      return { valid: false, error: 'Credential revoked' };
    }

    if (receiptResult.status === 'expired') {
      return { valid: false, error: 'Credential expired' };
    }

    if (receiptResult.status !== 'valid') {
      return { valid: false, error: 'Credential status unknown' };
    }

    // 3. Check policy match
    if (receiptResult.policy) {
      const policyRole = receiptResult.policy.role;
      const disclosedRole = vp.disclosed.role;

      if (policyRole !== disclosedRole) {
        return { valid: false, error: 'Role mismatch' };
      }
    }

    // 4. Verify selective disclosure proof
    // TODO: Implement ZK proof verification
    if (!vp.sd_proof) {
      return { valid: false, error: 'Missing SD proof' };
    }

    // 5. All checks passed
    return {
      valid: true,
      pid: vp.pid,
      role: vp.disclosed.role,
      scopes: vp.disclosed.scopes,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Check if agent has required scope
 */
export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes(required) || scopes.includes('*');
}
