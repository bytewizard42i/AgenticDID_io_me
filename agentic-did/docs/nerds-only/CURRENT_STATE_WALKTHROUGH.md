# 🗺️ Current State Walkthrough: Agents, Issuers, and DApp

**Date**: November 14, 2025  
**Status**: Phase 2 - Ready to build agent_0

---

## 📊 Overview: Where We Are

### ✅ **Completed**
1. ✅ Three-axis issuer model (Type + Domain + Assurance)
2. ✅ Complete issuer registry (7 trusted issuers defined)
3. ✅ Complete agent registry (8 registered agents defined)
4. ✅ Stanford consolidation (multi-domain showcase)
5. ✅ All type definitions and interfaces
6. ✅ Documentation (14 files, comprehensive)
7. ✅ Indexer architecture

### 🔜 **Next Steps**
1. 🔜 Build agent_0 (AgenticDID Issuer Agent)
2. 🔜 Implement KYC workflows (Tier 1, Tier 2)
3. 🔜 Test John's journey end-to-end
4. 🔜 Replicate pattern for other issuers

---

## 🤖 1. LOCAL AGENTS (Your Personal Agents)

### **Comet** ☄️ (canonical_agent_101) - ✅ ACTIVE

**What is it?**
- Your personal AI assistant
- The "voice" of AgenticDID
- Manages your credentials
- Delegates to task agents on your behalf

**Current Status:** ✅ **FULLY ACTIVE**

**Location:** 
```
protocol/agents/registered-agents.ts (lines 44-67)
```

**Configuration:**
```typescript
{
  agentDid: "did:agentic:canonical_agent_101",
  agentId: "canonical_agent_101",
  agentHumanName: "Comet",
  role: "LOCAL_AGENT",
  description: "Your personal AI assistant and the voice of AgenticDID",
  capabilities: [
    "credential_management",
    "agent_delegation", 
    "user_narration",
    "privacy_enforcement"
  ],
  isSystemAgent: true,
  isActive: true ✅
}
```

**What Comet Does:**
- 🎙️ Narrates your journey ("Listen In Mode")
- 🔐 Manages your credentials
- 🤝 Delegates tasks to specialized agents
- 🛡️ Enforces your privacy preferences
- 📋 Shows you what's happening behind the scenes

**Where to Use:**
- In the demo UI (DEMO-LAND repo)
- In production flows (REAL-DEAL repo)
- Your first interaction point with AgenticDID

---

## 🏛️ 2. REGISTERED AGENTS (Task Agents)

These are specialized agents that perform specific tasks on your behalf.

### Registry Overview (8 Agents Total)

| # | Agent | Role | Parent Issuer | Status | Next |
|---|-------|------|---------------|--------|------|
| 1 | **Comet** ☄️ | LOCAL_AGENT | - | ✅ ACTIVE | - |
| 2 | **agent_0** 🏛️ | ISSUER_AGENT | AgenticDID | 🔜 **BUILDING NOW** | Build next! |
| 3 | Bank Agent 🏦 | TASK_AGENT | Bank | ❌ OFF | After agent_0 |
| 4 | Amazon Agent 📦 | TASK_AGENT | Amazon | ❌ OFF | Phase 3 |
| 5 | Airline Agent ✈️ | TASK_AGENT | Airline | ❌ OFF | Phase 3 |
| 6 | Voting Agent 🗳️ | TASK_AGENT | Ecuador Voting | ❌ OFF | Phase 3 |
| 7 | Doctor's Office Agent 🩺 | TASK_AGENT | Doctor's Office | ❌ OFF | Phase 3 |
| 8 | Stanford Agent 🎓 | TASK_AGENT | Stanford University | ❌ OFF | Phase 4 |

### **agent_0** 🏛️ (AgenticDID Issuer Agent) - 🔜 NEXT TO BUILD

**What is it?**
- The official agent for trusted_issuer_0 (AgenticDID Foundation)
- Handles KYC workflows
- Issues credentials to users
- The "canonical issuer agent" - template for all others

