# 📊 Complete Registry: Trusted Issuers & Registered Agents

**Last Updated:** Nov 14, 2025

---

## 🎯 Overview

| **Category** | **Total** | **Active** | **Inactive** |
|--------------|-----------|------------|--------------|
| **Trusted Issuers (TI)** | 7 | 1 | 6 |
| **Registered Agents (RA)** | 8 | 1 | 7 |

---

## 🏢 Trusted Issuers (TI)

### ✅ ACTIVE ISSUERS

| # | Issuer Name | DID | Type | Domains | Assurance | Purpose |
|---|-------------|-----|------|---------|-----------|---------|
| **1** | **AgenticDID Foundation** | `did:agentic:trusted_issuer_0` | CORPORATION | IDENTITY_INFRA | REGULATED_ENTITY | Root issuer, KYC Tier 1-2 |

---

### ❌ INACTIVE ISSUERS (Placeholders)

| # | Issuer Name | DID | Type | Domains | Assurance | Purpose |
|---|-------------|-----|------|---------|-----------|---------|
| **2** | **Bank** | `did:agentic:bank_issuer` | CORPORATION | FINANCIAL | REGULATED_ENTITY | Banking, KYC Tier 1-3 |
| **3** | **Amazon** | `did:agentic:amazon_issuer` | CORPORATION | E_COMMERCE | REGULATED_ENTITY | Shopping, deliveries |
| **4** | **Airline** | `did:agentic:airline_issuer` | CORPORATION | TRAVEL | REGULATED_ENTITY | Flights, miles, travel |
| **5** | **Ecuador Voting Dept** | `did:agentic:ecuadorian_voting_issuer` | GOVERNMENT_ENTITY | GOV_SERVICES, VOTING | SYSTEM_CRITICAL | Voting, citizenship |
| **6** | **Doctor's Office** | `did:agentic:doctors_office_issuer` | CORPORATION | MEDICAL | REGULATED_ENTITY | Primary care, prescriptions |
| **7** | **Stanford University** 🎓 | `did:agentic:stanford_university` | INSTITUTION | EDUCATION, RESEARCH, MEDICAL | REGULATED_ENTITY | **Multi-domain:** Degrees, research, hospital, IVF |

---

## 🤖 Registered Agents (RA)

### ✅ ACTIVE AGENTS

| # | Agent Name | DID | Role | Parent Issuer | Purpose |
|---|------------|-----|------|---------------|---------|
| **1** | **Comet** ☄️ | `did:agentic:canonical_agent_101` | LOCAL_AGENT | - | User's personal AI assistant |

---

### 🔜 NEXT TO IMPLEMENT

| # | Agent Name | DID | Role | Parent Issuer | Purpose |
|---|------------|-----|------|---------------|---------|
| **2** | **AgenticDID Issuer Agent** 🏛️ | `did:agentic:agent_0` | ISSUER_AGENT | AgenticDID Foundation | KYC workflows, credential issuance |

---

### ❌ INACTIVE AGENTS (Placeholders)

| # | Agent Name | DID | Role | Parent Issuer | Purpose |
|---|------------|-----|------|---------------|---------|
| **3** | **Bank Agent** 🏦 | `did:agentic:bank_agent` | TASK_AGENT | Bank | Account management, transfers |
| **4** | **Amazon Agent** 📦 | `did:agentic:amazon_agent` | TASK_AGENT | Amazon | Shopping, order tracking |
| **5** | **Airline Agent** ✈️ | `did:agentic:airline_agent` | TASK_AGENT | Airline | Flight booking, check-in |
| **6** | **Voting Agent** 🗳️ | `did:agentic:voting_agent` | TASK_AGENT | Ecuador Voting Dept | Voter registration, ballot casting |
| **7** | **Doctor's Office Agent** 👨‍⚕️ | `did:agentic:doctors_office_agent` | TASK_AGENT | Doctor's Office | Appointments, prescriptions |
| **8** | **Stanford Agent** 🎓 | `did:agentic:stanford_agent` | TASK_AGENT | Stanford University | **Multi-domain:** Education + Research + Medical + IVF |

---

## 🎓 Stanford University: The Multi-Domain Showcase

**Stanford demonstrates the THREE-AXIS MODEL perfectly:**

