/**
 * Type Definitions for Midnight Gateway
 * 
 * Core types for AgenticDID protocol including issuer categories,
 * verification levels, and fraud detection.
 * 
 * These types align with the on-chain AgenticDIDRegistry contract
 * and enforce protocol-level constraints.
 */

/**
 * THREE-AXIS ISSUER MODEL
 * 
 * Issuers are characterized by three independent dimensions:
 * 
 * 1. IssuerType: Legal form and accountability structure
 * 2. IssuerDomain: Sector(s) they operate in (can be multiple)
 * 3. AssuranceLevel: Strength of verification and trust
 * 
 * This model cleanly handles overlapping entities:
 * - Government hospital: GOV_ENTITY + MEDICAL + SYSTEM_CRITICAL
 * - University medical center: INSTITUTION + MEDICAL + EDUCATION + REGULATED_ENTITY
 * - Private hospital: CORPORATION + MEDICAL + REGULATED_ENTITY
 * - Health insurance: CORPORATION + FINANCIAL + MEDICAL + REGULATED_ENTITY
 */

/**
 * Issuer Type (Axis 1: Legal Form)
 * 
 * Defines the legal structure and accountability model.
 * 
 * Types:
 * - SELF_SOVEREIGN: Individual or personal DID
 *   - No corporate structure
 *   - Personal accountability only
 *   - Can issue low-risk attestations
 * 
 * - CORPORATION: Registered business entity (LLC, Inc, etc.)
 *   - Corporate legal structure
 *   - Business KYC required
 *   - Can operate in any sector (financial, medical, e-commerce, etc.)
 * 
 * - GOVERNMENT_ENTITY: Official government organization
 *   - Government authority backing
 *   - Highest legal accountability
 *   - Can issue sovereign identity credentials
 * 
 * - INSTITUTION: Non-profit, educational, or research organization
 *   - Institutional structure (university, research institute, NGO)
 *   - Academic or public service mission
 *   - Often regulated but non-commercial
 */
export enum IssuerType {
  SELF_SOVEREIGN = 'SELF_SOVEREIGN',
  CORPORATION = 'CORPORATION',
  GOVERNMENT_ENTITY = 'GOVERNMENT_ENTITY',
  INSTITUTION = 'INSTITUTION',
}

/**
 * Issuer Domain (Axis 2: Sector/Activity)
 * 
 * Defines what sector(s) the issuer operates in.
 * An issuer can have MULTIPLE domains.
 * 
 * Domains:
 * - GENERAL: Default for self-sovereign or non-specialized issuers
 * - IDENTITY_INFRA: Core identity and DID infrastructure (AgenticDID, etc.)
 * - FINANCIAL: Banking, payments, investments, credit
 * - CRYPTO_EXCHANGE: Cryptocurrency exchange specifically
 * - MEDICAL: Healthcare, hospitals, clinics, medical records
 * - EDUCATION: Universities, schools, educational credentials
 * - RESEARCH: Research institutions, scientific data
 * - GOV_SERVICES: Government services, civic identity
 * - VOTING: Election and voting systems
 * - E_COMMERCE: Online shopping, marketplaces
 * - TRAVEL: Airlines, hotels, travel services
 * - AI_LAB: AI research and development
 * 
 * Examples:
 * - Hospital: [MEDICAL, RESEARCH]
 * - University medical center: [INSTITUTION, MEDICAL, EDUCATION, RESEARCH]
 * - Crypto bank: [FINANCIAL, CRYPTO_EXCHANGE]
 * - Health insurance: [FINANCIAL, MEDICAL]
 */
export enum IssuerDomain {
  GENERAL = 'GENERAL',
  IDENTITY_INFRA = 'IDENTITY_INFRA',
  FINANCIAL = 'FINANCIAL',
  CRYPTO_EXCHANGE = 'CRYPTO_EXCHANGE',
  MEDICAL = 'MEDICAL',
  EDUCATION = 'EDUCATION',
  RESEARCH = 'RESEARCH',
  GOV_SERVICES = 'GOV_SERVICES',
  VOTING = 'VOTING',
  E_COMMERCE = 'E_COMMERCE',
  TRAVEL = 'TRAVEL',
  AI_LAB = 'AI_LAB',
}