**Current Status:** 🔜 **DEFINED, NOT IMPLEMENTED**

**Location:**
```
protocol/agents/registered-agents.ts (lines 69-99)
```

**Configuration:**
```typescript
{
  agentDid: "did:agentic:agent_0",
  agentId: "agent_0",
  agentHumanName: "AgenticDID Issuer Agent",
  role: "ISSUER_AGENT",
  parentIssuerDid: "did:agentic:trusted_issuer_0",
  description: "Official agent for AgenticDID Foundation. Handles DID creation and KYC workflows.",
  capabilities: [
    "did_creation",
    "kyc_tier_1_email",
    "kyc_tier_2_gov_id",
    "credential_issuance",
    "credential_revocation"
  ],
  isSystemAgent: true,
  isActive: false ❌ (will be true when built)
}
```

**What agent_0 Will Do:**
1. **DID Creation** - Creates self-sovereign DIDs for new users
2. **KYC Tier 1** - Email verification workflow
3. **KYC Tier 2** - Government ID verification workflow
4. **Credential Issuance** - Issues KYC credentials to users
5. **Credential Revocation** - Revokes compromised credentials

**The Canonical Flow (agent_0 + trusted_issuer_0):**
```
User (John) 
  → Comet (canonical_agent_101) "I want a DID"
  → agent_0 (AgenticDID Issuer Agent) "Create DID for John"
  → trusted_issuer_0 (AgenticDID Foundation) "Issue KYC_TIER_1 credential"
  → John receives credential
  → John can now use other agents!
```

**Implementation Files (To Create):**
```
backend/agents/src/agents/
  └── agent_0/
      ├── index.ts              // Main agent logic
      ├── did-creation.ts       // DID creation workflow
      ├── kyc-tier-1.ts         // Email verification
      ├── kyc-tier-2.ts         // Gov ID verification
      ├── credential-issuer.ts  // Issue credentials
      └── revocation.ts         // Revoke credentials
```

**Next Step:** 🚀 Build agent_0 following the canonical flow in `ISSUER_0_CANONICAL_FLOW.md`

---

### Other Task Agents (❌ All OFF Until Phase 3+)

**Bank Agent** 🏦
- Parent: Bank Issuer
- Capabilities: Account management, transfers, balance checks
- Status: Defined, not built

**Amazon Agent** 📦
- Parent: Amazon Issuer
- Capabilities: Shopping, order tracking, recommendations
- Status: Defined, not built

**Airline Agent** ✈️
- Parent: Airline Issuer
- Capabilities: Flight booking, check-in, itinerary
- Status: Defined, not built

**Voting Agent** 🗳️
- Parent: Ecuadorian Voting Dept
- Capabilities: Voter registration, ballot casting, receipt generation
- Status: Defined, not built

**Doctor's Office Agent** 🩺
- Parent: Doctor's Office Issuer
- Capabilities: Appointments, prescriptions, medical records
- Status: Defined, not built

**Stanford Agent** 🎓
- Parent: Stanford University Issuer
- Capabilities: Educational services, research access, medical services, IVF
- Status: Defined, not built (multi-domain showcase)

---

## 🏢 3. TRUSTED ISSUERS (Credential Issuers)

Trusted issuers are entities authorized to issue verifiable credentials.

### Registry Overview (7 Issuers Total)

| # | Issuer | Type | Domains | Assurance | Status |
|---|--------|------|---------|-----------|--------|
| 1 | **AgenticDID Foundation** | CORPORATION | IDENTITY_INFRA | REGULATED_ENTITY | ✅ ACTIVE |
| 2 | Bank | CORPORATION | FINANCIAL | REGULATED_ENTITY | ❌ OFF |
| 3 | Amazon | CORPORATION | E_COMMERCE | REGULATED_ENTITY | ❌ OFF |
| 4 | Airline | CORPORATION | TRAVEL | REGULATED_ENTITY | ❌ OFF |
| 5 | Ecuador Voting Dept | GOVERNMENT_ENTITY | GOV_SERVICES, VOTING | SYSTEM_CRITICAL | ❌ OFF |
| 6 | Doctor's Office | CORPORATION | MEDICAL | REGULATED_ENTITY | ❌ OFF |
| 7 | **Stanford University** | INSTITUTION | **EDUCATION, RESEARCH, MEDICAL** | REGULATED_ENTITY | ❌ OFF |

