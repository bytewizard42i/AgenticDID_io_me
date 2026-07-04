/**
 * Bank Trusted Issuer
 * 
 * Generic banking institution issuer.
 * This represents any major bank (BOA, Chase, Wells Fargo, etc.)
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const BANK_ISSUER_ID = 'bank_issuer';
export const BANK_ISSUER_DID = 'did:agentic:bank_issuer';

export interface BankIssuerConfig {
  issuerDid: string;
  issuerHumanName: string;
  category: IssuerCategory;
  verificationLevel: VerificationLevel;
  legalName: string;
  claimedBrandName?: string;
  jurisdiction?: string;
  description: string;
  allowedCredentialTypes: CredentialType[];
  forbiddenCredentialTypes: CredentialType[];
  isActive: boolean;
  metadata: {
    website?: string;
    contactEmail?: string;
    logo?: string;
  };
}

/**
 * Bank Issuer Configuration
 */
export const BANK_ISSUER_CONFIG: BankIssuerConfig = {
  issuerDid: BANK_ISSUER_DID,
  issuerHumanName: 'Bank',
  category: 'CORPORATION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Generic Banking Institution',
  claimedBrandName: 'Bank',
  jurisdiction: 'US',
  description: 'Generic banking institution for financial services and KYC',
  
  /**
   * Allowed Credentials
   * Banks can issue financial credentials
   */
  allowedCredentialTypes: [
    'FINANCIAL_ACCOUNT',
    'KYC_TIER_1',
    'KYC_TIER_2',
    'KYC_TIER_3',
    'BANK_ACCOUNT_VERIFIED',
    'CREDIT_SCORE',
    'INCOME_VERIFICATION',
  ],
  
  /**
   * Forbidden Credentials
   * Banks CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'EDUCATIONAL_DEGREE',
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Bank Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://example-bank.com',
    contactEmail: 'support@example-bank.com',
    logo: '/assets/bank-logo.svg',
  },
};
