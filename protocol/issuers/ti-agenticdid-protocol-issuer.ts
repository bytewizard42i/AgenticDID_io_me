/**
 * trusted_issuer_0 - AgenticDID Root Issuer
 * 
 * THIS IS THE "ONE PERFECT ISSUER" - The canonical reference implementation.
 * Following TD Bank philosophy: build one issuer perfectly, then replicate.
 * 
 * trusted_issuer_0 = AgenticDID itself (the protocol/foundation)
 * 
 * WHY AgenticDID AS THE FIRST ISSUER?
 * 
 * 1. **Dogfooding**: We must use our own system before asking others to trust it
 * 2. **Bootstrap**: Someone has to be the first issuer - might as well be us
 * 3. **Template**: This becomes the reference all other issuers follow
 * 4. **Trust anchor**: Protocol-level issuer with highest trust
 * 5. **Simple start**: No external dependencies or partnerships needed
 * 
 * THE CANONICAL FLOW:
 * 
 * 1. John (first real user) → Comet (canonical_agent_101)
 * 2. Comet → agent_0 (AgenticDID Issuer Agent)
 * 3. agent_0 → trusted_issuer_0 (this issuer)
 * 4. KYC flow completes
 * 5. Credential issued to John's DID
 * 6. John can now use Banker, Crypto Agent, etc.
 * 
 * Once this works perfectly, we replicate for:
 * - Bank of America (trusted_issuer_1)
 * - Kraken (trusted_issuer_2)
 * - Visa (trusted_issuer_3)
 * - etc.
 */

import {
  IssuerCategory,
  VerificationLevel,
  CredentialType,
} from '../../backend/midnight/src/types.js';
import type { IssuerRecord } from '../../backend/midnight/src/types.js';
import {
  TRUSTED_ISSUER_0_ID,
  TRUSTED_ISSUER_0_DID,
  CANONICAL_CREDENTIAL_TYPES,
} from '../../backend/shared/src/canonical-ids.js';

/**
 * AgenticDID Root Issuer Configuration
 * 
 * This is registered on-chain in AgenticDIDRegistry contract as the first issuer.
 */
export const TRUSTED_ISSUER_0_CONFIG: IssuerRecord = {
  // Identity
  issuerDid: TRUSTED_ISSUER_0_DID,
  category: IssuerCategory.CORPORATION,
  verificationLevel: VerificationLevel.REGULATED_ENTITY,
  
  // Legal Information
  legalName: 'AgenticDID Foundation',
  claimedBrandName: 'AgenticDID',
  jurisdiction: 'US-DE', // Delaware foundation
  
  // Metadata
  // Points to IPFS/Arweave with:
  // - Foundation incorporation documents
  // - Protocol governance documents
  // - Security audit reports
  // - Public key infrastructure
  metadataHash: 'bafkreiexample...', // Placeholder
  
  // Registration
  registeredBy: 'did:agentic:protocol:admin', // Protocol admin
  
  // Stake
  // AgenticDID stakes as good faith demonstration
  stakeAmount: 100_000n, // 100k tDUST
  
  // Status
  isRevoked: false,
  isActive: true,
  
  // Timestamps
  createdAt: new Date('2025-11-14T12:00:00Z'),
  updatedAt: undefined,
  revokedAt: undefined,
};

/**
 * Credentials trusted_issuer_0 Can Issue
 * 
 * Start with TWO simple credential types:
 * 1. KYC_LEVEL_1 - Basic identity verification
 * 2. AGE_OVER_18 - Simple age attestation
 * 
 * This keeps the first implementation clean and testable.
 */
export const TRUSTED_ISSUER_0_ALLOWED_CREDENTIALS: CredentialType[] = [
  CredentialType.KYC_LEVEL_1,
  CredentialType.AGE_OVER_18,
];

/**
 * KYC Requirements for trusted_issuer_0
 * 
 * What AgenticDID requires from users to issue credentials.
 * 
 * For the FIRST implementation (John's KYC), this can be simplified/mocked.
 * Later, we'll add real document verification, liveness checks, etc.
 */
export const TRUSTED_ISSUER_0_KYC_REQUIREMENTS = {
  // Documents required
  requiredDocuments: [
    {
      type: 'email_verification',
      description: 'Email address verification',
      required: true,
      forDemo: 'Can be mocked for first pass',
    },
    {
      type: 'government_id',
      description: 'Driver\'s license or passport',
      required: true,
      forDemo: 'Can be mocked for first pass',
    },
    {
      type: 'selfie',
      description: 'Photo for liveness check',
      required: false,
      forDemo: 'Skip for first pass',
    },
  ],
  
  // Verification steps (canonical workflow)
  verificationSteps: [
    {
      step: 'email_verification',
      description: 'Verify email ownership',
      method: 'email_token',
    },
    {
      step: 'identity_review',
      description: 'Review government ID',
      method: 'manual_or_automated',
    },
    {
      step: 'risk_assessment',
      description: 'Check for red flags',
      method: 'fraud_detection_module',
    },
    {
      step: 'credential_issuance',
      description: 'Issue credential to user DID',
      method: 'midnight_contract_write',
    },
  ],
  
  // Minimum requirements
  minimumRequirements: {
    emailVerified: true,
    identityDocumentProvided: true,
    noFraudFlags: true,
  },
  
  // Credential validity
  credentialValidity: {
    duration: 365,         // days (1 year)
    renewable: true,       // Can be renewed
    requiresReKYC: false,  // No re-KYC needed unless flagged
  },
};

/**
 * KYC_LEVEL_1 Credential Schema
 * 
 * Structure of the first credential issued by trusted_issuer_0.
 * This is the CANONICAL credential schema all others will follow.
 */
