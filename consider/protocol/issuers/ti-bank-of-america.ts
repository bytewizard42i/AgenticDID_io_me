/**
 * Bank of America - Trusted Issuer Template
 * 
 * This is our "ONE PERFECT CHECK" - the template for all future issuers.
 * Following TD Bank philosophy: build one issuer perfectly, then replicate.
 * 
 * WHY BANK OF AMERICA?
 * 
 * BOA was chosen as the first trusted issuer because of their forward-thinking
 * approach to cryptocurrency and decentralized systems:
 * 
 * - **Pro-Crypto History**: 3.5+ years ago, BOA actively engaged with crypto users
 *   to understand the ecosystem and prepare their systems
 * - **Open Communication**: Weekly calls with crypto customers to understand needs
 *   and safely enable transactions
 * - **Adaptive Mindset**: Rather than blocking crypto, they wanted to learn and adapt
 * - **Similar DNA**: Like Visa (payments) and Kraken (exchange), BOA showed
 *   institutional willingness to evolve with decentralized technology
 * 
 * This makes BOA the perfect partner for AgenticDID - a traditional financial
 * institution that understands and embraces innovation.
 * 
 * BOA serves as the reference implementation for:
 * - CORPORATION category issuers
 * - REGULATED_ENTITY verification level
 * - FINANCIAL_ACCOUNT credential type
 * - Brand verification requirements
 * - Stake requirements
 */

import {
  IssuerCategory,
  VerificationLevel,
  CredentialType,
} from '../../backend/midnight/src/types.js';
import type { IssuerRecord } from '../../backend/midnight/src/types.js';

/**
 * Bank of America Issuer Configuration
 * 
 * This is registered on-chain in AgenticDIDRegistry contract.
 */
export const BANK_OF_AMERICA_ISSUER: IssuerRecord = {
  // Identity
  issuerDid: 'did:agentic:issuer:boa:main',
  category: IssuerCategory.CORPORATION,
  verificationLevel: VerificationLevel.REGULATED_ENTITY,
  
  // Legal Information
  legalName: 'Bank of America, N.A.',
  claimedBrandName: 'Bank of America',
  jurisdiction: 'US-NC', // North Carolina charter
  
  // Metadata
  // Points to IPFS/Arweave with:
  // - FDIC certificate
  // - State banking license
  // - Federal Reserve membership
  // - OCC charter documents
  // - Corporate registration
  metadataHash: 'bafkreiexample...', // Placeholder
  
  // Registration
  registeredBy: 'did:agentic:registry:admin', // AgenticDID admin DID
  
  // Stake
  // BOA stakes 1M tDUST (~$1M USD equivalent) as good faith bond
  // Slashable if issuer misbehaves (false credentials, etc.)
  stakeAmount: 1_000_000n,
  
  // Status
  isRevoked: false,
  isActive: true,
  
  // Timestamps
  createdAt: new Date('2025-11-14T12:00:00Z'),
  updatedAt: undefined,
  revokedAt: undefined,
};

/**
 * Credentials BOA Can Issue
 * 
 * Defines what credential types Bank of America is authorized to issue
 * based on its category (CORPORATION) and verification level (REGULATED_ENTITY).
 */
export const BOA_ALLOWED_CREDENTIALS: CredentialType[] = [
  // Primary: Financial account credentials
  CredentialType.FINANCIAL_ACCOUNT,
  
  // BOA can also issue KYC credentials through banking relationship
  CredentialType.KYC_LEVEL_1,
  CredentialType.KYC_LEVEL_2,
  
  // Identity verification (through account ownership)
  CredentialType.IDENTITY_VERIFIED,
  
  // Accredited investor status (for wealth management clients)
  CredentialType.ACCREDITED_INVESTOR,
];

/**
 * Credentials BOA CANNOT Issue
 * 
 * Even though BOA is a CORPORATION with REGULATED_ENTITY level,
 * it cannot issue credentials outside its domain.
 */
