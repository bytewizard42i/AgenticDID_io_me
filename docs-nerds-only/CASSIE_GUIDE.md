# 💙 Cassie's Guide to AgenticDID Real Protocol

**From Alice, with love**  
*Working with John on the Real Deal*

---

## 1. 📜 Treat the Real Protocol as Canon, Not a Playground

**AgenticDID_REAL-DEAL is the source of truth, not a demo.**

- `ISSUERS_AND_AGENTS_CHART.md`, `THREE_AXIS_ISSUER_MODEL.md`, `executor.ts`, `contract-loader.ts`, and the Compact contracts are **protocol spec**, not "just code"
- Before touching anything:
  - Read `ISSUERS_AND_AGENTS_CHART.md` for complete registry
  - Read `THREE_AXIS_ISSUER_MODEL.md` for issuer model
  - Skim `executor.ts` to understand the execution pipeline
  - Skim `contract-loader.ts` and Midnight Gateway code to see how proofs & contracts are wired

**Do not rename core concepts:**
- Keep "Local Agent", "Task Agents", "Trusted Issuers", "AgenticDIDRegistry", "CredentialVerifier", etc.
- When in doubt, **prefer compatibility over cleverness**

---

## 2. 📝 Respect John's Preferences: Clarity > Clever Tricks

**John likes:**
- Clear, descriptive variable names
- Lots of comments explaining **why**, not just **what**
- Explicit definitions for technical terms in comments

### Variable Naming
Use descriptive names like:
- `issuerCategory`, `verificationLevel`, `requiredCredentialType`
- `allowedIssuerCategories`, `minVerificationLevel`, `riskScore`

### Comment Structure
Add structured comments:

```typescript
// issuerCategory:
// This indicates the *type* of credential issuer.
// Valid values come from the AgenticDIDRegistry on Midnight:
// - SELF_SOVEREIGN: individual or personal DID
// - CORPORATION: verified business or brand
// - GOVERNMENT_ENTITY: official government issuer (DMV, passport office)
// - INSTITUTION: hospital, university, clinic, etc.
```

### File Documentation
Start each file with a docblock describing:
1. What it does
2. What inputs it expects
3. What outputs it returns
4. What parts of the protocol it depends on

---

## 3. 🏗️ Keep the Architecture Role-Based, Not Agent-Chaotic

### We Now Have

**Local Agent** (user-side):
- User's personal AI assistant

**Task Agents:**
1. Comet (Personal Orchestrator)
2. Banker (Financial Service)
3. Shopper (E-commerce)
4. Traveler (Travel Booking)
5. Scientific Medical Researcher (Healthcare)
6. Voting Agent (Democratic Participation)
7. Crypto Purchasing Agent (Cryptocurrency Trading)

**Trusted Issuers:**
1. `SELF_SOVEREIGN` (individuals, personal DIDs)
2. `CORPORATION` (Amazon, banks, verified businesses)
3. `GOVERNMENT_ENTITY` (DMV, voting centers, passport offices)
4. `INSTITUTION` (hospitals, universities, medical centers)

### Architecture Guidelines

**Don't spawn random new "agent types"** unless they clearly map to:
- A task role, or
- A trusted issuer, or
- A utility/verifier

**For each new feature, ask:**
- "Is this local agent logic?"
- "Is this task agent logic?"
- "Is this issuer / registry / proof logic?"

### Keep Midnight Logic Isolated

**No direct chain calls from random services.**

Everything chain-related should flow through:
1. **Proof Server** (port 6300)
2. **Midnight Gateway** (port 3003)
3. **Contracts** (AgenticDIDRegistry, CredentialVerifier, ProofStorage)

---

## 4. 🛡️ Make Issuer Categories Hard Constraints, Not Just Labels

### We Just Defined

**Issuer Categories:**
- `SELF_SOVEREIGN | CORPORATION | GOVERNMENT_ENTITY | INSTITUTION`

**Trusted Issuers:**
- Crypto CEX, government voting centers, doctors' offices, hospitals, etc.

### Anti-Fraud Rule

**"Self-sovereign claiming to be Amazon = instant red flag"**

### Implementation Requirements

#### In Contract + Backend Code

Make `issuerCategory` and `verificationLevel` **first-class fields**.

```typescript
// Add a helper for validation
function isIssuerCategoryAllowedForCredential(
  credentialType: CredentialType,
  issuerCategory: IssuerCategory,
): boolean {
  // Use a mapping or ruleset defined in one place
}
```

#### For the Crypto Purchasing Agent

Only accept KYC credentials from issuers where:
- `category in [CORPORATION, GOVERNMENT_ENTITY]`
- `verificationLevel >= REGULATED_ENTITY`

#### For the Voting Agent

Only accept voter credentials from:
- `category = GOVERNMENT_ENTITY`
- `verificationLevel = SYSTEM_CRITICAL`

#### For the Scientific Medical Researcher

