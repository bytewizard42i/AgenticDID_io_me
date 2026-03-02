/**
 * Fraud Detection Module
 * 
 * Implements anti-fraud rules for AgenticDID protocol, including:
 * - Brand impersonation detection (self-sovereign claiming to be Amazon)
 * - Issuer category validation for credential types
 * - Verification level requirements
 * - Well-known brand registry
 * 
 * Core Rule: "Self-sovereign claiming to be Amazon = instant red flag"
 */

import type { Logger } from 'pino';
import {
  IssuerCategory,
  VerificationLevel,
  CredentialType,
  RiskScore,
} from './types.js';
import type {
  RiskAssessment,
  WellKnownBrand,
  IssuerRecord,
  CredentialTypePolicy,
} from './types.js';

/**
 * Well-Known Brands Registry
 * 
 * Major brands that should ONLY be claimed by verified CORPORATION issuers.
 * If a SELF_SOVEREIGN claims these, it's brand impersonation (CRITICAL risk).
 */
const WELL_KNOWN_BRANDS: WellKnownBrand[] = [
  // Technology
  {
    brandName: 'Amazon',
    aliases: ['Amazon.com', 'AWS', 'Amazon Web Services'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Google',
    aliases: ['Google Cloud', 'GCP', 'Alphabet'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Microsoft',
    aliases: ['Microsoft Azure', 'Azure'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Apple',
    aliases: ['Apple Inc', 'Apple Pay'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  
  // Finance
  {
    brandName: 'Bank of America',
    aliases: ['BOA', 'BofA'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'JPMorgan',
    aliases: ['JP Morgan', 'Chase', 'JPMorgan Chase'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Wells Fargo',
    aliases: [],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Citibank',
    aliases: ['Citi', 'Citigroup'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  
  // Crypto Exchanges
  {
    brandName: 'Coinbase',
    aliases: ['Coinbase Pro'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Binance',
    aliases: ['Binance US'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  {
    brandName: 'Kraken',
    aliases: [],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
  },
  
  // Airlines
  {
    brandName: 'Delta',
    aliases: ['Delta Airlines', 'Delta Air Lines'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.BASIC_KYC,
  },
  {
    brandName: 'American Airlines',
    aliases: ['AA', 'AmericanAir'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.BASIC_KYC,
  },
  {
    brandName: 'United Airlines',
    aliases: ['United'],
    minCategory: IssuerCategory.CORPORATION,
    minVerificationLevel: VerificationLevel.BASIC_KYC,
  },
];

/**
 * Credential Type Policies
 * 
 * Maps credential types to allowed issuer categories and minimum verification levels.
 * Enforces protocol-level rules about who can issue what.
 */
const CREDENTIAL_TYPE_POLICIES: Record<CredentialType, CredentialTypePolicy> = {
  // Identity & KYC - Government or Institution only
  [CredentialType.AGE_OVER_18]: {
    credentialType: CredentialType.AGE_OVER_18,
    allowedIssuerCategories: [
      IssuerCategory.GOVERNMENT_ENTITY,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Age verification requires government or institutional issuer',
  },
  [CredentialType.AGE_OVER_21]: {
    credentialType: CredentialType.AGE_OVER_21,
    allowedIssuerCategories: [
      IssuerCategory.GOVERNMENT_ENTITY,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Age verification requires government or institutional issuer',
  },
  [CredentialType.KYC_LEVEL_1]: {
    credentialType: CredentialType.KYC_LEVEL_1,
    allowedIssuerCategories: [
      IssuerCategory.CORPORATION,
      IssuerCategory.GOVERNMENT_ENTITY,
    ],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Basic KYC can be issued by verified corporations or government',
  },
  [CredentialType.KYC_LEVEL_2]: {
    credentialType: CredentialType.KYC_LEVEL_2,
    allowedIssuerCategories: [
      IssuerCategory.CORPORATION,
      IssuerCategory.GOVERNMENT_ENTITY,
    ],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Enhanced KYC requires regulated entity or government',
  },
  [CredentialType.IDENTITY_VERIFIED]: {
    credentialType: CredentialType.IDENTITY_VERIFIED,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Identity verification must come from government entity',
  },
  
  // Government - Government only
  [CredentialType.VOTER_ELIGIBILITY]: {
    credentialType: CredentialType.VOTER_ELIGIBILITY,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Voter eligibility MUST come from government voting authority',
  },
  [CredentialType.CITIZENSHIP]: {
    credentialType: CredentialType.CITIZENSHIP,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Citizenship must be issued by government',
  },
  [CredentialType.RESIDENCY]: {
    credentialType: CredentialType.RESIDENCY,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Residency must be issued by government',
  },
  [CredentialType.DRIVERS_LICENSE]: {
    credentialType: CredentialType.DRIVERS_LICENSE,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Drivers license must be issued by DMV/government',
  },
  
  // Financial - Corporation with regulation
  [CredentialType.FINANCIAL_ACCOUNT]: {
    credentialType: CredentialType.FINANCIAL_ACCOUNT,
    allowedIssuerCategories: [IssuerCategory.CORPORATION],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Financial accounts must be from regulated financial institutions',
    requiresStake: true,
  },
  [CredentialType.CRYPTO_EXCHANGE_KYC]: {
    credentialType: CredentialType.CRYPTO_EXCHANGE_KYC,
    allowedIssuerCategories: [IssuerCategory.CORPORATION],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Crypto exchange KYC must be from regulated exchange',
    requiresStake: true,
  },
  [CredentialType.ACCREDITED_INVESTOR]: {
    credentialType: CredentialType.ACCREDITED_INVESTOR,
    allowedIssuerCategories: [
      IssuerCategory.CORPORATION,
      IssuerCategory.GOVERNMENT_ENTITY,
    ],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Accredited investor status from financial institution or SEC',
  },
  
  // Healthcare - Institution only
  [CredentialType.MEDICAL_RECORD]: {
    credentialType: CredentialType.MEDICAL_RECORD,
    allowedIssuerCategories: [IssuerCategory.INSTITUTION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Medical records MUST come from healthcare institutions',
  },
  [CredentialType.PRESCRIPTION]: {
    credentialType: CredentialType.PRESCRIPTION,
    allowedIssuerCategories: [IssuerCategory.INSTITUTION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Prescriptions must be from licensed medical institutions',
  },
  [CredentialType.MEDICAL_LICENSE]: {
    credentialType: CredentialType.MEDICAL_LICENSE,
    allowedIssuerCategories: [
      IssuerCategory.GOVERNMENT_ENTITY,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Medical licenses from government or medical boards',
  },
  [CredentialType.PATIENT_CONSENT]: {
    credentialType: CredentialType.PATIENT_CONSENT,
    allowedIssuerCategories: [IssuerCategory.INSTITUTION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Patient consent from healthcare provider',
  },
  
  // Education & Professional - Institution
  [CredentialType.DEGREE]: {
    credentialType: CredentialType.DEGREE,
    allowedIssuerCategories: [IssuerCategory.INSTITUTION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Degrees must be from accredited educational institutions',
  },
  [CredentialType.PROFESSIONAL_LICENSE]: {
    credentialType: CredentialType.PROFESSIONAL_LICENSE,
    allowedIssuerCategories: [
      IssuerCategory.GOVERNMENT_ENTITY,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
    description: 'Professional licenses from licensing boards or government',
  },
  [CredentialType.CERTIFICATION]: {
    credentialType: CredentialType.CERTIFICATION,
    allowedIssuerCategories: [
      IssuerCategory.CORPORATION,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Certifications from recognized institutions or corporations',
  },
  
  // Personal & Social - Any category allowed
  [CredentialType.USER_PREFERENCE]: {
    credentialType: CredentialType.USER_PREFERENCE,
    allowedIssuerCategories: [
      IssuerCategory.SELF_SOVEREIGN,
      IssuerCategory.CORPORATION,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.UNVERIFIED,
    description: 'User preferences can be self-issued or from any trusted party',
  },
  [CredentialType.SOCIAL_ATTESTATION]: {
    credentialType: CredentialType.SOCIAL_ATTESTATION,
    allowedIssuerCategories: [
      IssuerCategory.SELF_SOVEREIGN,
      IssuerCategory.CORPORATION,
    ],
    minVerificationLevel: VerificationLevel.UNVERIFIED,
    description: 'Social attestations can be from individuals or platforms',
  },
  [CredentialType.REPUTATION]: {
    credentialType: CredentialType.REPUTATION,
    allowedIssuerCategories: [
      IssuerCategory.SELF_SOVEREIGN,
      IssuerCategory.CORPORATION,
      IssuerCategory.INSTITUTION,
    ],
    minVerificationLevel: VerificationLevel.UNVERIFIED,
    description: 'Reputation scores can be from various sources',
  },
  
  // Travel - Corporation or Government
  [CredentialType.TRAVEL_AUTHORIZATION]: {
    credentialType: CredentialType.TRAVEL_AUTHORIZATION,
    allowedIssuerCategories: [
      IssuerCategory.CORPORATION,
      IssuerCategory.GOVERNMENT_ENTITY,
    ],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Travel authorization from airlines or government',
  },
  [CredentialType.VISA]: {
    credentialType: CredentialType.VISA,
    allowedIssuerCategories: [IssuerCategory.GOVERNMENT_ENTITY],
    minVerificationLevel: VerificationLevel.SYSTEM_CRITICAL,
    description: 'Visas must be issued by government immigration authority',
  },
  
  // Commerce - Corporation
  [CredentialType.MERCHANT_VERIFICATION]: {
    credentialType: CredentialType.MERCHANT_VERIFICATION,
    allowedIssuerCategories: [IssuerCategory.CORPORATION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Merchant verification from payment processors or platforms',
  },
  [CredentialType.PURCHASE_AUTHORIZATION]: {
    credentialType: CredentialType.PURCHASE_AUTHORIZATION,
    allowedIssuerCategories: [IssuerCategory.CORPORATION],
    minVerificationLevel: VerificationLevel.BASIC_KYC,
    description: 'Purchase authorization from merchants or payment platforms',
  },
};

/**
 * Fraud Detection Engine
 */
export class FraudDetector {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'FraudDetector' });
  }

  /**
   * Check if a brand name matches well-known brands
   * 
   * @param brandName - Claimed brand name
   * @returns Matching well-known brand or undefined
   */
  private findWellKnownBrand(brandName: string): WellKnownBrand | undefined {
    const normalizedInput = brandName.toLowerCase().trim();
    
    return WELL_KNOWN_BRANDS.find(brand => {
      const normalizedBrand = brand.brandName.toLowerCase();
      const normalizedAliases = brand.aliases.map(a => a.toLowerCase());
      
      return normalizedInput === normalizedBrand ||
             normalizedAliases.includes(normalizedInput) ||
             normalizedInput.includes(normalizedBrand) ||
             normalizedBrand.includes(normalizedInput);
    });
  }

  /**
   * Detect brand impersonation
   * 
   * Core Rule: Self-sovereign claiming to be a well-known brand = CRITICAL risk
   * 
   * @param issuer - Issuer record to check
   * @returns Risk assessment
   */
  detectBrandImpersonation(issuer: IssuerRecord): RiskAssessment {
    // No brand claimed - no impersonation risk
    if (!issuer.claimedBrandName) {
      return { riskScore: RiskScore.LOW };
    }

    // Check if claimed brand is a well-known brand
    const wellKnownBrand = this.findWellKnownBrand(issuer.claimedBrandName);
    
    if (!wellKnownBrand) {
      // Not a well-known brand, no special concern
      return { riskScore: RiskScore.LOW };
    }

    // CRITICAL: Self-sovereign claiming to be a major brand
    if (issuer.category === IssuerCategory.SELF_SOVEREIGN) {
      this.logger.warn({
        issuerDid: issuer.issuerDid,
        claimedBrand: issuer.claimedBrandName,
        actualCategory: issuer.category,
      }, 'BRAND IMPERSONATION DETECTED: Self-sovereign claiming major brand');

      return {
        riskScore: RiskScore.CRITICAL,
        reason: 'BRAND_IMPERSONATION',
        flags: [
          `Self-sovereign issuer claiming to be "${issuer.claimedBrandName}"`,
          `Real ${issuer.claimedBrandName} should be CORPORATION with high verification`,
        ],
        recommendation: 'BLOCK',
      };
    }

    // Check if category is sufficient for this brand
    if (issuer.category !== wellKnownBrand.minCategory &&
        issuer.category !== IssuerCategory.GOVERNMENT_ENTITY) { // Government always OK
      return {
        riskScore: RiskScore.HIGH,
        reason: 'INSUFFICIENT_CATEGORY',
        flags: [
          `Brand "${issuer.claimedBrandName}" requires ${wellKnownBrand.minCategory}`,
          `Issuer is only ${issuer.category}`,
        ],
        recommendation: 'WARN',
      };
    }

    // Check if verification level is sufficient
    if (issuer.verificationLevel < wellKnownBrand.minVerificationLevel) {
      return {
        riskScore: RiskScore.HIGH,
        reason: 'INSUFFICIENT_VERIFICATION',
        flags: [
          `Brand "${issuer.claimedBrandName}" requires ${wellKnownBrand.minVerificationLevel}`,
          `Issuer only has ${issuer.verificationLevel}`,
        ],
        recommendation: 'WARN',
      };
    }

    // All checks passed
    return {
      riskScore: RiskScore.LOW,
      reason: 'VERIFIED_BRAND',
    };
  }

  /**
   * Validate issuer category for credential type
   * 
   * Checks if issuer's category is allowed to issue this credential type
   * according to protocol policy.
   * 
   * @param credentialType - Type of credential being issued
   * @param issuerCategory - Category of issuer
   * @returns Risk assessment
   */
  validateIssuerCategoryForCredential(
    credentialType: CredentialType,
    issuerCategory: IssuerCategory,
  ): RiskAssessment {
    const policy = CREDENTIAL_TYPE_POLICIES[credentialType];
    
    if (!policy) {
      this.logger.warn({ credentialType }, 'No policy defined for credential type');
      return {
        riskScore: RiskScore.MEDIUM,
        reason: 'NO_POLICY_DEFINED',
        recommendation: 'WARN',
      };
    }

    // Check if category is allowed
    if (!policy.allowedIssuerCategories.includes(issuerCategory)) {
      this.logger.warn({
        credentialType,
        issuerCategory,
        allowedCategories: policy.allowedIssuerCategories,
      }, 'Issuer category not allowed for credential type');

      return {
        riskScore: RiskScore.CRITICAL,
        reason: 'CATEGORY_NOT_ALLOWED',
        flags: [
          `${credentialType} requires issuer category: ${policy.allowedIssuerCategories.join(' or ')}`,
          `Issuer is ${issuerCategory}`,
        ],
        recommendation: 'BLOCK',
      };
    }

    return {
      riskScore: RiskScore.LOW,
      reason: 'CATEGORY_VALID',
    };
  }

  /**
   * Validate verification level for credential type
   * 
   * @param credentialType - Type of credential
   * @param verificationLevel - Issuer's verification level
   * @returns Risk assessment
   */
  validateVerificationLevel(
    credentialType: CredentialType,
    verificationLevel: VerificationLevel,
  ): RiskAssessment {
    const policy = CREDENTIAL_TYPE_POLICIES[credentialType];
    
    if (!policy) {
      return {
        riskScore: RiskScore.MEDIUM,
        reason: 'NO_POLICY_DEFINED',
        recommendation: 'WARN',
      };
    }

    // Check if verification level meets minimum
    const levelOrder = [
      VerificationLevel.UNVERIFIED,
      VerificationLevel.BASIC_KYC,
      VerificationLevel.REGULATED_ENTITY,
      VerificationLevel.SYSTEM_CRITICAL,
    ];

    const issuerLevelIndex = levelOrder.indexOf(verificationLevel);
    const requiredLevelIndex = levelOrder.indexOf(policy.minVerificationLevel);

    if (issuerLevelIndex < requiredLevelIndex) {
      return {
        riskScore: RiskScore.HIGH,
        reason: 'INSUFFICIENT_VERIFICATION_LEVEL',
        flags: [
          `${credentialType} requires ${policy.minVerificationLevel}`,
          `Issuer only has ${verificationLevel}`,
        ],
        recommendation: 'BLOCK',
      };
    }

    return {
      riskScore: RiskScore.LOW,
      reason: 'VERIFICATION_LEVEL_VALID',
    };
  }

  /**
   * Comprehensive issuer risk assessment
   * 
   * Runs all fraud detection checks on an issuer for a specific credential type.
   * 
   * @param issuer - Issuer record
   * @param credentialType - Type of credential being verified
   * @returns Overall risk assessment
   */
  assessIssuerRisk(
    issuer: IssuerRecord,
    credentialType: CredentialType,
  ): RiskAssessment {
    // Check 1: Brand impersonation
    const brandCheck = this.detectBrandImpersonation(issuer);
    if (brandCheck.riskScore === RiskScore.CRITICAL) {
      return brandCheck;
    }

    // Check 2: Category validation
    const categoryCheck = this.validateIssuerCategoryForCredential(
      credentialType,
      issuer.category,
    );
    if (categoryCheck.riskScore === RiskScore.CRITICAL) {
      return categoryCheck;
    }

    // Check 3: Verification level
    const levelCheck = this.validateVerificationLevel(
      credentialType,
      issuer.verificationLevel,
    );
    if (levelCheck.riskScore === RiskScore.CRITICAL || 
        levelCheck.riskScore === RiskScore.HIGH) {
      return levelCheck;
    }

    // Check 4: Revocation status
    if (issuer.isRevoked) {
      return {
        riskScore: RiskScore.CRITICAL,
        reason: 'ISSUER_REVOKED',
        flags: ['Issuer has been revoked'],
        recommendation: 'BLOCK',
      };
    }

    // Check 5: Active status
    if (!issuer.isActive) {
      return {
        riskScore: RiskScore.HIGH,
        reason: 'ISSUER_INACTIVE',
        flags: ['Issuer is not active'],
        recommendation: 'WARN',
      };
    }

    // All checks passed
    return {
      riskScore: RiskScore.LOW,
      reason: 'ALL_CHECKS_PASSED',
      recommendation: 'ALLOW',
    };
  }

  /**
   * Get credential type policy
   * 
   * @param credentialType - Credential type
   * @returns Policy or undefined
   */
  getCredentialPolicy(credentialType: CredentialType): CredentialTypePolicy | undefined {
    return CREDENTIAL_TYPE_POLICIES[credentialType];
  }

  /**
   * Get all well-known brands
   * 
   * @returns Array of well-known brands
   */
  getWellKnownBrands(): WellKnownBrand[] {
    return [...WELL_KNOWN_BRANDS];
  }
}

/**
 * Helper: Check if issuer category is allowed for credential type
 * 
 * @param credentialType - Credential type
 * @param issuerCategory - Issuer category
 * @returns True if allowed
 */
export function isIssuerCategoryAllowedForCredential(
  credentialType: CredentialType,
  issuerCategory: IssuerCategory,
): boolean {
  const policy = CREDENTIAL_TYPE_POLICIES[credentialType];
  return policy ? policy.allowedIssuerCategories.includes(issuerCategory) : false;
}
