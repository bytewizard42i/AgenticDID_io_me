# Masumi × AgenticDID — Integration Architecture v0.1

> **Status**: DESIGN (no outreach, no code yet). Drafted Aug 2, 2026,
> John + Penny, building on `DIDzMonolith-docs/SYNERGY_ANALYSIS_SPLUNK_MASUMI_CLOUDRUN.md`
> (the ★★★★★ "crown jewel synergy") and the LIFECYCLE_PHASES standard.
> **Stage discipline**: DemoLand → TestWired (Masumi preprod + Midnight
> localnet/preprod) → RealDeal, per BUILD_STAGES.md.

---

## ADR-1 (RULING): AgenticDID owns BOTH agent paths

**Decision (John, Aug 2 2026):** AgenticDID is the single pillar of
record for agent identity and authority for BOTH paths:

- **Personal agents** — custodied by a human's DIDz (Rosa's shopper);
- **Service agents** — custodied by an organization's DIDz ("the Amazon
  agent", a trusted issuer's intake agent, SentinelAI-as-a-service).

**Rationale:** one tier, one leash, one threat model. Splitting the paths
into separate systems would fork the delegation semantics (two cap
models, two revocation stories) and reintroduce the exact ambiguity the
kernel exists to kill. The paths differ ONLY in who the custodian is and,
typically, the scale of the grants.

**Consequences:**
1. Agent creation stays PERMISSIONLESS on both paths. Trusted-issuer
   approval gates ATTESTING (capability endorsements, KYC-of-agents),
   never agent existence.
2. Every integration below works identically for both paths; where a
   marketplace rule differs (e.g. only service agents may SELL), that is
   a Masumi-side listing policy, not an identity-layer distinction.
