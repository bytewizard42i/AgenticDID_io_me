# 🛰️ Oracle Standards for Midnight Network

**Privacy-Preserving Oracles for DIDz Ecosystem**

**Author**: John (bytewizard42i)  
**Date**: January 12, 2026  
**Status**: Standards Proposal  
**Parent Document**: [PP_DIDZ_VISION_MANIFESTO.md](./PP_DIDZ_VISION_MANIFESTO.md)

---

## 🎯 Purpose

Define standards for privacy-preserving oracles on Midnight Network that enable:
- **Jurisdictional verification** without location disclosure
- **KYC compliance** without PII exposure
- **Credential validation** without data transmission

---

## 📋 Oracle Categories

### **Category 1: Geo-Location Oracles**

#### **1.1 GPS Verification Oracle**

**Purpose**: Prove geographic location within a boundary without revealing exact coordinates.

```typescript
interface GeoLocationProof {
  proofType: 'GEO_BOUNDARY';
  boundaryId: string;           // e.g., 'US_STATE_CA', 'CITY_NYC'
  verificationTime: timestamp;
  proofHash: string;            // ZK proof hash
  
  // NEVER TRANSMITTED
  // actualCoordinates: REDACTED
  // preciseLocation: REDACTED
}
```

**Use Cases**:
| Scenario | Boundary Type | Proves | Hides |
|----------|---------------|--------|-------|
| Voting | Electoral district | In-district | Address |
| Employment | Commute radius | Within X miles | Home location |
| Compliance | Country/State | Jurisdiction | City/Street |
| Services | Service area | Eligible | Precise location |

#### **1.2 Residency Verification Oracle**

**Purpose**: Prove long-term residency without address disclosure.

```typescript
interface ResidencyProof {
  proofType: 'RESIDENCY';
  jurisdictionId: string;
  minimumDuration: Duration;    // e.g., '6_MONTHS', '1_YEAR'
  verificationDate: timestamp;
  proofHash: string;
  
  // NEVER TRANSMITTED
  // address: REDACTED
  // utilityRecords: REDACTED
}
```

---

### **Category 2: KYC Oracles**

#### **2.1 Identity Document Oracle**

**Purpose**: Prove valid government ID without sharing document details.

```typescript
interface IdentityDocumentProof {
  proofType: 'GOVERNMENT_ID';
  documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
  issuingAuthority: string;
  validityStatus: 'VALID' | 'EXPIRED';
  proofHash: string;
  
  // NEVER TRANSMITTED
  // documentNumber: REDACTED
  // fullName: REDACTED
  // dateOfBirth: REDACTED
  // photo: REDACTED
}
```

#### **2.2 SSN/Tax ID Oracle**

**Purpose**: Prove valid tax identification without revealing the number.

```typescript
interface TaxIdProof {
  proofType: 'TAX_ID_VALID';
  jurisdiction: string;         // e.g., 'US', 'UK', 'EU'
  idType: 'SSN' | 'ITIN' | 'EIN' | 'NIN';
  isValid: boolean;
  proofHash: string;
  
  // NEVER TRANSMITTED
  // taxIdNumber: REDACTED
  // taxRecords: REDACTED
}
```

**Progressive Disclosure Support**:
```typescript
interface ProgressiveDisclosure {
  credentialId: string;
  disclosureLevel: 'EXISTENCE' | 'PARTIAL' | 'FULL';
  authorizedParty: string;
  expiresAt: timestamp;
  
  // Level 1: Just prove it exists and is valid
  // Level 2: Reveal last 4 digits
  // Level 3: Full disclosure (for payroll, etc.)
}
```

#### **2.3 Background Check Oracle**

**Purpose**: Prove background status without revealing records.

```typescript
interface BackgroundProof {
  proofType: 'BACKGROUND_CHECK';
  checkTypes: BackgroundCheckType[];
  status: 'CLEAR' | 'FLAG';
  checkDate: timestamp;
  proofHash: string;
  
  // NEVER TRANSMITTED
  // criminalHistory: REDACTED
  // courtRecords: REDACTED
  // arrestRecords: REDACTED
}

enum BackgroundCheckType {
  CRIMINAL_FELONY,
  CRIMINAL_MISDEMEANOR,
  SEX_OFFENDER_REGISTRY,
  TERRORIST_WATCHLIST,
  FINANCIAL_FRAUD,
  PROFESSIONAL_SANCTIONS
}
```

---

### **Category 3: Credential Verification Oracles**

#### **3.1 Education Oracle**

**Purpose**: Verify educational credentials without transcript access.

```typescript
interface EducationProof {
  proofType: 'EDUCATION_CREDENTIAL';
  credentialType: 'HIGH_SCHOOL' | 'BACHELORS' | 'MASTERS' | 'DOCTORATE' | 'CERTIFICATION';
  fieldOfStudy?: string;        // Optional broad category
  issuingInstitution: string;   // Verified issuer DID
  graduationYear?: number;      // Optional
  proofHash: string;
  
  // NEVER TRANSMITTED
  // gpa: REDACTED
  // transcript: REDACTED
  // studentId: REDACTED
}
```

#### **3.2 Professional License Oracle**

**Purpose**: Verify professional licensing without license number exposure.