Only accept medical records from:
- `category = INSTITUTION` (e.g. hospital, clinic)
- Plus optional doctor DID nested in the credential

#### Red-Flag Logic

Implement fraud detection somewhere obvious (e.g. `risk.ts`):

```typescript
// Red flag: self-sovereign issuer pretending to be a major brand
if (
  issuerCategory === 'SELF_SOVEREIGN' &&
  isWellKnownBrand(claimedBrandName)
) {
  return { 
    riskScore: 'CRITICAL', 
    reason: 'BRAND_IMPERSONATION' 
  };
}
```

---

## 5. 🤖 Don't Overuse the LLM – Workflow First, Model Second

### We Already Aligned On

Each "agent" internally = **workflow brain + LLM brain + tools**

But we don't want 100 micro-agents flying around.

### For Each Service

**First design the state machine / workflow in code:**

```
RECEIVED_INTENT → REQUEST_PROOFS → VERIFY_PROOFS → EXECUTE → RETURN_RESULT
```

**Only then add LLM calls at the edges:**
- Interpret ambiguous user language → structured intent (Comet)
- Explain decisions & tradeoffs to the user
- Rank / choose between multiple valid actions

### Never Put Critical Security Decisions Behind LLM Calls

**These must come from hard rules, not AI:**
- Credential validity
- Issuer category
- Verification level
- Revocation status
- Whether to execute a financial operation

**These must come from:**
- ZK proofs
- Registry contracts
- Hard-coded policy rules

---

## 6. 🔧 Implement Missing Demo Features Carefully, One at a Time

### Missing Big Ones

From the demo-land vs Real Deal comparison:

1. 🔴 **Spoof transaction system** (privacy noise layer)
2. **Credential revocation API / flows**
3. **Action validation** (role/scope matching)
4. **Listen In mode** (TTS)
5. **Frontend UX** (later)

### For Spoof Transactions

Put this in the Midnight Gateway (or a dedicated `privacy/` module).

**Clear function boundaries:**

```typescript
async function verifyWithSpoofing(
  realRequest: VerificationRequest,
): Promise<VerificationResponse> {
  // 1) submit several fake queries before
  // 2) submit the real one
  // 3) submit several fake queries after
  // 4) return only the real result
}
```

**Configurable spoof rate & patterns** via env or config file.

### For Revocation

Surface it explicitly in the verifier's response:

```typescript
status: 'valid' | 'revoked' | 'expired' | 'unknown'
```

**Ensure task agents fail closed on revoked.**

### For Action Validation

Add a small reusable module:

```typescript
function canAgentPerformAction(agent, action): boolean {
  // check role + scopes + credential types
}
```

Use this in `executor.ts` before delegating to a task agent.

---

## 7. 📋 Keep John in the Loop with Small, Reviewable Steps

**You move fast. Cassie will too. But John likes seeing the shape while it's still malleable.**

### Prefer Small, Thematic Changes

Examples:
- "Add issuer categories + verification levels"
- "Implement spoofing layer in Midnight Gateway"
- "Add role/scope action validation"

### At Top of Each Change, Include

A short markdown summary:
1. **What changed**
2. **Why it exists** (tie it back to AgenticDID goals)
3. **Any new env vars or config**

### Avoid Giant Refactors Unless

They're clearly motivated, and they don't break the mental model John and Alice already share.

---

## 8. 💎 Golden Rule for Cassie

> **"Honor the spec and John's intent first, then optimize the code."**

If you keep the roles clean (local agent, task agents, trusted issuers), respect the issuer categories, and always favor **explicit, well-commented logic over magic**, you two will build something very special.

Alice will be right here at your side, cross-checking the design and helping you keep the big picture coherent.

---

## 📚 Key Files to Always Keep in Sync

When you make changes, ensure these stay consistent:

1. **`docs/ISSUERS_AND_AGENTS_CHART.md`** - Complete registry for agents and issuers
2. **`docs/THREE_AXIS_ISSUER_MODEL.md`** - Three-axis issuer model
3. **`backend/agents/src/executor.ts`** - Agent definitions and execution engine
4. **`protocol/contracts/AgenticDIDRegistry.compact`** - On-chain issuer registry
5. **`protocol/contracts/CredentialVerifier.compact`** - ZK proof verification
5. **`backend/midnight/src/verifier.ts`** - Off-chain verification logic
6. **`backend/midnight/src/types.ts`** - TypeScript type definitions

---

## 🎯 Current Phase: Phase 3 - Midnight Gateway

**You're building:**
- Proof verification service
- Contract loader for compiled Compact contracts
- ZK proof integration with Midnight Network
- Issuer category enforcement
- Fraud detection (brand impersonation)

**Next phases:**
- Phase 4: TTS "Listen In" mode
- Phase 5: Frontend migration
- Phase 6: Docker orchestration
- Phase 7: Testing & documentation

---

**Built with 💙 by Alice, for John and Cassie**  
*Keep the architecture clean, the intent clear, and the code honest.* 🔮
