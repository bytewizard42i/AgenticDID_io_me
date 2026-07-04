/**
 * IVF Center Trusted Issuer
 * 
 * Specialized fertility clinic for reproductive healthcare credentials.
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const IVF_CENTER_ISSUER_ID = 'ivf_center_issuer';
export const IVF_CENTER_ISSUER_DID = 'did:agentic:ivf_center_issuer';

export interface IVFCenterIssuerConfig {
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
 * IVF Center Issuer Configuration
 */
export const IVF_CENTER_ISSUER_CONFIG: IVFCenterIssuerConfig = {
  issuerDid: IVF_CENTER_ISSUER_DID,
  issuerHumanName: 'IVF Center',
  category: 'INSTITUTION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Generic Fertility & IVF Center',
  claimedBrandName: 'IVF Center',
  jurisdiction: 'US',
  description: 'Specialized fertility clinic for reproductive healthcare and IVF treatments',
  
  /**
   * Allowed Credentials
   * IVF centers can issue specialized fertility credentials
   */
  allowedCredentialTypes: [
    'MEDICAL_RECORD',
    'FERTILITY_TREATMENT',
    'IVF_CYCLE',
    'EMBRYO_STORAGE',
    'PREGNANCY_TEST',
    'LAB_RESULT',
  ],
  
  /**
   * Forbidden Credentials
   * IVF centers CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'FINANCIAL_ACCOUNT',
    'PURCHASE_HISTORY',
    'EDUCATIONAL_DEGREE',
    'PRESCRIPTION',  // Must be co-signed by physician
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Medical Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://example-ivf-center.com',
    contactEmail: 'info@example-ivf-center.com',
    logo: '/assets/ivf-center-logo.svg',
  },
};