```typescript
interface ProfessionalLicenseProof {
  proofType: 'PROFESSIONAL_LICENSE';
  licenseType: string;          // e.g., 'MD', 'CPA', 'PE', 'BAR'
  jurisdiction: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'REVOKED';
  expirationStatus: 'VALID' | 'EXPIRED';
  proofHash: string;
  
  // NEVER TRANSMITTED
  // licenseNumber: REDACTED
  // disciplinaryHistory: REDACTED
}
```

#### **3.3 Employment Oracle**

**Purpose**: Verify employment without payroll details.

```typescript
interface EmploymentProof {
  proofType: 'EMPLOYMENT';
  employerDid: string;          // Verified employer
  employmentStatus: 'CURRENT' | 'FORMER';
  roleCategory?: string;        // Optional broad category
  tenureRange?: string;         // Optional: '1-3_YEARS', '5+_YEARS'
  proofHash: string;
  
  // NEVER TRANSMITTED
  // salary: REDACTED
  // startDate: REDACTED
  // performanceReviews: REDACTED
}
```

---

### **Category 4: Financial Oracles**

#### **4.1 Credit Worthiness Oracle**

**Purpose**: Prove creditworthiness without credit report access.

```typescript
interface CreditProof {
  proofType: 'CREDIT_WORTHINESS';
  scoreRange: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  meetsThreshold: boolean;      // For specific requirement
  proofHash: string;
  
  // NEVER TRANSMITTED
  // exactScore: REDACTED
  // creditHistory: REDACTED
  // accountDetails: REDACTED
}
```

#### **4.2 Income Verification Oracle**

**Purpose**: Prove income bracket without exact figures.

```typescript
interface IncomeProof {
  proofType: 'INCOME_VERIFICATION';
  incomeRange: string;          // e.g., '$50K-$75K', '$100K+'
  meetsMinimum: boolean;        // For specific threshold
  verificationSource: string;
  proofHash: string;
  
  // NEVER TRANSMITTED  
  // exactIncome: REDACTED
  // bankStatements: REDACTED
  // taxReturns: REDACTED
}
```

---

## 🔧 Oracle Implementation Standards

### **Required Properties for All Oracles**

```typescript
interface OracleStandard {
  // Identification
  oracleId: string;             // Unique oracle identifier
  oracleType: OracleCategory;
  version: string;
  
  // Trust
  trustedIssuerDid: string;     // Must be registered TI
  assuranceLevel: AssuranceLevel;
  
  // Proof
  proofProtocol: 'GROTH16' | 'PLONK' | 'STARK';
  proofExpiry: timestamp;
  
  // Audit
  verificationCount: number;
  lastVerified: timestamp;
  
  // Privacy
  dataMinimization: true;       // MUST always be true
  selectiveDisclosure: true;    // MUST always be true
}
```

### **Security Requirements**

1. ✅ **Zero-Knowledge Proofs**: All verifications via ZK
2. ✅ **No Raw Data**: Never transmit underlying data
3. ✅ **Time-Bounded**: Proofs expire
4. ✅ **Revocable**: Can be revoked by issuer or holder
5. ✅ **Auditable**: Verification trail without data trail
6. ❌ **No Correlation**: Prevent linking across verifications

### **Integration with DIDz Trust Triangle**

```
TRUSTED ISSUER (e.g., DMV, University)
        │
        │ Issues credential to DIDz wallet
        ▼
   DIDz WALLET (Hierarchical Privacy Wallet)
        │
        │ Generates ZK proof via Oracle
        ▼
     ORACLE (Geo, KYC, Credential)
        │
        │ Returns proof (no data)
        ▼
    VERIFIER (DApp, Employer, Service)
        │
        └── Accepts proof, grants access
```

---

## 📊 Oracle Registry

### **Phase 1 Oracles** (Priority)

| Oracle | Category | Status | Use Cases |
|--------|----------|--------|-----------|
| Geo-Boundary | Location | 🔜 PLANNED | Voting, Employment |
| SSN-Valid | KYC | 🔜 PLANNED | Employment, Finance |
| Non-Felon | Background | 🔜 PLANNED | Employment, Housing |
| Age-Threshold | KYC | 🔜 PLANNED | Services, Commerce |

### **Phase 2 Oracles**

| Oracle | Category | Status | Use Cases |
|--------|----------|--------|-----------|
| Residency | Location | 📋 PROPOSED | Tax, Services |
| Education | Credential | 📋 PROPOSED | Employment |
| Credit-Range | Financial | 📋 PROPOSED | Finance, Housing |
| Professional-License | Credential | 📋 PROPOSED | Services |

### **Phase 3 Oracles**

| Oracle | Category | Status | Use Cases |
|--------|----------|--------|-----------|
| Income-Range | Financial | 📋 PROPOSED | Housing, Finance |
| Employment-Status | Credential | 📋 PROPOSED | Services |
| Health-Insurance | Financial | 📋 PROPOSED | Healthcare |

---

## 🔗 Related Documents

- [Fi Standards](./FI_STANDARDS_FOR_DIDS_TIS_AND_RAS.md)
- [PP DIDz Vision](./PP_DIDZ_VISION_MANIFESTO.md)
- [Trusted Issuer Registry](../ISSUERS_AND_AGENTS_CHART.md)

---

**Document Status**: Standards Proposal  
**Last Updated**: January 12, 2026  
**Contributors**: John (bytewizard42i)
