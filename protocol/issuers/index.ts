/**
 * Trusted Issuers Registry
 * 
 * All trusted issuers in the AgenticDID protocol.
 * Organized by category and activation status.
 */

// Active issuers (TI- prefix = Trusted Issuer)
export { TRUSTED_ISSUER_0_CONFIG } from './ti-agenticdid-protocol-issuer.js';

// Inactive issuers (placeholders until implementation)
export { BANK_ISSUER_CONFIG, BANK_ISSUER_DID } from './ti-CEX-issuer.js';
export { AMAZON_ISSUER_CONFIG, AMAZON_ISSUER_DID } from './ti-amazon-issuer.js';
export { AIRLINE_ISSUER_CONFIG, AIRLINE_ISSUER_DID } from './ti-airline-issuer.js';
export { ECUADORIAN_VOTING_ISSUER_CONFIG, ECUADORIAN_VOTING_ISSUER_DID } from './ti-ecuadorian-gvnmnt-voting-issuer.js';
export { DOCTORS_OFFICE_ISSUER_CONFIG, DOCTORS_OFFICE_ISSUER_DID } from './ti-doctors-office-issuer.js';
export { HOSPITAL_ISSUER_CONFIG, HOSPITAL_ISSUER_DID } from './ti-stanford-hospital-issuer.js';
export { IVF_CENTER_ISSUER_CONFIG, IVF_CENTER_ISSUER_DID } from './ti-stanford-ivf-research-center-issuer.js';
export { STANFORD_ISSUER_CONFIG, STANFORD_ISSUER_DID } from './ti-stanford-college-issuer.js';
export { BLUE_CROSS_ISSUER_CONFIG, BLUE_CROSS_ISSUER_DID } from './ti-blue-cross-medical-records-issuer.js';

// Note: Stanford has THREE separate issuer entities:
// - Stanford Hospital: General acute care, emergency services, hospital admissions
// - Stanford IVF Center: Specialized reproductive/fertility treatments
// - Stanford College: Academic institution (education + research)
// Plus Blue Cross: Health insurance (FINANCIAL + MEDICAL multi-domain)
// Different use cases, different specializations within same parent organization

/**
 * All issuers registry
 * 
 * Import all issuer configs for easy access.
 */
import { TRUSTED_ISSUER_0_CONFIG } from './ti-agenticdid-protocol-issuer.js';
import { BANK_ISSUER_CONFIG } from './ti-CEX-issuer.js';
import { AMAZON_ISSUER_CONFIG } from './ti-amazon-issuer.js';
import { AIRLINE_ISSUER_CONFIG } from './ti-airline-issuer.js';
import { ECUADORIAN_VOTING_ISSUER_CONFIG } from './ti-ecuadorian-gvnmnt-voting-issuer.js';
import { DOCTORS_OFFICE_ISSUER_CONFIG } from './ti-doctors-office-issuer.js';
import { HOSPITAL_ISSUER_CONFIG } from './ti-stanford-hospital-issuer.js';
import { IVF_CENTER_ISSUER_CONFIG } from './ti-stanford-ivf-research-center-issuer.js';
import { STANFORD_ISSUER_CONFIG } from './ti-stanford-college-issuer.js';
import { BLUE_CROSS_ISSUER_CONFIG } from './ti-blue-cross-medical-records-issuer.js';

export const ALL_ISSUERS = [
  TRUSTED_ISSUER_0_CONFIG,        // ✅ ACTIVE
  BANK_ISSUER_CONFIG,             // ❌ INACTIVE
  AMAZON_ISSUER_CONFIG,           // ❌ INACTIVE
  AIRLINE_ISSUER_CONFIG,          // ❌ INACTIVE
  ECUADORIAN_VOTING_ISSUER_CONFIG,// ❌ INACTIVE
  DOCTORS_OFFICE_ISSUER_CONFIG,   // ❌ INACTIVE
  HOSPITAL_ISSUER_CONFIG,         // ❌ INACTIVE (general acute care)
  IVF_CENTER_ISSUER_CONFIG,       // ❌ INACTIVE (specialized fertility)
  STANFORD_ISSUER_CONFIG,         // ❌ INACTIVE (academic + medical multi-domain)
  BLUE_CROSS_ISSUER_CONFIG,       // ❌ INACTIVE (health insurance: financial + medical)
] as const;

export const ACTIVE_ISSUERS = ALL_ISSUERS.filter(issuer => issuer.isActive);
export const INACTIVE_ISSUERS = ALL_ISSUERS.filter(issuer => !issuer.isActive);