/**
 * Assurance Level (Axis 3: Trust Strength)
 * 
 * Indicates the strength of issuer verification and trust.
 * Independent of type or domain.
 * 
 * Levels:
 * - UNVERIFIED: No formal verification (self-registered)
 *   - Self-sovereign DIDs
 *   - No background check
 *   - Low-risk credentials only
 * 
 * - BASIC_KYC: Basic identity verification completed
 *   - Email + phone verified
 *   - Basic business documentation
 *   - Can issue low-value credentials
 * 
 * - REGULATED_ENTITY: Fully regulated and licensed entity
 *   - Licensed by regulatory body (SEC, FDA, banking regulator, etc.)
 *   - Regular audits required
 *   - Can issue sensitive credentials (financial, medical)
 * 
 * - SYSTEM_CRITICAL: Government or critical infrastructure
 *   - Highest trust tier
 *   - Government backing or critical infrastructure role
 *   - Can issue sovereign identity credentials
 * 
 * Examples:
 * - Self-sovereign user: SELF_SOVEREIGN + GENERAL + UNVERIFIED
 * - Small business: CORPORATION + E_COMMERCE + BASIC_KYC
 * - Licensed hospital: CORPORATION + MEDICAL + REGULATED_ENTITY
 * - Government voting: GOVERNMENT_ENTITY + GOV_SERVICES + SYSTEM_CRITICAL
 */
export enum AssuranceLevel {
  UNVERIFIED = 'UNVERIFIED',
  BASIC_KYC = 'BASIC_KYC',
  REGULATED_ENTITY = 'REGULATED_ENTITY',
  SYSTEM_CRITICAL = 'SYSTEM_CRITICAL',
}

// Legacy type aliases for backward compatibility
export type IssuerCategory = IssuerType;
export type VerificationLevel = AssuranceLevel;

/**
 * Credential Type
 * 
 * Types of credentials that can be issued.
 * Each type has allowed issuer categories defined in protocol.
 */
export enum CredentialType {
  // Identity & KYC
  AGE_OVER_18 = 'AGE_OVER_18',
  AGE_OVER_21 = 'AGE_OVER_21',
  KYC_LEVEL_1 = 'KYC_LEVEL_1',
  KYC_LEVEL_2 = 'KYC_LEVEL_2',
  KYC_TIER_1 = 'KYC_TIER_1',
  KYC_TIER_2 = 'KYC_TIER_2',
  KYC_TIER_3 = 'KYC_TIER_3',
  IDENTITY_VERIFIED = 'IDENTITY_VERIFIED',
  
  // Government
  VOTER_ELIGIBILITY = 'VOTER_ELIGIBILITY',
  CITIZENSHIP = 'CITIZENSHIP',
  RESIDENCY = 'RESIDENCY',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  
  // Financial
  FINANCIAL_ACCOUNT = 'FINANCIAL_ACCOUNT',
  CRYPTO_EXCHANGE_KYC = 'CRYPTO_EXCHANGE_KYC',
  ACCREDITED_INVESTOR = 'ACCREDITED_INVESTOR',
  BANK_ACCOUNT_VERIFIED = 'BANK_ACCOUNT_VERIFIED',
  CREDIT_SCORE = 'CREDIT_SCORE',
  INCOME_VERIFICATION = 'INCOME_VERIFICATION',
  PAYMENT_HISTORY = 'PAYMENT_HISTORY',
  
