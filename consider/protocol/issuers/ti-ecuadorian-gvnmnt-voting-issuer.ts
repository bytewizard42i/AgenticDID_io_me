/**
 * Ecuadorian Government Voting Department Trusted Issuer
 * 
 * Government entity for voter registration and election credentials.
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const ECUADORIAN_VOTING_ISSUER_ID = 'ecuadorian_voting_issuer';
export const ECUADORIAN_VOTING_ISSUER_DID = 'did:agentic:ecuadorian_voting_issuer';

export interface EcuadorianVotingIssuerConfig {
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
 * Ecuadorian Voting Department Issuer Configuration
 */
export const ECUADORIAN_VOTING_ISSUER_CONFIG: EcuadorianVotingIssuerConfig = {
  issuerDid: ECUADORIAN_VOTING_ISSUER_DID,
  issuerHumanName: 'Ecuadorian Voting Department',
  category: 'GOVERNMENT_ENTITY',
  verificationLevel: 'SYSTEM_CRITICAL',
  legalName: 'Consejo Nacional Electoral del Ecuador',
  claimedBrandName: 'CNE Ecuador',
  jurisdiction: 'EC',
  description: 'National Electoral Council of Ecuador - voter registration and election management',
  
  /**
   * Allowed Credentials
   * ONLY government entities can issue voter eligibility
   */
  allowedCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'VOTER_REGISTRATION',
    'BALLOT_CAST',
    'CITIZENSHIP_VERIFIED',
    'NATIONAL_ID',
  ],
  
  /**
   * Forbidden Credentials
   * Government voting dept CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'FINANCIAL_ACCOUNT',
    'PURCHASE_HISTORY',
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Government Voting Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://cne.gob.ec',
    contactEmail: 'info@cne.gob.ec',
    logo: '/assets/ecuador-cne-logo.svg',
  },
};