---

### **trusted_issuer_0** (AgenticDID Foundation) - ✅ ACTIVE

**What is it?**
- The ROOT issuer of the AgenticDID protocol
- Issues KYC credentials (Tier 1, Tier 2)
- The "trust anchor" for the entire system
- The "ONE PERFECT ISSUER" we build first

**Current Status:** ✅ **FULLY CONFIGURED, READY TO USE**

**Location:**
```
protocol/issuers/ti-agenticdid-protocol-issuer.ts
```

**Configuration (Three-Axis Model):**
```typescript
{
  issuerDid: "did:agentic:trusted_issuer_0",
  issuerId: "trusted_issuer_0",
  issuerHumanName: "AgenticDID Foundation",
  
  // THREE-AXIS MODEL:
  issuerType: IssuerType.CORPORATION,
  domains: [IssuerDomain.IDENTITY_INFRA],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  // WHAT IT CAN ISSUE:
  allowedCredentialTypes: [
    CredentialType.KYC_TIER_1,
    CredentialType.KYC_TIER_2,
    CredentialType.EMAIL_VERIFIED,
    CredentialType.GOV_ID_VERIFIED,
  ],
  
  // WHAT IT CANNOT ISSUE:
  forbiddenCredentialTypes: [
    CredentialType.VOTER_ELIGIBILITY,  // Not a government entity
    CredentialType.MEDICAL_RECORD,     // Not in MEDICAL domain
    CredentialType.FINANCIAL_ACCOUNT,  // Not in FINANCIAL domain
  ],
  
  isActive: true ✅
}
```

**What trusted_issuer_0 Issues:**
1. **KYC_TIER_1** - Email verified credentials
2. **KYC_TIER_2** - Government ID verified credentials
3. **EMAIL_VERIFIED** - Standalone email proof
4. **GOV_ID_VERIFIED** - Standalone gov ID proof

**Three-Axis Example:**
```typescript
// ✅ ALLOWED: Issue KYC_TIER_1
{
  credential: KYC_TIER_1,
  issuer: {
    type: CORPORATION ✅
    domains: [IDENTITY_INFRA] ✅
    assurance: REGULATED_ENTITY ✅
  }
}
// All requirements met!

// ❌ BLOCKED: Attempt to issue MEDICAL_RECORD
{
  credential: MEDICAL_RECORD,
  issuer: {
    type: CORPORATION ✅
    domains: [IDENTITY_INFRA] ❌ (needs MEDICAL)
    assurance: REGULATED_ENTITY ✅
  }
}
// Blocked! Domain mismatch.
```

**Files:**
```
protocol/issuers/
  ├── ti-agenticdid-protocol-issuer.ts     ✅ Configuration
  └── index.ts                   ✅ Exports
```

---

### **Stanford University Issuer** - ❌ OFF (Multi-Domain Showcase)

**What makes Stanford special?**
- Demonstrates **multi-domain capabilities** of three-axis model
- One issuer, three domains: EDUCATION + RESEARCH + MEDICAL

