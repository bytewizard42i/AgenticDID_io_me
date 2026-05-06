# Three-Axis Issuer Model

**Solving the "medical should be its own category" problem**

---

## 🎯 The Problem

When designing issuer categorization, you quickly hit category explosion:

❌ **Bad Approach: Flatten Everything**
```typescript
enum IssuerCategory {
  SELF_SOVEREIGN,
  CORPORATION,
  GOVERNMENT,
  MEDICAL_CORPORATION,      // ← Category explosion begins
  MEDICAL_GOVERNMENT,
  MEDICAL_INSTITUTION,
  FINANCIAL_CORPORATION,
  FINANCIAL_GOVERNMENT,
  // ... 50 more combinations ...
}
```

**Issues:**
- Can't represent a government hospital vs private hospital vs university medical center
- Can't represent health insurance (FINANCIAL + MEDICAL)
- Can't represent medical research institution (MEDICAL + RESEARCH + EDUCATION)
- Forces false choices

---

## ✅ The Solution: Three Independent Axes

Separate concerns into THREE independent dimensions:

### **Axis 1: Issuer Type (Legal Form)**
*What is their legal structure?*

```typescript
enum IssuerType {
  SELF_SOVEREIGN,      // Individual
  CORPORATION,         // Business entity (LLC, Inc)
  GOVERNMENT_ENTITY,   // Government organization
  INSTITUTION,         // Non-profit, university, NGO
}
```

### **Axis 2: Issuer Domain (Sector)**
*What do they actually do?* **← Can have MULTIPLE**

```typescript
enum IssuerDomain {
  GENERAL,
  IDENTITY_INFRA,
  FINANCIAL,
  CRYPTO_EXCHANGE,
  MEDICAL,           // ← Medical is a DOMAIN, not a type
  EDUCATION,
  RESEARCH,
  GOV_SERVICES,
  VOTING,
  E_COMMERCE,
  TRAVEL,
  AI_LAB,
}
```

### **Axis 3: Assurance Level (Trust)**
*How much do we trust them?*

```typescript
enum AssuranceLevel {
  UNVERIFIED,          // Self-registered, no checks
  BASIC_KYC,           // Email + basic docs verified
  REGULATED_ENTITY,    // Licensed by regulator (FDA, SEC, etc.)
  SYSTEM_CRITICAL,     // Government backing or critical infra
}
```

---

## 📊 Real-World Examples

### Example 1: Private Hospital
```typescript
{
  issuerType: IssuerType.CORPORATION,
  domains: [IssuerDomain.MEDICAL, IssuerDomain.RESEARCH],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "St. Mary's Hospital LLC",
  claimedBrandName: "St. Mary's Hospital",
}
```

**Translation:**
- **Legal form:** Private business (CORPORATION)
- **Activities:** Healthcare + research (MEDICAL + RESEARCH)
- **Trust:** Licensed by health regulator (REGULATED_ENTITY)

---

### Example 2: Government Hospital
```typescript
{
  issuerType: IssuerType.GOVERNMENT_ENTITY,
  domains: [IssuerDomain.MEDICAL, IssuerDomain.RESEARCH],
  assuranceLevel: AssuranceLevel.SYSTEM_CRITICAL,
  legalName: "Ministry of Health - National Hospital",
  claimedBrandName: "National Hospital",
}
```

**Translation:**
- **Legal form:** Government organization (GOVERNMENT_ENTITY)
- **Activities:** Healthcare + research (MEDICAL + RESEARCH)
- **Trust:** Government backing (SYSTEM_CRITICAL)

**Same activities, different legal form and trust level!**

---

### Example 3: University Medical Center
```typescript
{
  issuerType: IssuerType.INSTITUTION,
  domains: [
    IssuerDomain.MEDICAL,
    IssuerDomain.EDUCATION,
    IssuerDomain.RESEARCH,
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "Harvard Medical School Teaching Hospital",
  claimedBrandName: "Harvard Medical",
}
```

**Translation:**
- **Legal form:** Academic institution (INSTITUTION)
- **Activities:** Healthcare + education + research (3 domains!)
- **Trust:** Accredited and regulated (REGULATED_ENTITY)

---

### Example 4: Health Insurance Company
```typescript
{
  issuerType: IssuerType.CORPORATION,
  domains: [
    IssuerDomain.FINANCIAL,
    IssuerDomain.MEDICAL,
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "UnitedHealth Group",
  claimedBrandName: "UnitedHealthcare",
}
```

**Translation:**
- **Legal form:** Business (CORPORATION)
- **Activities:** Finance AND healthcare (FINANCIAL + MEDICAL)
- **Trust:** Regulated by insurance authority (REGULATED_ENTITY)

**This is the key insight: overlaps are FEATURES, not bugs!**

