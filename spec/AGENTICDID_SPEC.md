# AgenticDID: Privacy-Preserving Delegated Authority for Autonomous Agents

**Draft Specification — v0.1 (skeleton)**

- **Author**: John Santi
- **Status**: DRAFT — pre-submission skeleton, intended for proposal to the
  Decentralized Identity Foundation (DIF) Trusted AI Agents Working Group as a
  privacy-preserving delegation profile of the agentic identity stack.
- **Created**: July 4, 2026
- **Reference implementation**: `midnight-modules/modules/scoped-grant/`
  (Midnight/Compact), plus supporting modules (`access-control`,
  `commitment-nullifier`, `merkle-membership`, `recovery-core`).

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHOULD", "SHOULD NOT",
"RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as
described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## 1. Abstract

AgenticDID defines a protocol by which a **principal** (a human or
organization) delegates bounded authority to an autonomous **agent**, agents
attenuate and re-delegate that authority to **sub-agents**, and any
**verifier** can confirm an agent's authority with a zero-knowledge proof that
reveals a single bit — *authorized for this scope and amount, unexpired,
unrevoked* — and nothing else. Not the principal's identity. Not the
delegation chain. Not sibling grants.

Existing agentic identity work (DIF KYA-OS, OAuth-derived flows) defines
*what* must be verifiable about an agent. AgenticDID defines *how to make it
verifiable without surveillance* — closing the privacy gap in delegated
authority.

## 2. Motivation

Covered at length in DIF TAAWG's own Delegated Authority Reports: OAuth-style
impersonation breaks for agents (prompt fatigue, missing attribution,
ephemeral lifecycles, no delegation chains). AgenticDID adds the requirement
those reports leave open: **delegation verification MUST NOT require
disclosure of the principal's identity or the delegation topology.**

## 3. Terminology

| Term | Definition |
|---|---|
| **Principal** | The human or organization that is the root source of authority. Identified by a DID; MAY hold verifiable credentials (e.g., proof of personhood, KYC). |
| **Agent** | An autonomous process acting under delegated authority. Identified by a pairwise DID per counterparty context. |
| **Grant** | A scoped, capped, expiring capability issued by a principal to an agent, or attenuated agent-to-agent. The unit of delegated authority. |
| **Attenuation** | Delegation of a child grant whose authority is a strict subset of the parent's (scope ⊆, limit ≤, expiry ≤). |
| **Grant graph** | The tree of grants rooted at a principal. Stored in private state; never disclosed to verifiers. |
| **Proof of authority** | A zero-knowledge proof that a specific agent holds a live grant covering a requested action. |
| **Cascade revocation** | Revocation of a grant invalidating its entire delegation subtree in one action. |
| **Verifier** | Any party (contract, service, merchant) that consumes a proof of authority. |

## 4. Conformance

AgenticDID is designed to compose with DIF KYA-OS conformance levels:

- An AgenticDID implementation satisfies the *verification semantics* of
  KYA-OS **Level 2** (DID verification, credential-based delegation,
  revocation) and provides the audit primitives targeted by **Level 3**.
- This specification is **chain- and proof-system-agnostic**: any system
  providing (a) private contract state and (b) zero-knowledge assertions over
  that state MAY implement it. The normative reference implementation uses
  Midnight/Compact.

### 4.1 Conformance classes

1. **AgenticDID Verifier** — consumes proofs of authority (§8).
2. **AgenticDID Agent** — holds grants, produces proofs, MAY attenuate (§7).
3. **AgenticDID Registry** — maintains the grant graph and revocation state (§6).

## 5. Data model

### 5.1 Grant

A grant MUST contain at minimum:

| Field | Type | Visibility | Description |
|---|---|---|---|
| `grant_id` | 32 bytes | public | Unique identifier |
| `holder` | key commitment | public commitment, private key | Agent bound to this grant |
| `issuer` | key commitment | public commitment, private key | Principal or delegating agent |
| `parent` | grant id / ∅ | public (v1) | Parent grant; absent for root grants |
| `root` | grant id | public (v1) | Lineage root, for cascade revocation |
| `scope` | 32-byte hash | public | Hash of the scope descriptor (§5.2) |
| `limit` | uint | public | Numeric cap (e.g., spend ceiling) |
| `expiry` | uint | public | Expiry epoch |

