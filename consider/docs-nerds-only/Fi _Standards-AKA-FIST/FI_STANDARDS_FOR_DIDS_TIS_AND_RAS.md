# 🏛️ Fi Standards for DIDs, Trusted Issuers, and Registered Agents

<!-- 
TODO: Add Fi's media picture/avatar here 
![Fi](./assets/fi-avatar.png)
-->

**Established**: November 2025  
**Authority**: Fi (Protocol Architect)  
**Status**: Canonical Protocol Standards

---

## 🎯 Core Philosophy

### **TD Bank Philosophy: "One Perfect Check, Then Replicate"**

TD Bank built ONE perfect check template, tested it thoroughly, then replicated for all check types.

**Applied to AgenticDID**:
1. Build **ONE perfect issuer** (trusted_issuer_0)
2. Build **ONE perfect agent** (agent_0)
3. Test the canonical flow end-to-end
4. Once proven → replicate for all others
5. Never deviate from proven pattern

**FIRM STANDARD**: No issuer or agent goes active until the canonical flow works perfectly.

---

## 🔺 Three-Axis Issuer Model

Every Trusted Issuer MUST be characterized by THREE independent dimensions:

### **Axis 1: IssuerType** (Legal Form)
```typescript
enum IssuerType {
  SELF_SOVEREIGN,      // Individual
  CORPORATION,         // Business entity
  GOVERNMENT_ENTITY,   // Government org
  INSTITUTION,         // Non-profit/educational
}
```

### **Axis 2: IssuerDomain** (Sector - CAN BE MULTIPLE)
```typescript
enum IssuerDomain {
  GENERAL,            // Default
  IDENTITY_INFRA,     // Core identity
  FINANCIAL,          // Banking, payments
  MEDICAL,            // Healthcare
  EDUCATION,          // Schools, universities
  RESEARCH,           // Research institutions
  GOV_SERVICES,       // Government services
  VOTING,             // Elections
  E_COMMERCE,         // Online shopping
  TRAVEL,             // Airlines, hotels
  // ... more
}
```

**Examples**:
- Stanford: `[EDUCATION, RESEARCH, MEDICAL]`
- Blue Cross: `[FINANCIAL, MEDICAL]`
- Hospital: `[MEDICAL]`

### **Axis 3: AssuranceLevel** (Trust Strength)
```typescript
enum AssuranceLevel {
  UNVERIFIED,         // Self-registered
  BASIC_KYC,          // Email + phone
  REGULATED_ENTITY,   // Licensed & regulated
  SYSTEM_CRITICAL,    // Government/critical infra
}
```

**FIRM STANDARD**: ALL issuers use three-axis model. No exceptions.

---

## 🆔 DID Standards

### **Format**
```
did:agentic:<issuer_id>
```

### **Rules**
1. ✅ MUST use `did:agentic:` prefix
2. ✅ MUST use snake_case
3. ✅ MUST be globally unique
4. ✅ MUST be immutable
5. ❌ NO spaces or special characters (except underscore)

### **Reserved Ranges**
- **agent_0 to agent_100**: System agents (protocol-controlled)
- **canonical_agent_101**: Comet (reference local agent)
- **trusted_issuer_0**: AgenticDID Foundation (canonical issuer)

---

## 🏢 Trusted Issuer Standards

### **Canonical Issuer: trusted_issuer_0**

**FIRM STANDARD**: `trusted_issuer_0` MUST be:
1. AgenticDID Foundation (dogfooding)
2. Fully implemented FIRST
3. The template all others follow
4. The protocol's trust anchor

### **Configuration Requirements**

Every issuer MUST specify:
```typescript
{
  issuerDid: string;              // ✅ REQUIRED
  issuerHumanName: string;        // ✅ REQUIRED
  
  // Three-axis model
  issuerType: IssuerType;         // ✅ REQUIRED
  domains: IssuerDomain[];        // ✅ REQUIRED (array!)
  assuranceLevel: AssuranceLevel; // ✅ REQUIRED
  
  // Legal
  legalName: string;              // ✅ REQUIRED
  
  // Credential policy
  allowedCredentialTypes: [];     // ✅ REQUIRED
  forbiddenCredentialTypes: [];   // ✅ REQUIRED
  
  // Status
  isActive: boolean;              // ✅ REQUIRED (default: false)
}
```

### **Activation Rules**

Can only activate when:
1. ✅ Corresponding agent implemented
2. ✅ Workflows built and tested
3. ✅ Documentation complete
4. ✅ End-to-end testing passed