  // Healthcare
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  PRESCRIPTION = 'PRESCRIPTION',
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  PATIENT_CONSENT = 'PATIENT_CONSENT',
  VACCINATION_RECORD = 'VACCINATION_RECORD',
  LAB_RESULT = 'LAB_RESULT',
  SURGERY_RECORD = 'SURGERY_RECORD',
  ADMISSION_DISCHARGE = 'ADMISSION_DISCHARGE',
  ALLERGY_INFO = 'ALLERGY_INFO',
  PHYSICAL_EXAM = 'PHYSICAL_EXAM',
  REFERRAL = 'REFERRAL',
  FERTILITY_TREATMENT = 'FERTILITY_TREATMENT',
  IVF_CYCLE = 'IVF_CYCLE',
  EMBRYO_STORAGE = 'EMBRYO_STORAGE',
  PREGNANCY_TEST = 'PREGNANCY_TEST',
  MEDICAL_AUTHORIZATION = 'MEDICAL_AUTHORIZATION',
  
  // Health Insurance
  INSURANCE_COVERAGE = 'INSURANCE_COVERAGE',
  INSURANCE_CLAIM = 'INSURANCE_CLAIM',
  COVERAGE_VERIFICATION = 'COVERAGE_VERIFICATION',
  PROVIDER_NETWORK = 'PROVIDER_NETWORK',
  PREMIUM_PAID = 'PREMIUM_PAID',
  PRESCRIPTION_COVERAGE = 'PRESCRIPTION_COVERAGE',
  
  // Education & Professional
  DEGREE = 'DEGREE',
  TRANSCRIPT = 'TRANSCRIPT',
  PROFESSIONAL_LICENSE = 'PROFESSIONAL_LICENSE',
  CERTIFICATION = 'CERTIFICATION',
  RESEARCH_CREDENTIAL = 'RESEARCH_CREDENTIAL',
  
  // E-commerce & Shopping
  PURCHASE_HISTORY = 'PURCHASE_HISTORY',
  SHIPPING_ADDRESS_VERIFIED = 'SHIPPING_ADDRESS_VERIFIED',
  PRIME_MEMBERSHIP = 'PRIME_MEMBERSHIP',
  SELLER_REPUTATION = 'SELLER_REPUTATION',
  DELIVERY_CONFIRMATION = 'DELIVERY_CONFIRMATION',
  
  // Travel & Airlines
  FLIGHT_BOOKING = 'FLIGHT_BOOKING',
  FREQUENT_FLYER_STATUS = 'FREQUENT_FLYER_STATUS',
  BOARDING_PASS = 'BOARDING_PASS',
  TRAVEL_HISTORY = 'TRAVEL_HISTORY',
  MILEAGE_BALANCE = 'MILEAGE_BALANCE',
  
  // Government & Voting
  VOTER_REGISTRATION = 'VOTER_REGISTRATION',
  BALLOT_CAST = 'BALLOT_CAST',
  CITIZENSHIP_VERIFIED = 'CITIZENSHIP_VERIFIED',
  NATIONAL_ID = 'NATIONAL_ID',
  
  // Education
  EDUCATIONAL_DEGREE = 'EDUCATIONAL_DEGREE',
  
  // Personal & Social
  USER_PREFERENCE = 'USER_PREFERENCE',
  SOCIAL_ATTESTATION = 'SOCIAL_ATTESTATION',
  REPUTATION = 'REPUTATION',
  
  // Travel
  TRAVEL_AUTHORIZATION = 'TRAVEL_AUTHORIZATION',
  VISA = 'VISA',
  
  // Commerce
  MERCHANT_VERIFICATION = 'MERCHANT_VERIFICATION',
  PURCHASE_AUTHORIZATION = 'PURCHASE_AUTHORIZATION',
}

/**
 * Risk Score
 * 
 * Indicates the risk level of a credential or issuer.
 * Used for fraud detection and user warnings.
 */