export const BOA_FORBIDDEN_CREDENTIALS: CredentialType[] = [
  // Government credentials
  CredentialType.VOTER_ELIGIBILITY, // Only GOVERNMENT_ENTITY
  CredentialType.CITIZENSHIP,       // Only GOVERNMENT_ENTITY
  CredentialType.DRIVERS_LICENSE,   // Only GOVERNMENT_ENTITY
  CredentialType.VISA,              // Only GOVERNMENT_ENTITY
  
  // Healthcare credentials
  CredentialType.MEDICAL_RECORD,    // Only INSTITUTION
  CredentialType.PRESCRIPTION,      // Only INSTITUTION
  CredentialType.MEDICAL_LICENSE,   // Only INSTITUTION/GOVERNMENT
  
  // Crypto-specific (BOA is traditional bank, not crypto exchange)
  CredentialType.CRYPTO_EXCHANGE_KYC, // Only crypto exchanges
];

/**
 * BOA KYC Requirements
 * 
 * What BOA requires from users before issuing credentials.
 * This mirrors real BOA account opening requirements.
 */
export const BOA_KYC_REQUIREMENTS = {
  // Documents required
  requiredDocuments: [
    {
      type: 'government_id',
      description: 'Driver\'s license or passport',
      required: true,
    },
    {
      type: 'ssn',
      description: 'Social Security Number (US) or Tax ID',
      required: true,
    },
    {
      type: 'address_proof',
      description: 'Utility bill or lease agreement',
      required: true,
    },
    {
      type: 'income_verification',
      description: 'Pay stub or tax return (for certain products)',
      required: false, // Depends on product
    },
  ],
  
  // Verification steps
  verificationSteps: [
    {
      step: 'identity_verification',
      description: 'Verify government ID authenticity',
      method: 'automated_ocr_plus_manual_review',
    },
    {
      step: 'ssn_validation',
      description: 'Validate SSN with government databases',
      method: 'credit_bureau_check',
    },
    {
      step: 'address_verification',
      description: 'Confirm residential address',
      method: 'utility_bill_or_credit_report',
    },
    {
      step: 'account_ownership',
      description: 'Verify user owns BOA account',
      method: 'micro_deposit_or_instant_verification',
    },
    {
      step: 'activity_history',
      description: 'Check account has sufficient history',
      method: 'minimum_90_days_active',
    },
  ],
  
  // Minimum requirements for credential issuance
  minimumRequirements: {
    accountAge: 90,        // days
    minimumTransactions: 5, // Must have at least 5 transactions
    noFraudFlags: true,    // No fraud alerts on account
    accountInGoodStanding: true, // Not overdrawn, no holds
  },
  
  // Credential validity
  credentialValidity: {
    duration: 365,         // days (1 year)
    renewable: true,       // Can be renewed
    requiresReKYC: false,  // No re-KYC needed if account stays active
  },
};

/**
 * BOA Credential Schema
 * 
 * Structure of credentials issued by BOA.
 * Uses selective disclosure - user can reveal only necessary fields.
 */
export const BOA_CREDENTIAL_SCHEMA = {
  // Credential metadata
  credentialType: CredentialType.FINANCIAL_ACCOUNT,
  issuer: BANK_OF_AMERICA_ISSUER.issuerDid,
  version: '1.0',
  
  // Claims (what BOA attests to)
  claims: {
    // Public claims (always visible)
    public: [
      'issuer',           // BOA's DID
      'issued_at',        // Timestamp
      'expires_at',       // Expiration
      'credential_type',  // FINANCIAL_ACCOUNT
    ],
    
    // Private claims (selective disclosure via ZK proofs)
    private: [
      'account_number',   // User's account number (never revealed)
      'account_type',     // Checking, savings, etc.
      'account_status',   // Active, closed, etc.
      'kyc_level',        // KYC_LEVEL_1 or KYC_LEVEL_2
      'customer_since',   // Account opening date
      'account_balance_range', // Range, not exact amount
    ],
    
    // Derivable claims (can be proven without revealing underlying data)
    derivable: [
      'age_over_18',      // Prove age without revealing birthdate
      'us_resident',      // Prove residency without revealing address
      'account_active',   // Prove account is active without details
      'balance_over_X',   // Prove balance threshold without amount
    ],
  },
  
  // ZK proof requirements
  zkProofRequirements: {
    // User must prove they own the credential
    ownershipProof: true,
    
    // Credential must not be revoked
    revocationCheck: true,
    
    // Credential must not be expired
    expirationCheck: true,
    
    // Selective disclosure allowed
    selectiveDisclosure: true,
  },
};

/**
 * BOA Onboarding Process
 * 
 * Steps for Bank of America to be registered as a trusted issuer
 * in AgenticDID protocol.
 * 
 * This is the template for onboarding all CORPORATION issuers.
 */