---

### Example 5: Doctor's Private Practice
```typescript
{
  issuerType: IssuerType.CORPORATION,  // or SELF_SOVEREIGN if sole proprietor
  domains: [IssuerDomain.MEDICAL],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "Dr. Smith Medical Practice LLC",
  claimedBrandName: "Dr. Smith Family Medicine",
}
```

**Translation:**
- **Legal form:** Small business (CORPORATION)
- **Activities:** Primary care (MEDICAL)
- **Trust:** Licensed doctor (REGULATED_ENTITY)

---

### Example 6: Crypto Bank
```typescript
{
  issuerType: IssuerType.CORPORATION,
  domains: [
    IssuerDomain.FINANCIAL,
    IssuerDomain.CRYPTO_EXCHANGE,
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "Kraken Financial Inc.",
  claimedBrandName: "Kraken",
}
```

**Translation:**
- **Legal form:** Business (CORPORATION)
- **Activities:** Traditional finance + crypto (FINANCIAL + CRYPTO_EXCHANGE)
- **Trust:** Regulated exchange (REGULATED_ENTITY)

---

### Example 7: Government Voting Department
```typescript
{
  issuerType: IssuerType.GOVERNMENT_ENTITY,
  domains: [
    IssuerDomain.GOV_SERVICES,
    IssuerDomain.VOTING,
  ],
  assuranceLevel: AssuranceLevel.SYSTEM_CRITICAL,
  legalName: "Consejo Nacional Electoral del Ecuador",
  claimedBrandName: "CNE Ecuador",
}
```

**Translation:**
- **Legal form:** Government agency (GOVERNMENT_ENTITY)
- **Activities:** Civic services + elections (GOV_SERVICES + VOTING)
- **Trust:** Sovereign authority (SYSTEM_CRITICAL)

---

### Example 8: Self-Sovereign User (Alice)
```typescript
{
  issuerType: IssuerType.SELF_SOVEREIGN,
  domains: [IssuerDomain.GENERAL],
  assuranceLevel: AssuranceLevel.UNVERIFIED,
  legalName: "Alice Personal DID",
  claimedBrandName: "Alice",
}
```

**Translation:**
- **Legal form:** Individual (SELF_SOVEREIGN)
- **Activities:** General use (GENERAL)
- **Trust:** None (UNVERIFIED)

**Can only issue low-risk attestations!**

---

## 🔒 Brand Protection Example

### Fraud Attempt: Self-Sovereign Claiming to be Amazon
```typescript
// ❌ This should be BLOCKED
{
  issuerType: IssuerType.SELF_SOVEREIGN,     // ← RED FLAG
  domains: [IssuerDomain.E_COMMERCE],
  assuranceLevel: AssuranceLevel.UNVERIFIED,  // ← RED FLAG
  legalName: "Bob's Personal DID",
  claimedBrandName: "Amazon",                 // ← RED FLAG (no attestation)
  brandAttestationDid: undefined,             // ← RED FLAG
}
```

**Fraud detection triggers:**
1. SELF_SOVEREIGN claiming major brand "Amazon"
2. No brandAttestationDid from real Amazon
3. UNVERIFIED assurance level
4. "Amazon" in well-known brands list

**Policy enforcement:**
```typescript
if (
  issuerType === IssuerType.SELF_SOVEREIGN &&
  claimedBrandName === "Amazon" &&
  !brandAttestationDid
) {
  return {
    risk: RiskScore.CRITICAL,
    recommendation: 'BLOCK',
    reason: 'Self-sovereign impersonating protected brand',
  };
}
```

---

### Legitimate Amazon
```typescript
// ✅ This should be ALLOWED
{
  issuerType: IssuerType.CORPORATION,
  domains: [IssuerDomain.E_COMMERCE],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  legalName: "Amazon.com, Inc.",
  claimedBrandName: "Amazon",
  brandAttestationDid: "did:agentic:brand_amazon_root",  // ← Verified!
  isBrandProtected: true,
}
```

---

## 🎯 Policy Enforcement Examples

### Medical Credential Requirements
```typescript
// Only these issuers can issue MEDICAL_RECORD
CredentialTypePolicy.MEDICAL_RECORD = {
  credentialType: CredentialType.MEDICAL_RECORD,
  
  // Any legal form EXCEPT self-sovereign
  allowedIssuerTypes: [
    IssuerType.CORPORATION,
    IssuerType.GOVERNMENT_ENTITY,
    IssuerType.INSTITUTION,
  ],
  
  // MUST have MEDICAL domain
  requiredDomains: [IssuerDomain.MEDICAL],
  
  // MUST be regulated
  minAssuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  description: "Only licensed healthcare providers can issue medical records",
};
```