---

## 🤖 Registered Agent Standards

### **Agent Hierarchy**

**THREE TYPES**:

1. **LOCAL_AGENT**: User's personal assistant
   - Example: Comet
   - One per user
   - Manages credentials, delegates tasks

2. **ISSUER_AGENT**: Official agent for issuer
   - Example: agent_0
   - Handles KYC, credential issuance
   - One per issuer

3. **TASK_AGENT**: Specialized service agent
   - Examples: Bank Agent, Medical Records Agent
   - Performs specific tasks
   - Many, each specialized

### **Canonical Agents**

**Comet (canonical_agent_101)**:
- ✅ ACTIVE (only active agent currently)
- Reference LOCAL_AGENT implementation
- User's primary interface

**agent_0 (AgenticDID Issuer Agent)**:
- 🔜 NEXT TO BUILD
- Reference ISSUER_AGENT implementation
- Handles KYC and credential issuance for trusted_issuer_0

### **Configuration Requirements**

Every agent MUST specify:
```typescript
{
  agentDid: string;               // ✅ REQUIRED
  agentHumanName: string;         // ✅ REQUIRED
  role: AgentRole;                // ✅ REQUIRED
  parentIssuerDid?: string;       // Required for ISSUER/TASK agents
  capabilities: string[];         // ✅ REQUIRED
  requiredCredentials?: string[]; // Credentials user needs
  isActive: boolean;              // ✅ REQUIRED (default: false)
}
```

---

## 📜 Credential Type Standards

### **Naming**
- ✅ SCREAMING_SNAKE_CASE
- ✅ Descriptive (no abbreviations)
- ✅ Clear semantic meaning

**Examples**:
- ✅ `KYC_TIER_1`
- ✅ `INSURANCE_COVERAGE`
- ❌ `KYC1` (too abbreviated)

### **Policy Enforcement**

Every issuer MUST specify both:
- `allowedCredentialTypes`: What they CAN issue
- `forbiddenCredentialTypes`: What they CANNOT issue

**Example**:
```typescript
// Blue Cross (FINANCIAL + MEDICAL)
allowedCredentialTypes: [
  'INSURANCE_COVERAGE',     // ✅ Has MEDICAL domain
  'INSURANCE_CLAIM',        // ✅ Has FINANCIAL domain
],
forbiddenCredentialTypes: [
  'MEDICAL_RECORD',         // ❌ Not a healthcare provider
  'BANK_ACCOUNT_VERIFIED',  // ❌ Not a bank
]
```

---

## 🏗️ Implementation Philosophy

### **Build Order**

**FIRM STANDARD**: Follow this EXACT order:

**Phase 1** (Current):
1. Build trusted_issuer_0 ✅
2. Build agent_0 🔜
3. Build Comet ✅
4. Test John's journey end-to-end
5. Document everything

**Phase 2** (After Phase 1 complete):
6. Replicate for next issuer (e.g., Bank)
7. Follow proven pattern
8. Test end-to-end

**Phase 3** (After Phase 2 complete):
9. Scale to all other issuers
10. Each follows the template

**FIRM STANDARD**: NEVER build multiple issuers in parallel until Phase 1 complete.

### **The Canonical Flow**

This MUST work perfectly:
```
USER (John)
  ↓
LOCAL_AGENT (Comet)
  ↓
ISSUER_AGENT (agent_0)
  ↓
TRUSTED_ISSUER (trusted_issuer_0)
  ↓
CREDENTIAL ISSUED (KYC_TIER_1)
  ↓
USER can now use TASK_AGENTS
```

---

## 📝 Naming Conventions

### **Files**: kebab-case with TI-/RA- prefix
```
✅ ti-agenticdid-protocol-issuer.ts
✅ ti-blue-cross-issuer.ts
✅ ra-comet.ts
✅ ra-bank-agent.ts
❌ TrustedIssuer0.ts
❌ trusted-issuer-0.ts (missing TI- prefix)
```

### **Constants**: SCREAMING_SNAKE_CASE
```typescript
const TRUSTED_ISSUER_0_DID = 'did:agentic:trusted_issuer_0';
const COMET_AGENT_CONFIG: RegisteredAgentConfig = { /* ... */ };
```

### **Functions**: camelCase
```typescript
function getAgentByDid(did: string) { /* ... */ }
```

### **Types**: PascalCase
```typescript
interface TrustedIssuerConfig { /* ... */ }
enum IssuerType { /* ... */ }
```

---

## 🔒 Security Standards