**Configuration:**
```typescript
{
  issuerDid: "did:agentic:stanford_issuer",
  issuerHumanName: "Stanford University",
  
  issuerType: IssuerType.INSTITUTION,
  domains: [
    IssuerDomain.EDUCATION,   // Grants degrees
    IssuerDomain.RESEARCH,    // Publishes research
    IssuerDomain.MEDICAL      // Runs hospital + IVF
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
  
  allowedCredentialTypes: [
    CredentialType.DEGREE,           // EDUCATION
    CredentialType.TRANSCRIPT,       // EDUCATION
    CredentialType.RESEARCH_CREDENTIAL,  // RESEARCH
    CredentialType.MEDICAL_RECORD,   // MEDICAL
    CredentialType.PRESCRIPTION,     // MEDICAL
    CredentialType.FERTILITY_TREATMENT, // MEDICAL
  ],
  
  isActive: false ❌
}
```

**Why This Matters:**
- **Old model** would require: `EDUCATIONAL_RESEARCH_MEDICAL_INSTITUTION` → category explosion!
- **New model**: Clean, composable, scales beautifully

**Replaces:** Hospital, IVF Center, Education issuers (consolidated into one)

---

### Other Issuers (❌ All OFF Until Phase 3+)

All defined with three-axis model, inactive until needed:
- **Bank** (CORPORATION + FINANCIAL + REGULATED_ENTITY)
- **Amazon** (CORPORATION + E_COMMERCE + REGULATED_ENTITY)
- **Airline** (CORPORATION + TRAVEL + REGULATED_ENTITY)
- **Ecuador Voting Dept** (GOVERNMENT_ENTITY + GOV_SERVICES/VOTING + SYSTEM_CRITICAL)
- **Doctor's Office** (CORPORATION + MEDICAL + REGULATED_ENTITY)

---

## 🎯 4. AGENTICDID DAPP (trusted_issuer_0 + agent_0)

### What is the "AgenticDID DApp"?

The **AgenticDID DApp** is the protocol's own issuer + agent system:

```
trusted_issuer_0 (AgenticDID Foundation)
    ├── agent_0 (AgenticDID Issuer Agent) 🔜 Building
    └── canonical_agent_101 (Comet) ✅ Active
```

### Current Status

| Component | Status | What It Is |
|-----------|--------|------------|
| **trusted_issuer_0** | ✅ CONFIGURED | Root issuer, KYC credentials |
| **agent_0** | 🔜 NEXT TO BUILD | Issuer agent, KYC workflows |
| **Comet** | ✅ ACTIVE | User's local agent |
| **Indexer** | ✅ BUILT | Fast lookups for TIs/RAs |
| **Types** | ✅ COMPLETE | Three-axis model implemented |
| **Docs** | ✅ COMPLETE | 14 documentation files |

### What Works NOW

✅ **Type System**
- Three-axis issuer model
- Policy enforcement interfaces
- Credential types (45+ types)
- Agent roles and capabilities

✅ **Registry**
- 7 trusted issuers defined
- 8 registered agents defined
- Indexer for fast lookups
- Complete configuration files

✅ **Documentation**
- PROTOCOL_RULES.md (all rules)
- THREE_AXIS_ISSUER_MODEL.md (model guide)
- ISSUERS_AND_AGENTS_CHART.md (registry)
- ISSUER_0_CANONICAL_FLOW.md (implementation guide)
- 10+ more docs

### What's NEXT: Building agent_0

**Goal:** Implement the canonical issuer agent

**What agent_0 Does:**
1. **DID Creation** - Self-sovereign DIDs for users
2. **KYC Tier 1** - Email verification
3. **KYC Tier 2** - Government ID verification
4. **Credential Issuance** - Issue KYC credentials
5. **Credential Revocation** - Revoke if compromised

**Implementation Plan:**
```
Step 1: Create agent_0 structure
  └── backend/agents/src/agents/agent_0/

Step 2: Implement DID creation
  └── agent_0/did-creation.ts

Step 3: Implement KYC Tier 1 (email)
  └── agent_0/kyc-tier-1.ts

Step 4: Implement KYC Tier 2 (gov ID)
  └── agent_0/kyc-tier-2.ts

Step 5: Implement credential issuance
  └── agent_0/credential-issuer.ts

Step 6: Test John's journey end-to-end
  └── See ISSUER_0_CANONICAL_FLOW.md
```

