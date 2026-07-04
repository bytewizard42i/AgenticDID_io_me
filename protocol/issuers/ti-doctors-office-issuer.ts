/**
 * Doctor's Office Trusted Issuer
 * 
 * Primary care physician office for outpatient healthcare credentials.
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const DOCTORS_OFFICE_ISSUER_ID = 'doctors_office_issuer';
export const DOCTORS_OFFICE_ISSUER_DID = 'did:agentic:doctors_office_issuer';

export interface DoctorsOfficeIssuerConfig {
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
 * Doctor's Office Issuer Configuration
 */
export const DOCTORS_OFFICE_ISSUER_CONFIG: DoctorsOfficeIssuerConfig = {
  issuerDid: DOCTORS_OFFICE_ISSUER_DID,
  issuerHumanName: "Doctor's Office",
  category: 'INSTITUTION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Generic Primary Care Practice',
  claimedBrandName: "Doctor's Office",
  jurisdiction: 'US',
  description: 'Primary care physician practice for routine healthcare and prescriptions',
  
  /**
   * Allowed Credentials
   * Doctor's offices can issue medical credentials and prescriptions
   */
  allowedCredentialTypes: [
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'VACCINATION_RECORD',
    'PHYSICAL_EXAM',
    'REFERRAL',
    'ALLERGY_INFO',
  ],
  
  /**
   * Forbidden Credentials
   * Doctor's offices CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'FINANCIAL_ACCOUNT',
    'PURCHASE_HISTORY',
    'EDUCATIONAL_DEGREE',
    'SURGERY_RECORD',  // Major surgeries done at hospitals
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Medical Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://example-doctors-office.com',
    contactEmail: 'office@example-doctors-office.com',
    logo: '/assets/doctors-office-logo.svg',
  },
};
