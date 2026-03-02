# AgenticDID Registry Status

> ⚠️ **DEPRECATION NOTICE**: This document is superseded by **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)** which includes:
> - The three-axis issuer model (IssuerType + IssuerDomain + AssuranceLevel)
> - Stanford University consolidation (Hospital, IVF, Education → one multi-domain issuer)
> - Updated registry with 7 TIs and 8 RAs
> - Complete credential type matrix
> 
> **Please refer to ISSUERS_AND_AGENTS_CHART.md for current information.**

---

**Complete registry of all trusted issuers and registered agents** *(LEGACY - Nov 14, 2025)*

---

## 📊 Overview

| Category | Total | Active | Inactive |
|----------|-------|--------|----------|
| **Trusted Issuers** | 8 | 1 | 7 |
| **Registered Agents** | 7 | 1 | 6 |

---

## 🏢 Trusted Issuers

### ✅ ACTIVE

| Issuer | DID | Category | Verification | Purpose |
|--------|-----|----------|--------------|---------|
| **AgenticDID Foundation** | `did:agentic:trusted_issuer_0` | CORPORATION | REGULATED_ENTITY | Root issuer, KYC Tier 1-2 |

### ❌ INACTIVE (Placeholders)

| Issuer | DID | Category | Verification | Purpose |
|--------|-----|----------|--------------|---------|
| **Bank** | `did:agentic:bank_issuer` | CORPORATION | REGULATED_ENTITY | Financial services, KYC Tier 1-3 |
| **Amazon** | `did:agentic:amazon_issuer` | CORPORATION | REGULATED_ENTITY | E-commerce, shopping credentials |
| **Airline** | `did:agentic:airline_issuer` | CORPORATION | REGULATED_ENTITY | Travel, flight credentials |
| **Ecuadorian Voting Dept** | `did:agentic:ecuadorian_voting_issuer` | GOVERNMENT_ENTITY | SYSTEM_CRITICAL | Voting, citizenship credentials |
| **Hospital** | `did:agentic:hospital_issuer` | INSTITUTION | REGULATED_ENTITY | Medical records, hospital care |
| **Doctor's Office** | `did:agentic:doctors_office_issuer` | INSTITUTION | REGULATED_ENTITY | Primary care, prescriptions |
| **IVF Center** | `did:agentic:ivf_center_issuer` | INSTITUTION | REGULATED_ENTITY | Fertility treatments |

---

## 🤖 Registered Agents

### ✅ ACTIVE

| Agent | DID | Role | Issuer | Purpose |
|-------|-----|------|--------|---------|
| **Comet** ☄️ | `did:agentic:canonical_agent_101` | LOCAL_AGENT | - | User's personal AI assistant |

### 🔜 NEXT TO IMPLEMENT

| Agent | DID | Role | Issuer | Purpose |
|-------|-----|------|--------|---------|
| **AgenticDID Issuer Agent** 🏛️ | `did:agentic:agent_0` | ISSUER_AGENT | trusted_issuer_0 | KYC workflows, credential issuance |

### ❌ INACTIVE (Placeholders)

| Agent | DID | Role | Issuer | Purpose |
|-------|-----|------|--------|---------|
| **Bank Agent** 🏦 | `did:agentic:bank_agent` | TASK_AGENT | bank_issuer | Account management, transfers |
| **Amazon Agent** 📦 | `did:agentic:amazon_agent` | TASK_AGENT | amazon_issuer | Shopping, order tracking |
| **Airline Agent** ✈️ | `did:agentic:airline_agent` | TASK_AGENT | airline_issuer | Flight booking, check-in |
| **Voting Agent** 🗳️ | `did:agentic:voting_agent` | TASK_AGENT | ecuadorian_voting_issuer | Voter registration, ballot casting |
| **Medical Agent** 🏥 | `did:agentic:medical_agent` | TASK_AGENT | hospital/doctor/ivf | Medical records, appointments |

---

## 🎯 Agent-Issuer Relationships

### AgenticDID Foundation Ecosystem
```
trusted_issuer_0 (AgenticDID Foundation)
    ├── agent_0 (Issuer Agent) 🔜 NEXT
    └── canonical_agent_101 (Comet) ✅ ACTIVE
```

### Financial Ecosystem (Inactive)
```
bank_issuer (Bank)
    └── bank_agent (Bank Agent) ❌ OFF
```

### E-Commerce Ecosystem (Inactive)
```
amazon_issuer (Amazon)
    └── amazon_agent (Amazon Agent) ❌ OFF
```

### Travel Ecosystem (Inactive)
```
airline_issuer (Airline)
    └── airline_agent (Airline Agent) ❌ OFF
```

### Government Ecosystem (Inactive)
```
ecuadorian_voting_issuer (Ecuadorian Voting Dept)
    └── voting_agent (Voting Agent) ❌ OFF
```

### Healthcare Ecosystem (Inactive)
```
hospital_issuer (Hospital)
doctors_office_issuer (Doctor's Office)
ivf_center_issuer (IVF Center)
    └── medical_agent (Medical Agent) ❌ OFF
        (can work with all medical issuers)
```

---

## 📜 Credential Type Matrix