**Follow:** `docs/ISSUER_0_CANONICAL_FLOW.md` for the complete canonical flow

---

## 📁 File Locations

### Trusted Issuers
```
protocol/issuers/
  ├── ti-agenticdid-protocol-issuer.ts        ✅ AgenticDID Foundation (ACTIVE)
  ├── ti-bank-issuer.ts             ❌ Bank (OFF)
  ├── ti-amazon-issuer.ts           ❌ Amazon (OFF)
  ├── ti-airline-issuer.ts          ❌ Airline (OFF)
  ├── ti-ecuadorian-voting-issuer.ts ❌ Ecuador Voting (OFF)
  ├── ti-doctors-office-issuer.ts   ❌ Doctor's Office (OFF)
  ├── ti-stanford-hospital-issuer.ts ❌ Stanford Hospital (OFF)
  ├── ti-stanford-ivf-research-center-issuer.ts ❌ Stanford IVF Center (OFF)
  ├── ti-stanford-college-issuer.ts ❌ Stanford College (OFF)
  └── index.ts                   ✅ Exports all issuers
```

### Registered Agents
```
protocol/agents/
  ├── registered-agents.ts       ✅ All 8 agent configs
  └── index.ts                   ✅ Exports all agents
```

### Type Definitions
```
backend/midnight/src/
  └── types.ts                   ✅ Three-axis model, all types
```

### Documentation
```
docs/
  ├── README.md                           ✅ Documentation index
  ├── PROTOCOL_RULES.md                   ✅ All protocol rules
  ├── THREE_AXIS_ISSUER_MODEL.md          ✅ Model guide
  ├── ISSUERS_AND_AGENTS_CHART.md         ✅ Complete registry
  ├── ISSUER_0_CANONICAL_FLOW.md          ✅ Implementation guide
  ├── DID_AND_KYC_ARCHITECTURE.md         ✅ DID/KYC tiers
  ├── DOCUMENTATION_CHANGELOG.md          ✅ Change tracking
  └── (7 more docs...)                    ✅ Complete
```

---

## 🎯 Summary: Where You Are

### ✅ **What's Complete**
1. ✅ **trusted_issuer_0** configured and ready
2. ✅ **Comet** (canonical_agent_101) active and working
3. ✅ **Three-axis issuer model** fully implemented
4. ✅ **Complete registry** (7 TIs + 8 RAs defined)
5. ✅ **Stanford consolidation** (multi-domain showcase)
6. ✅ **Documentation** (14 files, comprehensive)
7. ✅ **Type system** (45+ credential types, policies, etc.)

### 🔜 **What's Next**
1. 🔜 **Build agent_0** (AgenticDID Issuer Agent)
2. 🔜 **Implement KYC workflows** (Tier 1: email, Tier 2: gov ID)
3. 🔜 **Test John's journey** end-to-end
4. 🔜 **Replicate pattern** for other issuers (Bank, Kraken, Visa)

### 🎯 **Your Next Action**
**Start building agent_0** following the canonical flow:

1. Read `docs/ISSUER_0_CANONICAL_FLOW.md`
2. Create `backend/agents/src/agents/agent_0/`
3. Implement DID creation workflow
4. Implement KYC Tier 1 workflow
5. Test with John's journey
6. Celebrate! 🎉

---

## 🚀 Quick Reference

**View All Issuers:**
```bash
cat protocol/issuers/index.ts
```

**View All Agents:**
```bash
cat protocol/agents/registered-agents.ts
```

**View Three-Axis Model:**
```bash
cat docs/THREE_AXIS_ISSUER_MODEL.md
```

**View Canonical Flow:**
```bash
cat docs/ISSUER_0_CANONICAL_FLOW.md
```

**View Complete Registry:**
```bash
cat docs/ISSUERS_AND_AGENTS_CHART.md
```

---

**Everything is documented, organized, and ready for agent_0 implementation!** 🚀