3. Anything documenting agents anywhere in DIDzM must name both paths
   (already enforced in LIFECYCLE_PHASES.md, the protocol spec §4.1, the
   wallet tier catalog, and this repo's README).

---

## 1. Division of labor (who owns what)

| Concern | Owner | Chain |
|---|---|---|
| Agent identity (permanent, non-transferable) | **AgenticDID / DIDzRegistry** | Midnight |
| Bounded authority (two-cap grants, delegation, revocation) | **scoped-grant v2** via the kernel Authority seam | Midnight |
| Proof of authority (one-bit, ZK) | `assert_authorized` circuit | Midnight |
| Capability/reputation ATTESTATIONS (issuer-signed) | DIDzRegistry attestations + TrustedIssuerRegistry | Midnight |
| Agent discovery / marketplace listing | **Masumi Registry / Sokosumi** | Cardano |
| Payments: escrow, settlement, micropay, staking | **Masumi Payment Service** | Cardano |
| Longitudinal trust score | Masumi (augmented by our attestations) | Cardano |

The seam is clean: **Midnight answers "who is this agent and what may it
do"; Masumi answers "how does it get discovered and paid."** Neither
system needs to absorb the other's job.

## 2. The binding: how a Masumi listing proves it IS our agent

John's issuer-hash ruling, extended to agents:

```
didzAgentBinding = sha256(canonical DIDz agent record:
                          agentDid ‖ custodianDid ‖ keyEpoch ‖ profileCommit)
```

- The Masumi Registry entry for an agent carries `didzAgentBinding` (and
  the Midnight network id + registry address it's checkable against).
- Anyone — buyer, marketplace, auditor — recomputes the binding from
  Midnight public state and compares. **Wrong hash → auto-reject + flag**,
  exactly like impostor issuers at the admission gate.
- Key rotation bumps `keyEpoch` → binding changes → the Masumi entry
  must be re-attested by the custodian. A stolen listing goes stale the
  moment the real custodian rotates.

## 3. The flows

### 3a. Issuing a SERVICE agent (org side — e.g. "the Amazon agent")

```
Org DIDz (optionally an ADMITTED trusted issuer)
  1. mints agent-tier DIDz, custodian = org           [DIDzRegistry]
  2. issues scoped grant(s) to the agent               [scoped-grant]
     e.g. sell:fulfillment, refund ≤ $500/action, $50k lifetime, 90 days
  3. (optional) trusted issuers ATTEST capabilities    [attest_to_did]
     e.g. CAPABILITY:drug-interaction-modeling, SOC2_AUDITED
  4. registers on Masumi with didzAgentBinding         [Masumi Registry]
  5. lists services on Sokosumi; payments via Masumi escrow
```

### 3b. Issuing a PERSONAL agent (human side — the buyer)

```
Human DIDz
  1. mints agent-tier DIDz, custodian = human          [DIDzRegistry]
  2. issues scoped grant: hire-agent ≤ $X/action,
     $Y lifetime, marketplace:masumi:* only            [scoped-grant]
  3. agent browses Sokosumi, verifies sellers' didzAgentBindings
  4. HIRE = kernel.perform({actionClass:'hire-agent',
        resource:'masumi:agent:<id>', amount})
     → allowed + budget RESERVED                        [kernel gate]
  5. Masumi escrow funded for exactly the reserved amount
  6. work delivered → kernel.settle(actual)
     → authorize_and_spend on Midnight                 [scoped-grant]
     → escrow released on Cardano                      [Masumi]
     Receipt pair: kernel Receipt ⇄ Masumi payment id, mutually referencing.
```

**The economic invariant:** Masumi escrow amounts are always ≤ the
kernel-reserved budget. An agent can never commit money on Cardano that
its leash on Midnight didn't first reserve. Sub-agent hiring (agent hires
agent) maps 1:1 onto delegation: the child's escrow ceiling IS the
delegated cumulative cap, already reserved out of the parent on-chain.

### 3c. Revocation mid-job

Custodian revokes the grant on Midnight → cascade kills the delegation
subtree instantly → any UNSETTLED kernel reservations are voided →
integration rule: Masumi escrows referencing voided reservations resolve
per marketplace policy (refund buyer / arbitrate), and the agent's
listing shows authority-revoked on next binding check. Design principle:
**Midnight is the kill switch; Masumi honors it at settlement
boundaries.**

## 4. Privacy model

- Masumi sees **pairwise presentation DIDs** per counterparty context,
  never the canonical DIDz — listings by the same custodian are
  unlinkable unless the custodian chooses otherwise.
- "Prove authority without revealing the human": `assert_authorized` —
  the buyer's agent proves it may spend $X on this hire; the seller
  learns one bit, not who funds the buyer.
- Capability attestations verify against TrustedIssuerRegistry without
  exposing attestation contents (commitment + one-bit prove).
- This is the concrete differentiator vs Masumi's current did:key/did:web
  entries: identity with PRIVATE provenance and PUBLIC verifiability.

## 5. Cross-chain trust levels (build in this order)

1. **L1 — Off-chain verification (TestWired-ready now):** Masumi entry
   carries the binding; verifiers read Midnight's indexer directly. No
   protocol changes on either side.
2. **L2 — Mirrored commitment:** the binding hash also anchored in a
   Cardano datum (the cNIGHT-observation pattern, reversed). Both chains
   hold the same 32 bytes; either can detect a mismatch.
3. **L3 — Proof relay (future):** Midnight's BLS-pairable proofs verified
   Cardano-side, making authority checks native to Masumi contracts.

## 6. Threat model (what this design kills)

| Attack | Defense |
|---|---|
| Impostor agent listing ("fake Amazon agent") | didzAgentBinding mismatch → auto-reject + flag (ruling ADR above) |
| Runaway spend by hired/hiring agent | two-cap grants + reserve-before-escrow invariant |
| Stolen agent key | custodian rotates → epoch bump → all listings stale until re-attested |
| Fan-out over-commitment via sub-agents | on-chain budget reservation at delegation |
| Fake capability claims | capabilities are ISSUER attestations, verifiable against the TrustedIssuerRegistry (and issuers passed the admission gate) |
| Marketplace-wide correlation of a custodian's agents | pairwise presentation DIDs |

## 7. Build sequence (when we pick this up)

1. `didzAgentBinding` derivation + verifier (pure functions, TestTown-testable) — small
2. DemoLand: mock Masumi registry/escrow in TestTown style (a `masumi-sim` fixture with honest labels) + the 3a/3b flows through the kernel — medium
3. TestWired: Masumi preprod (their payment service + registry APIs) × our localnet/preprod circuits — medium, needs Masumi API keys
4. Outreach to Masumi/Serviceplan with the working demo (same playbook as the Midnight City brief: demonstrable claims only)

## Open questions (for the Masumi discovery call, someday)

- Registry entry extensibility: can entries carry a custom binding field
  today, or does this need a Masumi-side proposal (MIP-003 adjacency)?
- Escrow hooks: can escrow release be conditioned on an external
  attestation/receipt id (our kernel receipt)?
- Their appetite for privacy-preserving DIDs as a listed differentiator
  (the July analysis says no other identity system on Masumi offers it).