> **NOTE (roadmap)**: fields marked "public (v1)" — the grant-graph topology —
> SHALL move behind commitments with nullifier-based revocation checks in v2,
> so that even the shape of the graph is unlinkable.

### 5.2 Scope descriptors

Scopes MUST be canonical strings hashed on-chain (e.g.
`H("purchase:groceries")`). Registries of scope vocabularies SHOULD align
with DIF Credential Schemas work.

### 5.3 Identifiers

- Agents SHOULD use pairwise DIDs per counterparty, aligned with `did:peer`
  semantics, to prevent cross-context correlation.
- Principals MAY be anchored by any DID method; the reference deployment uses
  DIDz on Midnight.

## 6. Grant lifecycle (Registry operations)

1. **Issue** — a principal creates a root grant. The registry MUST reject
   duplicate grant ids and MUST record the issuer as a key commitment.
2. **Attenuate** — a grant holder issues a child grant. The registry MUST
   enforce: caller proves holdership of the parent in zero knowledge; child
   `limit` ≤ parent `limit`; child `expiry` ≤ parent `expiry`; parent is live.
3. **Revoke** — the issuer of a grant revokes it. Revoking a root grant MUST
   invalidate the entire subtree (cascade). Revocation MUST take effect for
   all subsequent proofs of authority.
4. **Expire** — grants past `expiry` MUST fail verification with no issuer
   action required.

## 7. Proof of authority

An agent requesting to perform action `(scope, amount)` MUST produce a proof
that all of the following hold, without revealing the witness values:

1. The agent knows the secret key behind the grant's holder commitment.
2. The grant is live (not revoked; lineage checks per §6.3).
3. `scope` matches the grant's scope.
4. `amount` ≤ the grant's limit.
5. The current epoch < the grant's expiry.

The verifier MUST learn only the boolean outcome (and the public inputs it
supplied: scope and amount).

## 8. Verifier interface

- Verifiers SHOULD consume proofs via a request/response shaped as a
  [DIF Presentation Exchange](https://identity.foundation/presentation-exchange/)
  definition/submission pair, so that standard wallets interoperate.
- On-chain verifiers (contracts) MAY call the registry's `assert_authorized`
  circuit directly, as in the reference implementation.

## 9. Audit and accountability

- Every grant issuance and revocation is a recorded state transition —
  satisfying KYA-OS L3 "immutable auditing" — while proofs of authority
  remain unlinkable to principals.
- Designated auditors MAY be given selective-disclosure access to the grant
  graph (progressive reveal); this is OPTIONAL and out of scope for v0.1.

## 10. Security and privacy considerations (sketch)

- **Unlinkability**: pairwise agent DIDs + hashed scopes prevent verifier
  collusion from reconstructing a principal's agent fleet. v1 leaks grant-graph
  topology (public parent/root pointers); v2 closes this (§5.1 note).
- **Replay**: proofs are bound to a transaction context by the underlying
  proof system; implementations MUST ensure proofs cannot be replayed across
  contexts (context nullifiers).
- **Key compromise**: holder/issuer keys SHOULD be recoverable via m-of-n
  social recovery (`recovery-core`); compromised agents are contained by
  cascade revocation.
- **Clock**: epoch sources MUST be specified per deployment (keeper-driven in
  the reference implementation; block time where available).

## 11. Relationship to other work

| Work | Relationship |
|---|---|
| DIF KYA-OS | AgenticDID is the privacy-preserving delegation profile; conformant at L2/L3 semantics |
| DIF Presentation Exchange | Verifier request/response envelope (§8) |
| did:peer | Pairwise agent identifier semantics (§5.3) |
| DIF Credential Trust Establishment | How verifiers decide which principals'/issuers' credentials to trust |
| W3C VC Data Model | Principal-level credentials (personhood, KYC) |
| Midnight Passport | Custody/onboarding substrate for principal keys in the reference deployment |

## 12. Reference implementation

`midnight-modules/modules/scoped-grant/scoped_grant.compact` — compiled
against Compact compiler 0.31.1. Circuits: `issue_grant`, `delegate`,
`assert_authorized`, `revoke`, `tick`. See the module README for the v1
caveat list, which corresponds to the roadmap notes in this spec.

---

*This is a skeleton for community co-development. Sections 5–10 will be
expanded with normative wire formats, test vectors, and conformance suites
before submission to DIF.*
