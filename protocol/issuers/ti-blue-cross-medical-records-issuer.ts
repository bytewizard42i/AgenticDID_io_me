/**
 * Blue Cross Blue Shield - Trusted Issuer
 * 
 * Health insurance provider for medical coverage and claims credentials.
 * 
 * THREE-AXIS MODEL:
 * - Type: CORPORATION (health insurance company)
 * - Domains: FINANCIAL + MEDICAL (insurance payments + healthcare coverage)
 * - Assurance: REGULATED_ENTITY (state insurance commissioners + federal oversight)
 * 
 * Blue Cross Blue Shield is a multi-domain issuer operating at the intersection
 * of financial services and healthcare. They issue credentials related to:
 * - Health insurance coverage
 * - Medical claims and payments
 * - Provider network membership
 * - Coverage verification
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import {
  IssuerType,
  IssuerDomain,
  AssuranceLevel,
  CredentialType,
  type TrustedIssuerConfig,
} from '../../backend/midnight/src/types.js';

/**
 * Blue Cross Blue Shield DID
 */
export const BLUE_CROSS_ISSUER_DID = 'did:agentic:blue_cross_blue_shield';

/**
 * Blue Cross Blue Shield Issuer Configuration
 * 
 * Multi-domain issuer demonstrating FINANCIAL + MEDICAL overlap:
 * - Financial domain: Insurance payments, claims processing, premium payments
 * - Medical domain: Coverage verification, provider networks, benefits
 * 
 * This is different from:
 * - Banks (FINANCIAL only)
 * - Hospitals (MEDICAL only)
 * - Blue Cross operates at the intersection
 */
export const BLUE_CROSS_ISSUER_CONFIG: TrustedIssuerConfig = {
  // Identity
  issuerDid: BLUE_CROSS_ISSUER_DID,
  issuerHumanName: 'Blue Cross Blue Shield',
  
  // THREE-AXIS MODEL
  issuerType: IssuerType.CORPORATION,
  domains: [
    IssuerDomain.FINANCIAL,   // Insurance payments, claims, premiums
    IssuerDomain.MEDICAL,     // Healthcare coverage, provider networks
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  // Legal Information
  legalName: 'Blue Cross Blue Shield Association',
  claimedBrandName: 'Blue Cross Blue Shield',
  jurisdiction: 'US',
  
  // Brand Protection
  brandAttestationDid: 'did:agentic:trusted_issuer_0', // Attested by AgenticDID
  isBrandProtected: true,
  
  // Credential Policy
  allowedCredentialTypes: [
    // Insurance Coverage Credentials
    CredentialType.INSURANCE_COVERAGE,
    CredentialType.INSURANCE_CLAIM,
    CredentialType.COVERAGE_VERIFICATION,
    CredentialType.PROVIDER_NETWORK,
    
    // Financial Credentials (insurance-related)
    CredentialType.PAYMENT_HISTORY,
    CredentialType.PREMIUM_PAID,
    
    // Medical Access Credentials
    CredentialType.MEDICAL_AUTHORIZATION,
    CredentialType.PRESCRIPTION_COVERAGE,
  ],
  
  forbiddenCredentialTypes: [
    // Cannot issue actual medical records (not a provider)
    CredentialType.MEDICAL_RECORD,
    CredentialType.LAB_RESULT,
    CredentialType.SURGERY_RECORD,
    CredentialType.PRESCRIPTION, // Can cover it, can't prescribe it
    
    // Cannot issue government credentials
    CredentialType.VOTER_ELIGIBILITY,
    CredentialType.DRIVERS_LICENSE,
    
    // Cannot issue banking credentials (not a bank)
    CredentialType.BANK_ACCOUNT_VERIFIED,
    CredentialType.ACCREDITED_INVESTOR,
    
    // Cannot issue educational credentials
    CredentialType.DEGREE,
    CredentialType.TRANSCRIPT,
  ],
  
  // Status
  isActive: false, // Turn ON when implementing Health Insurance Agent
  
  // Metadata
  description: 'Blue Cross Blue Shield health insurance provider. Issues credentials for insurance coverage, claims processing, and provider network membership.',
  website: 'https://www.bcbs.com',
  contact: 'did-support@bcbs.com',
  logo: '/assets/blue-cross-logo.svg',
};

/**
 * MULTI-DOMAIN EXAMPLE:
 * 
 * Blue Cross demonstrates why we need the three-axis model:
 * 
 * Financial Domain Use Cases:
 * - Insurance premium payment verification
 * - Claims payment processing
 * - Reimbursement credentials
 * - Out-of-pocket expense tracking
 * 
 * Medical Domain Use Cases:
 * - Coverage verification (what treatments are covered)
 * - Provider network membership (which doctors you can see)
 * - Pre-authorization for procedures
 * - Prescription coverage (which medications are covered)
 * 
 * These credentials are issued by Blue Cross because they:
 * 1. Process the financial transactions (FINANCIAL domain)
 * 2. Authorize medical services (MEDICAL domain)
 * 3. Coordinate between patients, providers, and payers
 * 
 * This is the intersection of healthcare and finance - exactly what
 * health insurance companies do!
 */

/**
 * CREDENTIAL EXAMPLES:
 * 
 * 1. INSURANCE_COVERAGE
 *    - What: Proof of active health insurance
 *    - Used by: Hospitals, doctors, pharmacies
 *    - Claims: { memberId, planType, effectiveDate, expirationDate }
 * 
 * 2. COVERAGE_VERIFICATION
 *    - What: Specific treatment/service is covered
 *    - Used by: Healthcare providers before treatment
 *    - Claims: { service, copay, covered: true, priorAuthRequired }
 * 
 * 3. INSURANCE_CLAIM
 *    - What: Proof of claim submission/payment
 *    - Used by: Patients tracking their care
 *    - Claims: { claimId, service, amountPaid, patientResponsibility }
 * 
 * 4. PROVIDER_NETWORK
 *    - What: Doctor/hospital is in your network
 *    - Used by: Patients choosing providers
 *    - Claims: { providerId, networkTier, inNetwork: true }
 * 
 * 5. PRESCRIPTION_COVERAGE
 *    - What: Medication is covered by plan
 *    - Used by: Pharmacies at point of sale
 *    - Claims: { drugName, tier, copay, priorAuthRequired }
 */

/**
 * POLICY ENFORCEMENT EXAMPLE:
 * 
 * ✅ ALLOWED:
 * {
 *   credential: INSURANCE_COVERAGE,
 *   issuer: {
 *     type: CORPORATION ✅
 *     domains: [FINANCIAL, MEDICAL] ✅ (contains MEDICAL)
 *     assurance: REGULATED_ENTITY ✅
 *   }
 * }
 * 
 * ✅ ALLOWED:
 * {
 *   credential: PAYMENT_HISTORY,
 *   issuer: {
 *     type: CORPORATION ✅
 *     domains: [FINANCIAL, MEDICAL] ✅ (contains FINANCIAL)
 *     assurance: REGULATED_ENTITY ✅
 *   }
 * }
 * 
 * ❌ BLOCKED:
 * {
 *   credential: MEDICAL_RECORD,
 *   issuer: {
 *     type: CORPORATION ✅
 *     domains: [FINANCIAL, MEDICAL] ✅
 *     assurance: REGULATED_ENTITY ✅
 *   }
 * }
 * // Blocked because Blue Cross is not a healthcare provider!
 * // They can COVER medical records, but can't ISSUE them.
 * // Only hospitals/doctors can issue MEDICAL_RECORD credentials.
 */