1. ✅ All actions cryptographically signed
2. ✅ Zero-knowledge proofs for privacy
3. ✅ Brand protection enforced
4. ✅ User controls data sharing
5. ✅ Audit trails for access
6. ❌ Never transmit private keys

---

## 📚 Documentation Standards

### **Every file MUST have**:
```typescript
/**
 * [File Purpose]
 * 
 * [Description]
 * 
 * Status: ACTIVE | INACTIVE | PLANNED
 */
```

### **Public functions MUST have JSDoc**:
```typescript
/**
 * [Description]
 * 
 * @param [name] - [description]
 * @returns [description]
 * 
 * @example
 * [usage example]
 */
```

---

## ✅ Activation Checklists

### **Before Activating Issuer**:
- [ ] Three-axis model applied
- [ ] Allowed/forbidden credentials specified
- [ ] Corresponding agent implemented
- [ ] All workflows built and tested
- [ ] End-to-end testing complete
- [ ] Documentation updated

### **Before Activating Agent**:
- [ ] Role assigned
- [ ] Capabilities list complete
- [ ] All capabilities implemented
- [ ] Required credentials specified
- [ ] Integration tested
- [ ] Documentation updated

---

## 📊 Current Registry (10 TIs + 10 RAs)

### **Trusted Issuers**
1. ✅ AgenticDID (IDENTITY_INFRA) - **ACTIVE**
2. ❌ Bank (FINANCIAL) - OFF
3. ❌ Amazon (E_COMMERCE) - OFF
4. ❌ Airline (TRAVEL) - OFF
5. ❌ Ecuador Voting (GOV_SERVICES, VOTING) - OFF
6. ❌ Doctor's Office (MEDICAL) - OFF
7. ❌ Hospital (MEDICAL) - OFF
8. ❌ IVF Center (MEDICAL) - OFF
9. ❌ Stanford (EDUCATION, RESEARCH, MEDICAL) - OFF
10. ❌ Blue Cross (FINANCIAL, MEDICAL) - OFF

### **Registered Agents**
1. ✅ Comet (LOCAL_AGENT) - **ACTIVE**
2. 🔜 agent_0 (ISSUER_AGENT) - **NEXT TO BUILD**
3-10. ❌ All other agents - OFF

---

## 🎯 The Fi Standards (Summary)

1. **Three-Axis Model** - ALWAYS
2. **TD Bank Philosophy** - One perfect, then replicate
3. **Canonical First** - trusted_issuer_0 before all others
4. **Test Real Users** - John's journey must work
5. **Document Everything** - Keep it updated
6. **Type Safety** - TypeScript strict mode
7. **Security First** - Crypto proofs, ZK, privacy
8. **Consistent Naming** - Follow conventions
9. **Never Activate Early** - Test thoroughly first

---

**These standards are PROTOCOL LAW. Follow them rigorously.** 🏛️

---

## 🔗 Related Vision Documents

### **PP DIDz Ecosystem**

The Fi Standards are part of a broader vision for Privacy-Preserving Digital Identity:

- **[PP DIDz Vision Manifesto](./PP_DIDZ_VISION_MANIFESTO.md)** - The complete vision for hierarchical privacy wallets, the trust triangle, and adoption strategy
- **[Oracle Standards](./ORACLE_STANDARDS.md)** - Standards for geo-location, KYC, and credential verification oracles on Midnight
- **[DIDz.io](http://DIDz.io)** - The DApp implementation

### **Key Concepts from PP DIDz Vision**

1. **Hierarchical Privacy Wallet** - Folderized smart contract functionality (Google Folders model)
2. **Credential Types**: Rescindable (Driver's License) vs Immutable (PhD)
3. **Trust Triangle**: Trusted Issuers → DIDz DApp → Credential Holders + Biometric Verification
4. **Progressive Disclosure**: Reveal only what you need, when you need to
5. **Oracles**: Geo-location/KYC verification without data exposure

### **Interoperability Focus**

Standards designed to work with:
- Cardano BTC DeFi Bridge (Midnight as privacy layer)
- XRP (speed and low-cost transactions)
- Cross-chain credential verification

### **Collaboration Initiative** (January 2026)

Building global scientific conversation with:
- @OpenZeppelin, @SundaeSwap, @nmkr_io, @eddalabs_io, @BrickTowers
- Midnight Foundation (@MidnightNtwrk, @midnightfdn)

> *"One day there will just be 'Fi'."* — Charles Hoskinson

---

**Last Updated**: January 12, 2026