export enum RiskScore {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Risk Assessment Result
 * 
 * Output of fraud detection analysis.
 */
export interface RiskAssessment {
  riskScore: RiskScore;
  reason?: string;
  flags?: string[];
  recommendation?: 'ALLOW' | 'WARN' | 'BLOCK';
}

/**
 * Issuer Record (On-Chain)
 * 
 * Complete metadata about a registered credential issuer.
 * This structure mirrors the on-chain AgenticDIDRegistry.
 * 
 * Uses THREE-AXIS MODEL:
 * 1. issuerType: Legal form (SELF_SOVEREIGN, CORPORATION, GOVERNMENT_ENTITY, INSTITUTION)
 * 2. domains: Array of sectors (MEDICAL, FINANCIAL, etc.) - can have multiple
 * 3. assuranceLevel: Trust strength (UNVERIFIED, BASIC_KYC, REGULATED_ENTITY, SYSTEM_CRITICAL)
 */
export interface IssuerRecord {
  // Identity (Axis 1: Legal Form)
  issuerDid: string;
  issuerType: IssuerType;
  
  // Sector Tags (Axis 2: What They Do) - MULTIPLE ALLOWED
  domains: IssuerDomain[];
  
  // Trust Level (Axis 3: Verification Strength)
  assuranceLevel: AssuranceLevel;
  
  // Legal Information
  legalName: string;
  claimedBrandName?: string;    // "Amazon", "Bank of America", etc.
  jurisdiction?: string;         // "US-DE", "EU", etc.
  
  // Brand Protection (fraud detection)
  brandAttestationDid?: string;  // DID that attested this brand claim
  brandAttestationProof?: string; // Cryptographic proof of brand ownership
  
  // Metadata
  metadataHash?: string;         // Hash of off-chain details (licenses, docs)
  registeredBy: string;          // DID of entity that onboarded this issuer
  stakeAmount?: bigint;          // Optional stake/bond amount
  
  // Status
  isRevoked: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  revokedAt?: Date;
}

/**
 * Trusted Issuer Config (Protocol Layer)
 * 
 * Protocol-level configuration for a trusted issuer.
 * Used in protocol/issuers/*.ts files.
 * 
 * Defines what credential types this issuer is ALLOWED and FORBIDDEN to issue.
 */
export interface TrustedIssuerConfig {
  // Identity
  issuerDid: string;
  issuerHumanName: string;
  
  // THREE-AXIS MODEL
  issuerType: IssuerType;
  domains: IssuerDomain[];
  assuranceLevel: AssuranceLevel;
  
  // Legal Information
  legalName: string;
  claimedBrandName?: string;
  jurisdiction?: string;
  
  // Brand Protection
  brandAttestationDid?: string;
  isBrandProtected?: boolean;  // If true, self-sovereign can't claim this brand
  
  // Credential Policy
  allowedCredentialTypes: CredentialType[];
  forbiddenCredentialTypes: CredentialType[];
  
  // Status
  isActive: boolean;
  
  // Metadata
  description: string;
  website?: string;
  contact?: string;
  logo?: string;
}

/**
 * Credential Type Policy
 * 
 * Defines which issuer types/domains can issue a specific credential type
 * and what minimum assurance level is required.
 * 
 * Can specify domain requirements (e.g., MEDICAL credentials require MEDICAL domain).
 */
export interface CredentialTypePolicy {
  credentialType: CredentialType;
  
  // Allowed issuer configurations
  allowedIssuerTypes: IssuerType[];
  requiredDomains?: IssuerDomain[];  // Must have AT LEAST ONE of these domains
  minAssuranceLevel: AssuranceLevel;
  
  // Additional requirements
  requiresStake?: boolean;
  requiresBrandAttestation?: boolean;
  
  description: string;
}

/**
 * Task Agent Policy
 * 
 * Defines what credentials a task agent requires to authorize actions.
 * Uses three-axis model for issuer requirements.
 */
export interface TaskAgentPolicy {
  agentId: string;
  agentName: string;
  requiredCredentials: {
    credentialType: CredentialType;
    allowedIssuerTypes: IssuerType[];
    requiredDomains?: IssuerDomain[];
    minAssuranceLevel: AssuranceLevel;
  }[];
}

/**
 * Verification Request
 * 
 * Request to verify a credential presentation.
 */
export interface VerificationRequest {
  credentialType: CredentialType;
  issuerDid: string;
  proof: string;  // ZK proof
  challenge?: string;
}

/**
 * Verification Response
 * 
 * Result of credential verification including issuer metadata.
 */
export interface VerificationResponse {
  valid: boolean;
  
