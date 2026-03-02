/**
 * Amazon Trusted Issuer
 * 
 * E-commerce platform issuer for shopping and delivery credentials.
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const AMAZON_ISSUER_ID = 'amazon_issuer';
export const AMAZON_ISSUER_DID = 'did:agentic:amazon_issuer';

export interface AmazonIssuerConfig {
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
 * Amazon Issuer Configuration
 */
export const AMAZON_ISSUER_CONFIG: AmazonIssuerConfig = {
  issuerDid: AMAZON_ISSUER_DID,
  issuerHumanName: 'Amazon',
  category: 'CORPORATION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Amazon.com, Inc.',
  claimedBrandName: 'Amazon',
  jurisdiction: 'US-WA',
  description: 'E-commerce platform for shopping, delivery, and purchase verification',
  
  /**
   * Allowed Credentials
   * Amazon can issue shopping and delivery credentials
   */
  allowedCredentialTypes: [
    'PURCHASE_HISTORY',
    'SHIPPING_ADDRESS_VERIFIED',
    'PRIME_MEMBERSHIP',
    'SELLER_REPUTATION',
    'DELIVERY_CONFIRMATION',
  ],
  
  /**
   * Forbidden Credentials
   * Amazon CANNOT issue these
   */
  forbiddenCredentialTypes: [
    'VOTER_ELIGIBILITY',
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'FINANCIAL_ACCOUNT',
    'KYC_TIER_3',
  ],
  
  /**
   * Status: INACTIVE
   * Turn ON when implementing Amazon Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://amazon.com',
    contactEmail: 'support@amazon.com',
    logo: '/assets/amazon-logo.svg',
  },
};