**Result:**
- ✅ Private hospital (CORP + MEDICAL + REGULATED) → CAN issue
- ✅ Government hospital (GOV + MEDICAL + SYSTEM_CRITICAL) → CAN issue
- ✅ University medical center (INST + MEDICAL + REGULATED) → CAN issue
- ❌ Health insurance (CORP + FINANCIAL + MEDICAL + REGULATED) → BLOCKED (no MEDICAL in their actual practice)
- ❌ Self-sovereign doctor (SELF_SOVEREIGN + MEDICAL) → BLOCKED (wrong type)
- ❌ Unlicensed clinic (CORP + MEDICAL + BASIC_KYC) → BLOCKED (insufficient assurance)

---

### Voting Credential Requirements
```typescript
CredentialTypePolicy.VOTER_ELIGIBILITY = {
  credentialType: CredentialType.VOTER_ELIGIBILITY,
  
  // Only government can issue
  allowedIssuerTypes: [IssuerType.GOVERNMENT_ENTITY],
  
  // Must have voting domain
  requiredDomains: [IssuerDomain.VOTING],
  
  // Must be system critical
  minAssuranceLevel: AssuranceLevel.SYSTEM_CRITICAL,
  
  description: "Only government electoral authorities can issue voter eligibility",
};
```

**Result:**
- ✅ Electoral authority (GOV + VOTING + SYSTEM_CRITICAL) → CAN issue
- ❌ Private company (CORP + VOTING + REGULATED) → BLOCKED (not government)
- ❌ Government agency (GOV + GOV_SERVICES + SYSTEM_CRITICAL) → BLOCKED (no VOTING domain)

---

### Financial Credential Requirements
```typescript
CredentialTypePolicy.FINANCIAL_ACCOUNT = {
  credentialType: CredentialType.FINANCIAL_ACCOUNT,
  
  // Corporations or government banks
  allowedIssuerTypes: [
    IssuerType.CORPORATION,
    IssuerType.GOVERNMENT_ENTITY,
  ],
  
  // Must have financial domain
  requiredDomains: [IssuerDomain.FINANCIAL],
  
  // Must be regulated
  minAssuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  description: "Only regulated financial institutions can issue account credentials",
};
```

---

## 🎨 Summary: Why This Works

### ✅ Benefits

1. **Clean Separation of Concerns**
   - Legal form ≠ Activity ≠ Trust level
   - Each axis is independent

2. **Handles Overlaps Naturally**
   - University medical center: INSTITUTION + MEDICAL + EDUCATION + RESEARCH
   - Health insurance: CORPORATION + FINANCIAL + MEDICAL
   - No category explosion

3. **Precise Policy Enforcement**
   - "Medical credentials require MEDICAL domain + REGULATED assurance"
   - "Voting requires GOVERNMENT type + VOTING domain + SYSTEM_CRITICAL"
   - Clear, composable rules

4. **Fraud Detection**
   - Self-sovereign + major brand = red flag
   - Wrong domain for credential type = block
   - Insufficient assurance for sensitive data = block

5. **Scalability**
   - Add new domains without touching types or assurance levels
   - Add new types without touching domains
   - Add new assurance levels independently

---

## 🚀 Implementation in AgenticDID

### Issuer Registration Process

1. **Submit Registration**
   ```typescript
   {
     legalName: "St. Mary's Hospital LLC",
     claimedBrandName: "St. Mary's Hospital",
     issuerType: IssuerType.CORPORATION,
     requestedDomains: [IssuerDomain.MEDICAL],
   }
   ```

2. **Verification Process**
   - Check business registration (legal name)
   - Verify healthcare license (domain: MEDICAL)
   - Check regulatory compliance
   - Assign assuranceLevel based on verification

3. **On-Chain Registration**
   ```typescript
   AgenticDIDRegistry.registerIssuer({
     issuerDid: "did:agentic:st_marys_hospital",
     issuerType: IssuerType.CORPORATION,
     domains: [IssuerDomain.MEDICAL],
     assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
     legalName: "St. Mary's Hospital LLC",
     claimedBrandName: "St. Mary's Hospital",
     registeredBy: "did:agentic:trusted_issuer_0",
   });
   ```

4. **Credential Issuance Constraints**
   - Can issue: MEDICAL_RECORD, PRESCRIPTION, etc. (MEDICAL domain required)
   - Cannot issue: VOTER_ELIGIBILITY (wrong type/domain)
   - Cannot issue: FINANCIAL_ACCOUNT (no FINANCIAL domain)

---

## 📝 Key Takeaway

> **Medical is not a type. It's a domain.**  
> **Overlaps are not bugs. They're features.**  
> **Three axes solve everything.**

---

**Next:** Update all issuer configs to use three-axis model, implement policy enforcement in fraud detection system.