  // Issuer Information (three-axis model)
  issuerDid?: string;
  issuerType?: IssuerType;
  domains?: IssuerDomain[];
  assuranceLevel?: AssuranceLevel;
  
  // Credential Information
  credentialType?: CredentialType;
  
  // Risk Assessment
  riskScore?: RiskScore;
  riskFlags?: string[];
  
  // Error (if invalid)
  error?: string;
  errorCode?: string;
}

/**
 * Well-Known Brand
 * 
 * Represents a verified major brand that should only be claimed by
 * CORPORATION issuers with high assurance levels.
 * 
 * Used for fraud detection: if a SELF_SOVEREIGN claims to be one of these,
 * it's an instant red flag unless they have brandAttestationDid.
 */
export interface WellKnownBrand {
  brandName: string;
  aliases: string[];  // Alternative names/spellings
  expectedIssuerDid?: string;  // Known legitimate issuer DID
  rootBrandDid?: string;  // Root brand DID that can issue attestations
  minIssuerType: IssuerType;
  minAssuranceLevel: AssuranceLevel;
}

/**
 * Credential Status
 * 
 * Lifecycle status of a credential.
 */
export enum CredentialStatus {
  VALID = 'valid',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  UNKNOWN = 'unknown',
}

/**
 * Proof Metadata
 * 
 * Additional context about a ZK proof.
 */
export interface ProofMetadata {
  proofType: string;
  createdAt: Date;
  expiresAt?: Date;
  nonce?: string;
  chainId?: string;
}

/**
 * Action Validation Request
 * 
 * Request to validate if an agent can perform an action.
 */
export interface ActionValidationRequest {
  agentDid: string;
  agentRole: string;
  agentScopes: string[];
  requiredRole: string;
  requiredScope: string;
  credentialType?: CredentialType;
}

/**
 * Action Validation Response
 * 
 * Result of action validation.
 */
export interface ActionValidationResponse {
  allowed: boolean;
  reason?: string;
  missingCredentials?: CredentialType[];
  insufficientVerification?: boolean;
}

/**
 * Agent Role
 * 
 * Defines the type/purpose of an agent in the system.
 */
export enum AgentRole {
  LOCAL_AGENT = 'LOCAL_AGENT',           // User's personal agent (e.g., Comet)
  ISSUER_AGENT = 'ISSUER_AGENT',         // Issues credentials for a trusted issuer (e.g., agent_0)
  TASK_AGENT = 'TASK_AGENT',             // Performs specific tasks (e.g., Banker, Crypto)
  VERIFIER_AGENT = 'VERIFIER_AGENT',     // Verifies credentials
}

/**
 * Agent Record
 * 
 * Registered agent in the AgenticDID protocol.
 * Indexed for fast lookups.
 */
export interface AgentRecord {
  // Identity
  agentDid: string;
  agentId: string;  // Short ID (e.g., 'agent_0', 'canonical_agent_101')
  
  // Role and relationships
  role: AgentRole;
  parentIssuerDid?: string;  // For ISSUER_AGENTs, which issuer they represent
  
  // Metadata
  description: string;
  capabilities?: string[];   // List of capabilities (e.g., ['kyc', 'credential_issuance'])
  
  // System classification
  isSystemAgent: boolean;    // True if agent_0..agent_100
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Agent Query Filters
 * 
 * Filters for searching registered agents.
 */
export interface AgentQueryFilters {
  role?: AgentRole;
  parentIssuerDid?: string;
  isSystemAgent?: boolean;
  isActive?: boolean;
  capability?: string;
}

/**
 * Issuer Query Filters
 * 
 * Filters for searching trusted issuers.
 */
export interface IssuerQueryFilters {
  category?: IssuerCategory;
  verificationLevel?: VerificationLevel;
  isActive?: boolean;
  isRevoked?: boolean;
  allowsCredentialType?: CredentialType;
}