### Identity & KYC
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `KYC_TIER_1` | AgenticDID, Bank | Shopping (< $100) |
| `KYC_TIER_2` | AgenticDID, Bank | Banking, Healthcare, Travel |
| `KYC_TIER_3` | Bank | Unlimited transfers, Voting |

### Financial
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `FINANCIAL_ACCOUNT` | Bank | Bank Agent operations |
| `BANK_ACCOUNT_VERIFIED` | Bank | Large transactions |
| `CREDIT_SCORE` | Bank | Loan applications |
| `INCOME_VERIFICATION` | Bank | Mortgages, large credit |

### E-Commerce
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `PURCHASE_HISTORY` | Amazon | Product recommendations |
| `PRIME_MEMBERSHIP` | Amazon | Prime benefits |
| `SHIPPING_ADDRESS_VERIFIED` | Amazon | Fast checkout |

### Travel
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `FLIGHT_BOOKING` | Airline | Check-in, boarding |
| `FREQUENT_FLYER_STATUS` | Airline | Upgrades, lounges |
| `BOARDING_PASS` | Airline | Airport security |

### Government & Voting
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `VOTER_ELIGIBILITY` | Ecuadorian Voting Dept | Voting Agent |
| `VOTER_REGISTRATION` | Ecuadorian Voting Dept | Ballot casting |
| `CITIZENSHIP_VERIFIED` | Ecuadorian Voting Dept | Legal identity |

### Healthcare
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `MEDICAL_RECORD` | Hospital, Doctor, IVF | Medical Agent access |
| `PRESCRIPTION` | Doctor | Pharmacy fulfillment |
| `VACCINATION_RECORD` | Hospital, Doctor | Travel requirements |
| `IVF_CYCLE` | IVF Center | Fertility tracking |

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Complete) ✅
- [x] trusted_issuer_0 config
- [x] Comet (canonical_agent_101) active
- [x] All issuers defined (inactive)
- [x] All agents defined (inactive)
- [x] Complete credential type enum
- [x] Registry infrastructure

### Phase 2: Canonical Flow (In Progress) 🔨
- [ ] agent_0 implementation (NEXT)
  - [ ] DID creation workflow
  - [ ] KYC Tier 1 workflow (email)
  - [ ] KYC Tier 2 workflow (gov ID)
  - [ ] Credential issuance
- [ ] John's end-to-end test
  - [ ] DID creation
  - [ ] KYC Tier 1
  - [ ] KYC Tier 2
  - [ ] Credential usage

### Phase 3: Replication (Future) ⏳
Following TD Bank philosophy - copy agent_0 pattern:

1. **Bank Ecosystem**
   - Implement bank_issuer
   - Implement bank_agent (copy agent_0 pattern)
   - Test banking operations

2. **E-Commerce Ecosystem**
   - Implement amazon_issuer
   - Implement amazon_agent (copy agent_0 pattern)
   - Test shopping operations

3. **Travel Ecosystem**
   - Implement airline_issuer
   - Implement airline_agent (copy agent_0 pattern)
   - Test travel operations

4. **Government Ecosystem**
   - Implement ecuadorian_voting_issuer
   - Implement voting_agent (copy agent_0 pattern)
   - Test voting operations

5. **Healthcare Ecosystem**
   - Implement hospital_issuer, doctors_office_issuer, ivf_center_issuer
   - Implement medical_agent (copy agent_0 pattern)
   - Test healthcare operations

---

## 📁 File Structure

```
protocol/
  issuers/
    ├── ti-agenticdid-protocol-issuer.ts        ✅ ACTIVE
    ├── ti-bank-issuer.ts             ❌ OFF
    ├── ti-amazon-issuer.ts           ❌ OFF
    ├── ti-airline-issuer.ts          ❌ OFF
    ├── ti-ecuadorian-voting-issuer.ts ❌ OFF
    ├── ti-doctors-office-issuer.ts   ❌ OFF
    ├── ti-stanford-hospital-issuer.ts ❌ OFF
    ├── ti-stanford-ivf-research-center-issuer.ts ❌ OFF
    ├── ti-stanford-college-issuer.ts ❌ OFF
    └── index.ts                      (exports all)
  
  agents/
    ├── registered-agents.ts       (all agent configs)
    └── index.ts                   (exports all)

backend/
  midnight/src/
    ├── types.ts                   (expanded CredentialType enum)
    └── indexer.ts                 (indexes all issuers/agents)
```

---

## 🎯 TD Bank Philosophy Applied

> **"We don't want to make a million checks perfectly.  
> We want to make ONE check perfectly and copy that process."**

**Applied to AgenticDID:**

1. ✅ **Define ALL issuers and agents upfront** - Structure in place
2. 🔜 **Build ONE perfect flow** - agent_0 + trusted_issuer_0 (NEXT)
3. ⏳ **Test with ONE real user** - John's KYC journey
4. ⏳ **Replicate for all others** - Copy agent_0 pattern

**Result:**
- 8 issuers defined (1 active, 7 ready)
- 7 agents defined (1 active, 6 ready)
- Clear implementation path
- No guesswork when scaling

---

**Status**: Registry complete, ready for agent_0 implementation 🚀  
**Last Updated**: 2025-11-14  
**Next**: Build agent_0 (AgenticDID Issuer Agent)