```typescript
{
  issuerType: IssuerType.INSTITUTION,
  domains: [
    IssuerDomain.EDUCATION,   // 🎓 Degrees, transcripts, enrollment
    IssuerDomain.RESEARCH,    // 🔬 Publications, grants, lab access
    IssuerDomain.MEDICAL,     // 🏥 Hospital + IVF services
  ],
  assuranceLevel: AssuranceLevel.REGULATED_ENTITY,
}
```

### **What Stanford Covers:**

| Domain | Services | Credentials |
|--------|----------|-------------|
| **🎓 Education** | Degrees, transcripts, enrollment, tuition | `DEGREE`, `EDUCATIONAL_DEGREE`, `CERTIFICATION` |
| **🔬 Research** | Publications, grants, lab access | `SOCIAL_ATTESTATION`, `REPUTATION` |
| **🏥 Medical** | Hospital records, surgeries, prescriptions | `MEDICAL_RECORD`, `SURGERY_RECORD`, `PRESCRIPTION`, `LAB_RESULT` |
| **🤰 IVF Center** | Fertility treatments, embryo storage | `FERTILITY_TREATMENT`, `IVF_CYCLE`, `EMBRYO_STORAGE`, `PREGNANCY_TEST` |

### **Stanford Agent Capabilities:**

```typescript
capabilities: [
  // Educational
  'view_transcript',
  'degree_verification',
  'enrollment_status',
  'course_registration',
  'tuition_payment',
  
  // Research
  'publication_access',
  'research_grants',
  'lab_access',
  'research_collaboration',
  
  // Medical (Stanford Hospital)
  'view_medical_records',
  'book_appointment',
  'prescription_refill',
  'lab_results',
  'surgery_scheduling',
  'vaccination_records',
  
  // Fertility (Stanford IVF Center)
  'fertility_consultation',
  'ivf_cycle_management',
  'embryo_storage_access',
  'pregnancy_test_results',
]
```

**ONE issuer, ONE agent, FOUR service areas!**

---

## 🌳 Issuer → Agent Relationships

### AgenticDID Foundation Ecosystem ✅ ACTIVE
```
trusted_issuer_0 (AgenticDID Foundation)
    ├── agent_0 (Issuer Agent) 🔜 NEXT
    └── canonical_agent_101 (Comet) ✅ ACTIVE
```

### Financial Ecosystem ❌ INACTIVE
```
bank_issuer (Bank)
    └── bank_agent (Bank Agent)
```

### E-Commerce Ecosystem ❌ INACTIVE
```
amazon_issuer (Amazon)
    └── amazon_agent (Amazon Agent)
```

### Travel Ecosystem ❌ INACTIVE
```
airline_issuer (Airline)
    └── airline_agent (Airline Agent)
```

### Government Ecosystem ❌ INACTIVE
```
ecuadorian_voting_issuer (Ecuador Voting Dept)
    └── voting_agent (Voting Agent)
```

### Primary Care Ecosystem ❌ INACTIVE
```
doctors_office_issuer (Doctor's Office)
    └── doctors_office_agent (Doctor's Office Agent)
```

### Stanford Multi-Domain Ecosystem ❌ INACTIVE
```
stanford_issuer (Stanford University)
    └── stanford_agent (Stanford Agent)
        ├── 🎓 Education Services
        ├── 🔬 Research Services
        ├── 🏥 Hospital Services
        └── 🤰 IVF Center Services
```

---

## 📜 Credential Type Matrix

### Identity & KYC
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `KYC_TIER_1` | AgenticDID | Shopping (< $100) |
| `KYC_TIER_2` | AgenticDID | Banking, Healthcare, Travel |
| `KYC_TIER_3` | Bank | Unlimited transfers, Voting |

### Financial
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `FINANCIAL_ACCOUNT` | Bank | Bank Agent operations |
| `BANK_ACCOUNT_VERIFIED` | Bank | Large transactions |
| `CREDIT_SCORE` | Bank | Loan applications |

### E-Commerce
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `PURCHASE_HISTORY` | Amazon | Product recommendations |
| `PRIME_MEMBERSHIP` | Amazon | Prime benefits |

### Travel
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `FLIGHT_BOOKING` | Airline | Check-in, boarding |
| `FREQUENT_FLYER_STATUS` | Airline | Upgrades, lounges |

### Government & Voting
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `VOTER_ELIGIBILITY` | Ecuador Voting Dept | Voting Agent |
| `CITIZENSHIP_VERIFIED` | Ecuador Voting Dept | Legal identity |

