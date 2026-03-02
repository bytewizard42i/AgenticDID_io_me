/**
 * Stanford University Trusted Issuer
 * 
 * Multi-domain academic institution demonstrating the three-axis model.
 * 
 * THREE-AXIS MODEL:
 * - Type: INSTITUTION (academic, non-profit)
 * - Domains: EDUCATION + RESEARCH + MEDICAL (multi-domain!)
 * - Assurance: REGULATED_ENTITY (accredited university + licensed hospital)
 */

import {
  IssuerType,
  IssuerDomain,
  AssuranceLevel,
  CredentialType,
  type TrustedIssuerConfig,
} from '../../backend/midnight/src/types.js';

/**
 * Stanford University DID
 */
export const STANFORD_ISSUER_DID = 'did:agentic:stanford_university';

/**
 * Stanford University Issuer Configuration
 * 
 * A perfect example of why we need the three-axis model:
 * - Legal form: INSTITUTION (non-profit university)
 * - Activities: EDUCATION + RESEARCH + MEDICAL (3 domains!)
 * - Trust: REGULATED_ENTITY (accredited + licensed)
 * 
 * Can issue:
 * - Educational credentials (degrees, transcripts)
 * - Research credentials (publications, grants)
 * - Medical credentials (hospital records, patient care)
 * 
 * Cannot issue:
 * - Financial credentials (not a bank)
 * - Government credentials (not a government)
 * - Voting credentials (not electoral authority)
 */
export const STANFORD_ISSUER_CONFIG: TrustedIssuerConfig = {
  // Identity
  issuerDid: STANFORD_ISSUER_DID,
  issuerHumanName: 'Stanford University',
  
  // THREE-AXIS MODEL
  issuerType: IssuerType.INSTITUTION,
  domains: [
    IssuerDomain.EDUCATION,   // Degrees, courses, academic credentials
    IssuerDomain.RESEARCH,    // Scientific publications, grants
    IssuerDomain.MEDICAL,     // Stanford Medicine, Stanford Hospital
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  // Legal Information
  legalName: 'The Board of Trustees of the Leland Stanford Junior University',
  claimedBrandName: 'Stanford University',
  jurisdiction: 'US-CA',
  
  // Brand Protection
  isBrandProtected: true,  // Major university brand
  
  // Credential Policy
  allowedCredentialTypes: [
    // Educational Credentials
    CredentialType.DEGREE,
    CredentialType.EDUCATIONAL_DEGREE,
    CredentialType.CERTIFICATION,
    CredentialType.PROFESSIONAL_LICENSE,
    
    // Research Credentials
    CredentialType.SOCIAL_ATTESTATION,  // Academic reputation
    CredentialType.REPUTATION,          // Research citations
    
    // Medical Credentials (Stanford Medicine)
    CredentialType.MEDICAL_RECORD,
    CredentialType.PRESCRIPTION,
    CredentialType.VACCINATION_RECORD,
    CredentialType.LAB_RESULT,
    CredentialType.SURGERY_RECORD,
    CredentialType.ADMISSION_DISCHARGE,
    CredentialType.ALLERGY_INFO,
    CredentialType.PHYSICAL_EXAM,
    CredentialType.REFERRAL,
    CredentialType.PATIENT_CONSENT,
    CredentialType.MEDICAL_LICENSE,     // For Stanford-trained doctors
    
    // Identity (for students/faculty)
    CredentialType.AGE_OVER_18,
    CredentialType.IDENTITY_VERIFIED,
  ],
  
  forbiddenCredentialTypes: [
    // Financial (not a bank)
    CredentialType.FINANCIAL_ACCOUNT,
    CredentialType.BANK_ACCOUNT_VERIFIED,
    CredentialType.CREDIT_SCORE,
    CredentialType.INCOME_VERIFICATION,
    CredentialType.CRYPTO_EXCHANGE_KYC,
    CredentialType.ACCREDITED_INVESTOR,
    
    // Government (not a government entity)
    CredentialType.VOTER_ELIGIBILITY,
    CredentialType.VOTER_REGISTRATION,
    CredentialType.BALLOT_CAST,
    CredentialType.CITIZENSHIP,
    CredentialType.CITIZENSHIP_VERIFIED,
    CredentialType.RESIDENCY,
    CredentialType.DRIVERS_LICENSE,
    CredentialType.NATIONAL_ID,
    
    // E-Commerce (not a retailer)
    CredentialType.PURCHASE_HISTORY,
    CredentialType.SHIPPING_ADDRESS_VERIFIED,
    CredentialType.PRIME_MEMBERSHIP,
    CredentialType.SELLER_REPUTATION,
    CredentialType.DELIVERY_CONFIRMATION,
    
    // Travel (not an airline)
    CredentialType.FLIGHT_BOOKING,
    CredentialType.FREQUENT_FLYER_STATUS,
    CredentialType.BOARDING_PASS,
    CredentialType.TRAVEL_HISTORY,
    CredentialType.MILEAGE_BALANCE,
    
    // Fertility (not an IVF center)
    CredentialType.FERTILITY_TREATMENT,
    CredentialType.IVF_CYCLE,
    CredentialType.EMBRYO_STORAGE,
    CredentialType.PREGNANCY_TEST,
    
    // High-level KYC (not primary KYC provider)
    CredentialType.KYC_TIER_3,
  ],
  
  // Status
  isActive: false,  // ❌ OFF until implemented
  
  // Metadata
  description: 'Stanford University - Premier academic institution with world-class education, research, and medical facilities. Multi-domain issuer demonstrating EDUCATION + RESEARCH + MEDICAL capabilities.',
  website: 'https://www.stanford.edu',
  contact: 'registrar@stanford.edu',
  logo: '🎓',
};

/**
 * POLICY NOTES:
 * 
 * Stanford demonstrates the three-axis model perfectly:
 * 
 * 1. Can issue EDUCATIONAL_DEGREE because:
 *    - issuerType: INSTITUTION ✓
 *    - domains includes EDUCATION ✓
 *    - assuranceLevel: REGULATED_ENTITY ✓
 * 
 * 2. Can issue MEDICAL_RECORD because:
 *    - issuerType: INSTITUTION ✓
 *    - domains includes MEDICAL ✓
 *    - assuranceLevel: REGULATED_ENTITY ✓
 * 
 * 3. Cannot issue VOTER_ELIGIBILITY because:
 *    - issuerType: INSTITUTION ✗ (must be GOVERNMENT_ENTITY)
 *    - domains missing VOTING ✗
 * 
 * 4. Cannot issue FINANCIAL_ACCOUNT because:
 *    - domains missing FINANCIAL ✗
 * 
 * This is exactly what we want: precise, composable policy enforcement.
 */