export const BOA_ONBOARDING_PROCESS = {
  // Phase 1: Application
  application: {
    step: 1,
    name: 'Submit Application',
    requirements: [
      'Legal entity name',
      'Jurisdiction of incorporation',
      'Business type (CORPORATION)',
      'Claimed brand name ("Bank of America")',
      'Regulatory licenses (FDIC, OCC, Fed)',
      'Proof of brand ownership (trademark, domain)',
      'Corporate officers & authorized signers',
      'Proposed DID',
    ],
    duration: '1-2 hours',
  },
  
  // Phase 2: Verification
  verification: {
    step: 2,
    name: 'AgenticDID KYC Verification',
    checks: [
      {
        check: 'Legal Entity Verification',
        description: 'Verify BOA is legally registered corporation',
        method: 'Secretary of State lookup, FDIC database',
      },
      {
        check: 'Brand Ownership Verification',
        description: 'Verify BOA owns "Bank of America" brand',
        method: 'USPTO trademark search, DNS verification',
      },
      {
        check: 'Regulatory Status Check',
        description: 'Verify BOA is FDIC insured, OCC chartered',
        method: 'FDIC BankFind, OCC public records',
      },
      {
        check: 'Anti-Fraud Check',
        description: 'Ensure no other issuer claims "Bank of America"',
        method: 'AgenticDIDRegistry query',
      },
      {
        check: 'Category Assignment',
        description: 'Assign CORPORATION category',
        method: 'Automated based on business type',
      },
      {
        check: 'Verification Level Assessment',
        description: 'Assign REGULATED_ENTITY level',
        method: 'Based on licenses (FDIC = REGULATED_ENTITY)',
      },
    ],
    duration: '2-3 days',
  },
  
  // Phase 3: Stake
  stake: {
    step: 3,
    name: 'Stake Deposit',
    requirements: [
      'Deposit 1M tDUST to AgenticDID stake contract',
      'Stake locked for duration of issuer registration',
      'Slashable if issuer issues false credentials',
    ],
    duration: '1 day (blockchain confirmation)',
  },
  
  // Phase 4: Registration
  registration: {
    step: 4,
    name: 'On-Chain Registration',
    actions: [
      'Deploy issuer record to AgenticDIDRegistry contract',
      'Emit IssuerRegistered event',
      'Add to allowed issuers list',
      'Enable credential issuance',
    ],
    duration: '1 hour',
  },
  
  // Phase 5: Integration
  integration: {
    step: 5,
    name: 'System Integration',
    tasks: [
      'Configure Midnight Gateway to accept BOA credentials',
      'Update task agents (Banker) to recognize BOA',
      'Add BOA to well-known brands registry',
      'Update documentation',
    ],
    duration: '1-2 days',
  },
  
  // Total Duration
  totalDuration: '4-7 days',
};

/**
 * BOA Revocation Policy
 * 
 * Conditions under which BOA's issuer status would be revoked.
 */
export const BOA_REVOCATION_POLICY = {
  // Automatic revocation triggers
  automaticRevocation: [
    'FDIC insurance revoked',
    'OCC charter surrendered',
    'Bank declared insolvent',
    'Criminal conviction of bank',
  ],
  
  // Manual revocation (AgenticDID admin decision)
  manualRevocation: [
    'Repeated false credential issuance',
    'Failure to maintain stake',
    'Violation of protocol rules',
    'Failure to respond to security incidents',
  ],
  
  // Revocation process
  revocationProcess: {
    investigation: '30 days',
    notice: '15 days',
    appeal: '15 days',
    finalDecision: 'AgenticDID governance',
  },
  
  // Impact of revocation
  impact: {
    existingCredentials: 'Marked as revoked, fail verification',
    newIssuance: 'Immediately disabled',
    stake: 'Slashed or returned based on cause',
  },
};

/**
 * Export everything
 */
export default {
  issuer: BANK_OF_AMERICA_ISSUER,
  allowedCredentials: BOA_ALLOWED_CREDENTIALS,
  forbiddenCredentials: BOA_FORBIDDEN_CREDENTIALS,
  kycRequirements: BOA_KYC_REQUIREMENTS,
  credentialSchema: BOA_CREDENTIAL_SCHEMA,
  onboardingProcess: BOA_ONBOARDING_PROCESS,
  revocationPolicy: BOA_REVOCATION_POLICY,
};