### Healthcare (Primary Care)
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `PRESCRIPTION` | Doctor's Office | Pharmacy fulfillment |
| `PHYSICAL_EXAM` | Doctor's Office | Health screenings |
| `REFERRAL` | Doctor's Office | Specialist appointments |

### Healthcare (Stanford)
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `MEDICAL_RECORD` | Stanford | Medical Agent access |
| `SURGERY_RECORD` | Stanford | Surgical history |
| `LAB_RESULT` | Stanford | Test results |
| `VACCINATION_RECORD` | Stanford | Travel requirements |

### Education (Stanford)
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `DEGREE` | Stanford | Employment verification |
| `EDUCATIONAL_DEGREE` | Stanford | Academic credentials |
| `CERTIFICATION` | Stanford | Professional certifications |

### Fertility (Stanford IVF)
| Credential | Issuers | Required For |
|-----------|---------|--------------|
| `FERTILITY_TREATMENT` | Stanford | Treatment tracking |
| `IVF_CYCLE` | Stanford | Cycle management |
| `EMBRYO_STORAGE` | Stanford | Storage access |
| `PREGNANCY_TEST` | Stanford | Pregnancy confirmation |

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] trusted_issuer_0 config
- [x] Comet (canonical_agent_101) active
- [x] All issuers defined (inactive)
- [x] All agents defined (inactive)
- [x] Complete credential type enum
- [x] Registry infrastructure
- [x] Three-axis issuer model
- [x] Stanford multi-domain issuer

### Phase 2: Canonical Flow 🔨 IN PROGRESS
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

### Phase 3: Replication ⏳ FUTURE
Following TD Bank philosophy - copy agent_0 pattern:

1. **Bank Ecosystem**
2. **E-Commerce Ecosystem**
3. **Travel Ecosystem**
4. **Government Ecosystem**
5. **Primary Care Ecosystem**
6. **Stanford Multi-Domain Ecosystem** (most complex)

---

## 💡 Key Insights

### Why Stanford Is Special

Before consolidation:
- ❌ Separate Hospital issuer
- ❌ Separate IVF Center issuer
- ❌ Separate Education issuer
- = 3 issuers, 3 agents, complex coordination

After consolidation with three-axis model:
- ✅ ONE Stanford issuer with 3 domains
- ✅ ONE Stanford agent with 4 service areas
- = Clean, composable, realistic

### Three-Axis Model Benefits

```typescript
// ❌ Old way: Category explosion
HOSPITAL_INSTITUTION
IVF_CENTER_INSTITUTION
EDUCATIONAL_INSTITUTION
EDUCATIONAL_MEDICAL_INSTITUTION  // ← Stanford?

// ✅ New way: Composable axes
{
  issuerType: INSTITUTION,
  domains: [EDUCATION, RESEARCH, MEDICAL],
  assuranceLevel: REGULATED_ENTITY,
}
```

**One model, infinite combinations, zero category explosion.**

---

## 📁 File Structure

```
protocol/
  issuers/
    ├── trusted-issuer-0.ts        ✅ ACTIVE
    ├── bank-issuer.ts             ❌ OFF
    ├── amazon-issuer.ts           ❌ OFF
    ├── airline-issuer.ts          ❌ OFF
    ├── ecuadorian-voting-issuer.ts❌ OFF
    ├── doctors-office-issuer.ts   ❌ OFF
    ├── stanford-issuer.ts         ❌ OFF (multi-domain)
    └── index.ts                   (exports all)
  
  agents/
    ├── registered-agents.ts       (all agent configs)
    └── index.ts                   (exports all)
```

---

## 🎯 TD Bank Philosophy Applied

> **"We don't want to make a million checks perfectly.  
> We want to make ONE check perfectly and copy that process."**

**Applied to AgenticDID:**

1. ✅ **Define ALL issuers and agents upfront** - DONE
2. 🔜 **Build ONE perfect flow** - agent_0 + trusted_issuer_0 (NEXT)
3. ⏳ **Test with ONE real user** - John's KYC journey
4. ⏳ **Replicate for all others** - Copy agent_0 pattern

**Result:**
- 7 issuers defined (1 active, 6 ready)
- 8 agents defined (1 active, 7 ready)
- Clear implementation path
- Stanford demonstrates multi-domain power
- No guesswork when scaling

---

**Status**: Registry complete with Stanford consolidation ✨  
**Next**: Build agent_0 (AgenticDID Issuer Agent) 🚀
