# AgenticDID Protocol Rules

**THE CANONICAL REFERENCE - All protocol rules in one place**

---

## 📚 Table of Contents

1. [Core Principles](#core-principles)
2. [Canonical Identities](#canonical-identities)
3. [DID Rules](#did-rules)
4. [Issuer Rules](#issuer-rules)
5. [Agent Rules](#agent-rules)
6. [KYC Trust Tiers](#kyc-trust-tiers)
7. [Credential Rules](#credential-rules)
8. [Fraud Detection Rules](#fraud-detection-rules)
9. [Verification Rules](#verification-rules)
10. [Indexing Rules](#indexing-rules)
11. [Implementation Rules](#implementation-rules)

---

## 🎯 Core Principles

### **TD Bank Philosophy**

> **"We don't want to make a million checks perfectly.  
> We want to make ONE check perfectly and copy that process."**

**Application:**
- Build ONE trusted issuer perfectly (trusted_issuer_0)
- Build ONE issuer agent perfectly (agent_0)
- Build ONE local agent perfectly (canonical_agent_101 / Comet)
- Then replicate the pattern for all others

### **Self-Sovereignty First**

> **DID Creation ≠ KYC Requirement**

**Rules:**
- Users create self-sovereign DIDs without permission
- KYC is an optional credential that increases trust
- No KYC? No problem - limited access with Tier 0
- Progressive trust unlocks capabilities

### **Privacy by Design**

> **User controls what to reveal**

**Rules:**
- Credentials stored separately from DID
- Selective disclosure via ZK proofs
- Reveal minimum necessary information
- No correlation between actions

---

## 🆔 Canonical Identities

**PROTOCOL LAW - These are reserved and NEVER change**

### **Trusted Issuer**

```
ID:  trusted_issuer_0
DID: did:agentic:trusted_issuer_0
Entity: AgenticDID Foundation
Category: CORPORATION
Verification Level: REGULATED_ENTITY
Purpose: Root issuer, template for all others
```

**Rules:**
- First issuer registered in protocol
- Issues KYC_TIER_1 and KYC_TIER_2 initially
- Template for all future issuers
- Deployed at genesis

### **System Agent (Issuer)**

```
ID:  agent_0
DID: did:agentic:agent_0
Role: ISSUER_AGENT
Parent: trusted_issuer_0
Purpose: Canonical issuer agent, handles KYC
```

**Rules:**
- Linked to trusted_issuer_0
- Handles KYC workflows
- Issues credentials on behalf of trusted_issuer_0
- Template for all issuer agents

### **Local Agent**

```
ID:  canonical_agent_101
DID: did:agentic:canonical_agent_101
Role: LOCAL_AGENT
Name: Comet
Purpose: User's personal AI assistant
```

**Rules:**
- User-facing agent (the voice)
- Manages credentials locally
- Delegates to task agents
- Generates ZK proofs
- Template for all local agents

### **System Agent Range**

```
Reserved: agent_0 through agent_100
Purpose: Protocol/system agents only
```

**Rules:**
- ❌ NEVER use agent_0..agent_100 for task agents
- ✅ Task agents use IDs like: agent_banker, agent_crypto, agent_shopper
- ✅ System agents only: governance, audit, meta-registry
- Protection enforced in code via `isSystemAgentId()`

**Reference**: [`backend/shared/src/canonical-ids.ts`](../backend/shared/src/canonical-ids.ts)

---

## 🔑 DID Rules

### **DIDz Format (Self-Sovereign)**

```
did:agentic:user:<identifier>z

Where:
- did:agentic = Method identifier
- user = Entity type
- <identifier> = Hash of public key (32 hex chars)
- z = PRIVATE marker (self-sovereign, user-controlled)
```

**Examples:**
```
✅ did:agentic:user:abc123...z       (Self-sovereign user)
✅ did:agentic:trusted_issuer_0      (System issuer)
✅ did:agentic:agent_0               (System agent)
❌ did:agentic:user:abc123           (Missing 'z' - not self-sovereign)
```

### **DID Creation Rules**

**Rule 1: No Permission Required**
- Anyone can create a DIDz
- No centralized authority approval
- No KYC required
- Fully self-sovereign

**Rule 2: Local Key Generation**
- User generates keypair locally
- Private key NEVER leaves user's device
- DID derived from public key hash
- User controls their DID forever

**Rule 3: DID Document Storage**
- Can be stored locally (for privacy)
- Can be published on-chain (for discoverability)
- Must include public key
- Controller = DID itself (self-sovereign)

**Rule 4: DID Portability**
- User can export their DID + keys
- User can import to different device
- Keys remain under user control
- No vendor lock-in

**Reference**: [`docs/DID_AND_KYC_ARCHITECTURE.md`](./DID_AND_KYC_ARCHITECTURE.md)

---

## 🏢 Issuer Rules

### **Issuer Categories**

**Rule: Every issuer MUST have exactly ONE category**

| Category | Definition | Examples | Can Issue |
|----------|------------|----------|-----------|
| **SELF_SOVEREIGN** | Individual, small project | Personal blog, indie dev | Preferences, social attestations |
| **CORPORATION** | Verified business | BOA, Amazon, Coinbase | Financial, brand credentials |
| **GOVERNMENT_ENTITY** | Government agency | DMV, passport office | Legal identity, voting |
| **INSTITUTION** | Educational/medical | Universities, hospitals | Degrees, medical records |

**Rule: Category determines allowed credential types** (see Credential Rules)

### **Verification Levels**

**Rule: Every issuer MUST have exactly ONE verification level**

| Level | Requirements | Trust | Examples |
|-------|-------------|-------|----------|
| **UNVERIFIED** | Self-registration | Lowest | Indie projects |
| **BASIC_KYC** | Email, basic info | Low | Small businesses |
| **REGULATED_ENTITY** | Licenses, compliance | High | Banks, hospitals |
| **SYSTEM_CRITICAL** | Government/protocol | Highest | DMV, AgenticDID |

**Rule: Verification level determines security requirements**

### **Issuer Registration Rules**

**Rule 1: On-Chain Registration Required**
- All issuers registered in AgenticDIDRegistry contract
- Immutable audit trail
- Transparent to everyone

**Rule 2: Required Fields**
```typescript
{
  issuerDid: string;              // REQUIRED
  category: IssuerCategory;       // REQUIRED
  verificationLevel: VerificationLevel;  // REQUIRED
  legalName: string;              // REQUIRED
  claimedBrandName?: string;      // OPTIONAL but used for fraud detection
  jurisdiction?: string;          // REQUIRED for REGULATED_ENTITY
  metadataHash?: string;          // REQUIRED for CORPORATION+
  registeredBy: string;           // REQUIRED (who registered this issuer)
  stakeAmount?: bigint;           // REQUIRED for REGULATED_ENTITY
}
```

**Rule 3: Stake Requirements**
- REGULATED_ENTITY: 1M tDUST minimum
- SYSTEM_CRITICAL: 100k tDUST minimum
- Others: Optional but recommended

**Rule 4: Brand Name Uniqueness**
- Each claimedBrandName can only be claimed once
- Enforced by brand index
- Case-insensitive matching
- Prevents impersonation

**Reference**: [`protocol/issuers/ti-agenticdid-protocol-issuer.ts`](../protocol/issuers/ti-agenticdid-protocol-issuer.ts)

---

## 🤖 Agent Rules

### **Agent Roles**

**Rule: Every agent MUST have exactly ONE role**

| Role | Purpose | Examples | Can Do |
|------|---------|----------|--------|
| **LOCAL_AGENT** | User's assistant | Comet (canonical_agent_101) | Manage credentials, delegate tasks |
| **ISSUER_AGENT** | Issues credentials | agent_0 | KYC workflows, credential issuance |
| **TASK_AGENT** | Specific operations | Banker, Crypto, Shopper | Domain-specific actions |
| **VERIFIER_AGENT** | Verifies credentials | Midnight Gateway | Proof verification |

### **Agent Registration Rules**

**Rule 1: System Agents (agent_0..agent_100)**
- Reserved for protocol/system use
- Governance approval required
- Cannot be used for task agents
- Code enforcement via `assertNotSystemAgentId()`

**Rule 2: Task Agents (agent_101+)**
- Can be registered by anyone
- Must specify capabilities
- Must declare required credentials
- Follow naming convention: agent_<domain>

**Rule 3: Agent-Issuer Linkage**
- ISSUER_AGENTs MUST have parentIssuerDid
- Only linked agent can issue for that issuer
- Agent cannot issue for multiple issuers
- Prevents credential fraud

**Reference**: [`backend/midnight/src/types.ts`](../backend/midnight/src/types.ts) (AgentRole, AgentRecord)

---

## 🏆 KYC Trust Tiers

### **Tier System**

**Rule: KYC is OPTIONAL and progressive**

| Tier | Trust Level | Requirements | Unlocks |
|------|-------------|--------------|---------|
| **0** | UNVERIFIED | None (default with DIDz) | Browse, read |
| **1** | BASIC_VERIFICATION | Email + phone | Shop < $100 |
| **2** | IDENTITY_VERIFIED | Gov ID + address | Banking, crypto, healthcare |
| **3** | FULL_KYC | AML/CFT screening | Unlimited transfers, voting |
| **4** | ACCREDITED | Income/asset verification | Private investments |

### **KYC Credential Rules**

**Rule 1: Separate from DID**
- KYC credentials stored separately
- User chooses which to present
- Multiple tiers can coexist
- Higher tier doesn't revoke lower tier

**Rule 2: Issuer Requirements by Tier**

| Tier | Minimum Issuer Category | Minimum Verification Level |
|------|------------------------|----------------------------|
| 1 | Any | BASIC_KYC |
| 2 | CORPORATION or GOVERNMENT_ENTITY | BASIC_KYC |
| 3 | CORPORATION or GOVERNMENT_ENTITY | REGULATED_ENTITY |
| 4 | CORPORATION | REGULATED_ENTITY |

**Rule 3: Expiration**
- Tier 1: 180 days (6 months)
- Tier 2: 365 days (1 year)
- Tier 3: 365 days (1 year)
- Tier 4: 180 days (6 months, must re-verify income)

**Rule 4: Revocation**
- Issuer can revoke at any time
- User drops to highest remaining tier
- User notified immediately
- Audit trail preserved

**Reference**: [`docs/DID_AND_KYC_ARCHITECTURE.md`](./DID_AND_KYC_ARCHITECTURE.md)

---

## 📜 Credential Rules

### **Credential Type Policies**

**Rule: Each credential type has allowed issuer categories**

| Credential Type | Allowed Categories | Min Verification | Notes |
|----------------|-------------------|------------------|-------|
| `VOTER_ELIGIBILITY` | GOVERNMENT_ENTITY | SYSTEM_CRITICAL | ONLY government |
| `MEDICAL_RECORD` | INSTITUTION | BASIC_KYC | ONLY healthcare |
| `FINANCIAL_ACCOUNT` | CORPORATION | REGULATED_ENTITY | Banks only |
| `CRYPTO_EXCHANGE_KYC` | CORPORATION | REGULATED_ENTITY | Exchanges only |
| `KYC_TIER_1` | Any | BASIC_KYC | Widely available |
| `KYC_TIER_2` | CORP, GOVT | BASIC_KYC | Identity verification |
| `KYC_TIER_3` | CORP, GOVT | REGULATED_ENTITY | Full compliance |
| `USER_PREFERENCE` | Any | UNVERIFIED | Low trust OK |
| `SOCIAL_ATTESTATION` | SELF_SOVEREIGN, CORP | UNVERIFIED | Social proof |

**Rule: Mismatched category = BLOCKED**

Example violations:
- ❌ SELF_SOVEREIGN issuing VOTER_ELIGIBILITY → BLOCKED
- ❌ INSTITUTION issuing FINANCIAL_ACCOUNT → BLOCKED
- ❌ CORPORATION issuing MEDICAL_RECORD → BLOCKED

### **Credential Structure**

**Rule 1: Required Fields**
```typescript
{
  credentialId: string;           // REQUIRED (unique)
  issuerDid: string;              // REQUIRED
  subjectDid: string;             // REQUIRED (user's DIDz)
  credentialType: CredentialType; // REQUIRED
  issuedAt: Date;                 // REQUIRED
  expiresAt: Date;                // REQUIRED
  claims: {
    public: object;               // Always visible
    private: object;              // Selective disclosure
  },
  revocationHandle: string;       // REQUIRED (for revocation checks)
  signature: string;              // REQUIRED (issuer signature)
}
```

**Rule 2: Selective Disclosure**
- Public claims: Always revealed
- Private claims: Can be hidden via ZK proofs
- Derivable claims: Proven without revealing source

**Rule 3: Revocation**
- All credentials MUST have revocation handle
- Checked on every verification
- Revoked credentials fail verification
- Revocation cannot be undone

**Reference**: [`backend/midnight/src/types.ts`](../backend/midnight/src/types.ts) (CredentialType)

---

## 🛡️ Fraud Detection Rules

### **Brand Impersonation Rule**

> **If SELF_SOVEREIGN claims well-known brand → BLOCK immediately**

**Well-Known Brands Registry:**
- Amazon, Google, Microsoft, Apple
- Bank of America, JPMorgan, Wells Fargo, Citibank
- Coinbase, Binance, Kraken
- Delta, American Airlines, United Airlines
- + more in [`backend/midnight/src/fraud-detection.ts`](../backend/midnight/src/fraud-detection.ts)

**Detection:**
```typescript
if (
  issuerCategory === 'SELF_SOVEREIGN' &&
  isWellKnownBrand(claimedBrandName)
) {
  return {
    riskScore: 'CRITICAL',
    reason: 'BRAND_IMPERSONATION',
    recommendation: 'BLOCK'
  };
}
```

**Enforcement:** Automatic, no exceptions

### **Category Validation Rule**

> **Credential type MUST match issuer category**

**Examples:**
```typescript
// ✅ ALLOWED
CORPORATION → FINANCIAL_ACCOUNT
GOVERNMENT_ENTITY → VOTER_ELIGIBILITY
INSTITUTION → MEDICAL_RECORD

// ❌ BLOCKED
SELF_SOVEREIGN → FINANCIAL_ACCOUNT
CORPORATION → MEDICAL_RECORD
INSTITUTION → VOTER_ELIGIBILITY
```

**Enforcement:** Checked during credential issuance AND verification

### **Verification Level Rule**

> **Issuer verification level MUST meet credential minimum**

**Examples:**
```typescript
// ✅ ALLOWED
REGULATED_ENTITY → FINANCIAL_ACCOUNT (requires REGULATED_ENTITY)
BASIC_KYC → USER_PREFERENCE (requires UNVERIFIED)

// ❌ BLOCKED
UNVERIFIED → FINANCIAL_ACCOUNT (insufficient verification)
BASIC_KYC → VOTER_ELIGIBILITY (requires SYSTEM_CRITICAL)
```

**Enforcement:** Checked during credential issuance AND verification

### **Risk Scoring**

**Rule: All verifications receive risk score**

| Risk Score | Meaning | Action |
|-----------|---------|--------|
| **LOW** | Normal, expected | Allow |
| **MEDIUM** | Unusual but acceptable | Allow with logging |
| **HIGH** | Suspicious, review | Warn (or block in strict mode) |
| **CRITICAL** | Fraud detected | BLOCK immediately |

**Reference**: [`backend/midnight/src/fraud-detection.ts`](../backend/midnight/src/fraud-detection.ts)

---

## ✅ Verification Rules

### **Verification Flow**

**Rule: Every verification MUST complete ALL checks**

**Step 1: Issuer Lookup**
- Fetch issuer from index/registry
- Issuer MUST exist
- Issuer MUST be active
- Issuer MUST NOT be revoked

**Step 2: Fraud Detection**
- Check brand impersonation
- Validate issuer category for credential type
- Verify issuer verification level
- Calculate risk score

**Step 3: ZK Proof Verification**
- Cryptographically verify proof
- Check proof is for claimed credential type
- Verify proof includes required claims
- Proof MUST be valid

**Step 4: Credential Status**
- Check revocation (via revocation handle)
- Check expiration (issuedAt + validity period)
- Credential MUST be VALID status

**Step 5: Return Result**
```typescript
{
  valid: boolean;              // Overall result
  issuerDid: string;
  issuerCategory: IssuerCategory;
  verificationLevel: VerificationLevel;
  credentialType: CredentialType;
  riskScore: RiskScore;
  error?: string;              // If validation failed
  riskFlags?: string[];        // Specific concerns
}
```

**Rule: If ANY step fails → verification fails**

### **Caching Rules**

**Rule 1: Cache Successful Verifications**
- TTL: 60 seconds default
- Cache key: `${issuerDid}:${credentialType}:${proofHash}`
- Invalidate on issuer update/revocation

**Rule 2: Never Cache Failures**
- Failures checked fresh every time
- Prevents masking revocations
- Ensures fraud detection runs

**Rule 3: Cache Layers**
- Layer 3 (Memory): < 1ms
- Layer 2 (Database): < 10ms
- Layer 1 (On-chain): < 500ms

**Reference**: [`backend/midnight/src/verifier.ts`](../backend/midnight/src/verifier.ts)

---

## 📊 Indexing Rules

### **What Gets Indexed**

**Rule 1: All Trusted Issuers**
- Indexed by: issuerDid (primary key)
- Indexed by: category, verificationLevel, claimedBrandName
- Full-text search: legalName
- Array index: allowedCredentialTypes

**Rule 2: All Registered Agents**
- Indexed by: agentDid (primary key)
- Indexed by: role, parentIssuerDid, isSystemAgent
- Array index: capabilities

**Rule 3: Brand Index for Fraud Detection**
- Map: claimedBrandName → issuerDid
- Case-insensitive
- Updated on issuer registration
- Critical for sub-millisecond fraud checks

### **Sync Rules**

**Rule 1: Real-Time Sync**
- Subscribe to AgenticDIDRegistry events
- Process IssuerRegistered, IssuerRevoked events
- Update index within 5 seconds
- Invalidate cache on changes

**Rule 2: Batch Sync (Recovery)**
- Run on startup
- Fetch all issuers/agents from chain
- Rebuild indexes
- Verify consistency

**Rule 3: Consistency**
- On-chain = source of truth
- Index = fast read-only copy
- Conflicts resolved in favor of on-chain
- Regular consistency checks

### **Performance Targets**

| Operation | Target | Layer |
|-----------|--------|-------|
| Cached issuer lookup | < 1ms | Memory |
| Indexed issuer lookup | < 10ms | Database |
| On-chain fallback | < 500ms | Blockchain |
| Brand check (fraud) | < 1ms | Memory |
| Complex search | < 100ms | Database |

**Reference**: [`docs/INDEXING_ARCHITECTURE.md`](./INDEXING_ARCHITECTURE.md), [`backend/midnight/src/indexer.ts`](../backend/midnight/src/indexer.ts)

---

## 💻 Implementation Rules

### **TD Bank Philosophy in Code**

**Rule 1: One Perfect Template, Then Copy**

**DON'T:**
```typescript
// ❌ Bespoke implementation for each issuer
function handleBOAKyc(user) { /* custom logic */ }
function handleKrakenKyc(user) { /* different custom logic */ }
function handleVisaKyc(user) { /* yet more custom logic */ }
```

**DO:**
```typescript
// ✅ One perfect template, parameterized
function handleKyc(user, issuerConfig) {
  // Same logic for all issuers
  // issuerConfig provides variations
}

// Then copy config for each issuer
const BOA_CONFIG = { ... };
const KRAKEN_CONFIG = { ... };
const VISA_CONFIG = { ... };
```

**Rule 2: Configuration Over Code**

Prefer:
```typescript
// ✅ Configuration
const ISSUER_CONFIG = {
  issuerDid: 'did:agentic:issuer_1',
  category: 'CORPORATION',
  kycRequirements: ['email', 'gov_id'],
  ...
};
```

Over:
```typescript
// ❌ Hard-coded logic
if (issuer === 'BOA') {
  requireGovId();
  requireSSN();
} else if (issuer === 'Kraken') {
  // Different logic
}
```

### **Code Organization Rules**

**Rule 1: Clear Separation**
```
backend/
  midnight/         # ZK verification, Midnight Network
  agents/          # AI agents (Comet, task agents)
  shared/          # Shared types, canonical IDs

protocol/
  issuers/         # Issuer configurations
  contracts/       # Smart contracts (Compact)

docs/
  PROTOCOL_RULES.md          # This file (canonical rules)
  ISSUER_0_CANONICAL_FLOW.md # The one perfect flow
  DID_AND_KYC_ARCHITECTURE.md # DIDz and KYC tiers
  INDEXING_ARCHITECTURE.md    # RA/TI indexing
  ... (domain-specific docs)
```

**Rule 2: Import Canonical IDs**
```typescript
// ✅ Always import from canonical-ids.ts
import { TRUSTED_ISSUER_0_DID } from '@/shared/canonical-ids';

// ❌ Never hard-code
const issuer = 'did:agentic:trusted_issuer_0'; // NO!
```

**Rule 3: Use Type-Safe Enums**
```typescript
// ✅ Type-safe
category: IssuerCategory.CORPORATION

// ❌ Stringly-typed
category: 'CORPORATION'  // Typo risk
```

**Rule 4: Comment Why, Not What**
```typescript
// ❌ What (obvious)
// Set category to CORPORATION
category = IssuerCategory.CORPORATION;

// ✅ Why (helpful)
// CORPORATION category allows issuing FINANCIAL_ACCOUNT credentials
// while SELF_SOVEREIGN cannot (fraud prevention)
category = IssuerCategory.CORPORATION;
```

### **Testing Rules**

**Rule 1: Test the Canonical Flow First**
- Get trusted_issuer_0 → agent_0 → canonical_agent_101 working
- End-to-end test with John's KYC
- Then replicate for other issuers

**Rule 2: Test Fraud Detection**
- Test SELF_SOVEREIGN claiming "Bank of America" → BLOCKED
- Test wrong category for credential type → BLOCKED
- Test insufficient verification level → BLOCKED

**Rule 3: Test Progressive Trust**
- Test Tier 0: Can browse, cannot shop
- Test Tier 1: Can shop < $100
- Test Tier 2: Can access banking
- Test Tier 3: Can vote

**Reference**: [`docs/ONE_PERFECT_CHECK.md`](./ONE_PERFECT_CHECK.md)

---

## 📋 Rule Enforcement Checklist

**Before ANY code is merged:**

- [ ] Follows TD Bank philosophy (one perfect template)
- [ ] Uses canonical IDs from `canonical-ids.ts`
- [ ] Respects issuer category rules
- [ ] Implements fraud detection checks
- [ ] Separates DID from KYC credentials
- [ ] Uses type-safe enums and interfaces
- [ ] Has clear comments explaining "why"
- [ ] Tested against canonical flow
- [ ] Documented in appropriate file

**Before ANY issuer is added:**

- [ ] Follows trusted_issuer_0 template
- [ ] Has correct category assignment
- [ ] Has correct verification level
- [ ] Brand name verified (if applicable)
- [ ] Stake deposited (if required)
- [ ] Allowed credential types defined
- [ ] Documented in `protocol/issuers/`

**Before ANY agent is deployed:**

- [ ] Follows agent_0 or canonical_agent_101 template
- [ ] Has correct role assignment
- [ ] Not using system agent ID (agent_0..agent_100) unless authorized
- [ ] Required credentials defined
- [ ] Capabilities clearly listed
- [ ] Documented in appropriate location

---

## 📚 Documentation Map

### **Start Here**
1. **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** ← YOU ARE HERE
   - All rules in one place
   - Quick reference
   - Links to detailed docs

### **Core Architecture**
2. **[ONE_PERFECT_CHECK.md](./ONE_PERFECT_CHECK.md)**
   - TD Bank philosophy
   - Why BOA/Kraken/Visa first
   - Replication pattern

3. **[ISSUER_0_CANONICAL_FLOW.md](./ISSUER_0_CANONICAL_FLOW.md)**
   - The one perfect flow (A → B → C → D)
   - JSON examples
   - Success criteria

4. **[DID_AND_KYC_ARCHITECTURE.md](./DID_AND_KYC_ARCHITECTURE.md)**
   - DIDz (self-sovereign)
   - KYC trust tiers (0-4)
   - Progressive journey

### **Domain-Specific**
5. **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)**
   - Complete registry (7 TIs, 8 RAs)
   - Agent definitions
   - Issuer types
   - Credential matrix

6. **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)**
   - Three-axis issuer model
   - IssuerType + IssuerDomain + AssuranceLevel
   - Real-world examples

6. **[INDEXING_ARCHITECTURE.md](./INDEXING_ARCHITECTURE.md)**
   - RA/TI indexing
   - Three-tier architecture
   - Performance targets

7. **[COMET_PERSONALITY.md](./COMET_PERSONALITY.md)**
   - Comet's role as friend
   - Narration modes
   - Communication style

### **Implementation Guides**
8. **[CASSIE_GUIDE.md](./CASSIE_GUIDE.md)**
   - Developer guide
   - Code style
   - Protocol fidelity

9. **[FIRST_THREE_ISSUERS.md](./FIRST_THREE_ISSUERS.md)**
   - BOA, Kraken, Visa rationale
   - Adaptive DNA selection

### **Historical Context**
10. **[LESSONS_LEARNED.md](./LESSONS_LEARNED.md)**
    - Mesh.js patterns
    - What worked
    - What to avoid

---

**Status**: 📚 Complete  
**Owner**: AgenticDID Protocol Team  
**Version**: 1.0  
**Last Updated**: 2025-11-14

**This document is PROTOCOL LAW. All implementations must follow these rules.** 🔐