export const KYC_LEVEL_1_CREDENTIAL_SCHEMA = {
  // Credential metadata
  credentialType: CredentialType.KYC_LEVEL_1,
  issuer: TRUSTED_ISSUER_0_DID,
  version: '1.0',
  
  // Claims (what trusted_issuer_0 attests to)
  claims: {
    // Public claims (always visible)
    public: [
      'issuer',           // trusted_issuer_0 DID
      'issued_at',        // Timestamp
      'expires_at',       // Expiration
      'credential_type',  // KYC_LEVEL_1
    ],
    
    // Private claims (selective disclosure via ZK proofs)
    private: [
      'subject_did',      // User's DID (never revealed in proofs)
      'email_hash',       // Hash of verified email
      'identity_doc_hash', // Hash of government ID
      'kyc_level',        // Always KYC_LEVEL_1 for this credential
      'jurisdiction',     // Where KYC was performed
      'verified_at',      // Verification timestamp
    ],
    
    // Derivable claims (can be proven without revealing underlying data)
    derivable: [
      'has_kyc',          // Prove KYC exists without details
      'kyc_not_expired',  // Prove not expired without revealing dates
      'from_regulated_issuer', // Prove issuer category without revealing which one
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
 * Onboarding Process for trusted_issuer_0
 * 
 * This is the CANONICAL onboarding flow.
 * All future issuers will follow this pattern with variations.
 */
export const TRUSTED_ISSUER_0_ONBOARDING = {
  // This issuer is protocol-native, so onboarding is different
  // It's "pre-registered" as part of protocol deployment
  
  deployment: {
    step: 1,
    name: 'Protocol Deployment',
    description: 'Deploy AgenticDIDRegistry with trusted_issuer_0 as genesis issuer',
    actions: [
      'Deploy AgenticDIDRegistry contract',
      'Register trusted_issuer_0 in genesis block',
      'Set issuer category to CORPORATION',
      'Set verification level to REGULATED_ENTITY',
      'Enable KYC_LEVEL_1 and AGE_OVER_18 credentials',
    ],
  },
  
  initialization: {
    step: 2,
    name: 'Issuer Agent Initialization',
    description: 'Deploy agenticdid_agent (AgenticDID Issuer Agent)',
    actions: [
      'Deploy agenticdid_agent smart contracts',
      'Link agenticdid_agent to trusted_issuer_0',
      'Configure KYC workflow',
      'Set up credential issuance pipeline',
      'Enable revocation mechanism',
    ],
  },
  
  testing: {
    step: 3,
    name: 'Canonical User Test',
    description: 'John does his own KYC through the system',
    actions: [
      'John → Comet: "Do my KYC with AgenticDID"',
      'Comet → agenticdid_agent: KYC request',
      'agenticdid_agent → John: KYC workflow (email, ID, etc.)',
      'agenticdid_agent → trusted_issuer_0: Issue credential',
      'trusted_issuer_0 → Comet: Credential delivered',
      'Comet stores credential locally',
    ],
  },
  
  validation: {
    step: 4,
    name: 'End-to-End Validation',
    description: 'John uses his credential with a task agent',
    actions: [
      'John → Comet: "Check my balance" (requires KYC)',
      'Comet → Midnight Gateway: Generate proof',
      'Midnight Gateway → AgenticDIDRegistry: Verify issuer',
      'Midnight Gateway: Verify ZK proof',
      'Comet → Banker: Delegated with proof',
      'Banker: Execute action',
      'Result returned to John',
    ],
  },
};

/**
 * Revocation Policy for trusted_issuer_0
 * 
 * Since this is the protocol itself, revocation is governance-based.
 */
export const TRUSTED_ISSUER_0_REVOCATION_POLICY = {
  // Individual credential revocation
  credentialRevocation: [
    'User requests credential revocation',
    'Fraud detected in KYC process',
    'Credential compromised (key leak)',
    'User account suspended',
  ],
  
  // Issuer-level revocation (extremely rare)
  issuerRevocation: [
    'Protocol governance vote',
    'Critical security vulnerability',
    'Migration to new issuer version',
  ],
  
  // Revocation process
  revocationProcess: {
    request: 'User or admin submits revocation request',
    review: 'Automated + manual review',
    execution: 'Update on-chain revocation registry',
    notification: 'User notified via Comet',
  },
};

/**
 * THE ONE PERFECT ISSUER
 * 
 * Everything about trusted_issuer_0 is designed to be:
 * 1. Clean - Easy to understand
 * 2. Complete - All necessary components
 * 3. Testable - Can be validated end-to-end
 * 4. Replicable - Can be copied for future issuers
 * 
 * When we build trusted_issuer_1 (Bank of America),
 * we'll literally copy this file and change:
 * - IDs and DIDs
 * - Legal name
 * - KYC requirements (add banking-specific docs)
 * - Allowed credential types (add FINANCIAL_ACCOUNT)
 * 
 * The structure, workflow, and security model stay IDENTICAL.
 * 
 * That's the TD Bank principle in action. 🎯
 */
export default {
  issuer: TRUSTED_ISSUER_0_CONFIG,
  allowedCredentials: TRUSTED_ISSUER_0_ALLOWED_CREDENTIALS,
  kycRequirements: TRUSTED_ISSUER_0_KYC_REQUIREMENTS,
  credentialSchema: KYC_LEVEL_1_CREDENTIAL_SCHEMA,
  onboardingProcess: TRUSTED_ISSUER_0_ONBOARDING,
  revocationPolicy: TRUSTED_ISSUER_0_REVOCATION_POLICY,
};
