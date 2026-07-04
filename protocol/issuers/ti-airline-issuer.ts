/**
 * Airline Trusted Issuer
 * 
 * Generic airline issuer for travel credentials.
 * Represents major airlines (Delta, United, American, etc.)
 * 
 * Status: INACTIVE (placeholder until implementation)
 */

import type { IssuerCategory, VerificationLevel, CredentialType } from '../../backend/midnight/src/types.js';

export const AIRLINE_ISSUER_ID = 'airline_issuer';
export const AIRLINE_ISSUER_DID = 'did:agentic:airline_issuer';

export interface AirlineIssuerConfig {
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
 * Airline Issuer Configuration
 */
export const AIRLINE_ISSUER_CONFIG: AirlineIssuerConfig = {
  issuerDid: AIRLINE_ISSUER_DID,
  issuerHumanName: 'Airline',
  category: 'CORPORATION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Generic Airline Corporation',
  claimedBrandName: 'Airline',
  jurisdiction: 'US',
  description: 'Airline for travel bookings, frequent flyer programs, and flight credentials',
  
  /**
   * Allowed Credentials
   * Airlines can issue travel-related credentials
   */
  allowedCredentialTypes: [
    'FLIGHT_BOOKING',
    'FREQUENT_FLYER_STATUS',
    'BOARDING_PASS',
    'TRAVEL_HISTORY',
    'MILEAGE_BALANCE',
  ],
  
  /**
   * Forbidden Credentials
   * Airlines CANNOT issue these
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
   * Turn ON when implementing Airline Agent
   */
  isActive: false,
  
  metadata: {
    website: 'https://example-airline.com',
    contactEmail: 'support@example-airline.com',
    logo: '/assets/airline-logo.svg',
  },
};
