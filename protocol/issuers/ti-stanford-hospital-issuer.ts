/**
 * Hospital Trusted Issuer
 * 
 * Medical institution for hospital-level healthcare credentials.
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const HOSPITAL_ISSUER_ID = 'hospital_issuer';
export const HOSPITAL_ISSUER_DID = 'did:agentic:hospital_issuer';

export interface HospitalIssuerConfig {
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
 * Hospital Issuer Configuration
 */
export const HOSPITAL_ISSUER_CONFIG: HospitalIssuerConfig = {
  issuerDid: HOSPITAL_ISSUER_DID,
  issuerHumanName: 'Hospital',
  category: 'INSTITUTION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Generic Hospital Medical Center',
  claimedBrandName: 'Hospital',
  jurisdiction: 'US',
  description: 'Hospital for comprehensive healthcare services and medical records',
  
  /**
   * Allowed Credentials
   * Hospitals can issue medical credentials
   */
  allowedCredentialTypes: [
    'MEDICAL_RECORD',
    'VACCINATION_RECORD',
    'LAB_RESULT',
    'SURGERY_RECORD',
    'ADMISSION_DISCHARGE',
    'ALLERGY_INFO',
  ],
  
  /**
   * Forbidden Credentials
   * Hospitals CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'FINANCIAL_ACCOUNT',
    'PURCHASE_HISTORY',
    'EDUCATIONAL_DEGREE',
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Medical Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://example-hospital.com',
    contactEmail: 'records@example-hospital.com',
    logo: '/assets/hospital-logo.svg',
  },
};
