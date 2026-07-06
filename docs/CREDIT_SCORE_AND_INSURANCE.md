# AgenticDID — Credit Score & Insurance Integration

**Date**: July 6, 2026
**Status**: Design
**Related**: `DIDz-io/docs/CREDIT_SCORE.md` (source of truth),
`CryptoSure-me-app/docs/DIDZ_CREDIT_SCORE.md` (canonical spec)

How the **DIDz credit score** interacts with AgenticDID's delegated-authority model, and
how agents buy/manage **CryptoSure** insurance on a principal's behalf.

---

## 1. Score-scaled delegated caps

AgenticDID grants carry two spend properties (per the ecosystem ruling):
`per_action_cap` and `cumulative_cap` (both optional; max-Uint64 = unlimited, 0 = valid
no-spend; delegation reserves child budget from parent).

Add an **insurance dimension** to grants:

- **`maxInsuranceTierByBand`** — the highest CryptoSure tier an agent may purchase,
  expressed relative to the **principal's proven credit-score band**. A higher-score
  principal can authorize an agent to buy up to a higher tier ($5k → $50k); a lower band
  caps the agent lower, regardless of the cash cap.
- At purchase, the agent must present a **ZK proof of the principal's score band**
  (`DIDz.prove_score_at_least`) that satisfies both the tier's minimum score AND the grant's
  `maxInsuranceTierByBand`. The agent learns/reveals only the boolean.
- Cash caps still apply independently: the premium spend must fit `per_action_cap` and
  `cumulative_cap`.

## 2. The non-delegable EDU signature (critical)

CryptoSure high tiers (≥ $5k) require a **holder-signed EDU certification** to activate a
policy (`CryptoSure-me-app/docs/CRYPTOSURE_EDU.md`). This signature is **NOT delegable**:

- An **agent may orchestrate** buying/quoting/managing a policy under its grant.
- An agent **cannot self-satisfy** the EDU acceptance signature. The **principal (human)**
  must produce the holder-signed acceptance proof (control of the principal DIDz + signature
  over the current `scopeHash`).
- Rationale: the EDU signature is the human acknowledging what they're responsible for and
  what the policy does/doesn't cover. Delegating that would defeat the honesty guarantee.

Enforcement: `activatePolicy()` verifies the acceptance proof re-derives from the
**principal's** secret, not the agent's. An agent-only activation for a high tier fails.

## 3. Flow (agent-managed high-tier policy)

```
1. Principal grants agent: {per_action_cap, cumulative_cap, maxInsuranceTierByBand}
2. Agent quotes a $10k policy → proves principal band ≥ T3 threshold (ZK) + fits cash caps
3. Agent buys → PolicyRegistry creates policy PENDING
4. PRINCIPAL (not agent) completes CryptoSure-EDU + signs scope acceptance (ZK proof)
5. activatePolicy() verifies holder-signed proof → policy ACTIVE
6. Agent may later manage renewals within caps; claims payout to the principal
```

## 4. Contract touch-points (design; MCP-validate first)

- Extend the grant struct with `maxInsuranceTierByBand: Uint<8>` (0 = no insurance authority).
- Add a check in the agent's insurance-purchase path: prove principal band + enforce grant
  tier ceiling + enforce cash caps.
- Keep activation's holder-signature check bound to the **principal** DID, never the agent.

## 5. Privacy

- Principal identity and raw score stay private; only band booleans are proven.
- The agent's authority (caps, tier ceiling) is enforced without revealing the principal's
  score value or identity to CryptoSure.
