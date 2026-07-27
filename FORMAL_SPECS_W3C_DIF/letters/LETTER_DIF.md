# Draft Letter: AgenticDID Introduction to the DIF Trusted AI Agents Working Group

**To:** Decentralized Identity Foundation — Trusted AI Agents Working Group
**From:** John M.P. Santi, EnterpriseZK Labs LLC
**Date:** July 27, 2026
**Subject:** AgenticDID — a privacy-preserving delegation profile for the agentic identity stack

---

Dear members of the Trusted AI Agents Working Group,

I am writing to propose **AgenticDID**, a specification for
privacy-preserving delegated authority for autonomous agents, as a
candidate work item. It is designed to compose with the working group's
existing KYA-OS conformance levels rather than compete with them.

## The gap we address

The WG's Delegated Authority Reports document why OAuth-style
impersonation breaks for agents: prompt fatigue, missing attribution,
ephemeral lifecycles, and absent delegation chains. Existing work defines
*what* must be verifiable about an agent. AgenticDID defines *how to make
it verifiable without surveillance*:

> Delegation verification MUST NOT require disclosure of the principal's
> identity or the delegation topology.

A verifier learns exactly one bit — *authorized for this scope and
amount, unexpired, unrevoked* — and nothing else. Not the principal's
identity. Not the delegation chain. Not sibling grants.

## What the specification defines

1. **Scoped grants** — capped, expiring capabilities with per-action and
   cumulative spending limits (dual caps, both enforced).
2. **Attenuation-only delegation** — a child grant is always a strict
   subset of its parent (scope ⊆, amount ≤, expiry ≤), with the child's
   cumulative budget reserved out of the parent's.
3. **Cascade revocation** — revoking a grant invalidates its entire
   delegation subtree in one action.
4. **One-bit proofs of authority** — zero-knowledge proofs over private
   grant-graph state; the graph itself is never disclosed.
5. **Pairwise agent DIDs** — per-counterparty identifiers aligned with
   `did:peer` semantics, preventing cross-context correlation.

## Conformance posture

AgenticDID satisfies the verification semantics of KYA-OS **Level 2**
(DID verification, credential-based delegation, revocation) and provides
the immutable-audit primitives targeted by **Level 3** — while keeping
proofs of authority unlinkable to principals. The verifier interface is
shaped as a DIF Presentation Exchange definition/submission pair so that
standard wallets interoperate.

## Evidence

- **Reference implementation**: `scoped-grant` Compact module on Midnight
  (circuits: `issue_grant`, `delegate`, `assert_authorized`,
  `revoke_grant`, `advance_epoch`), compiled with full ZK key generation.
- **Companion specification**: the DIDz Protocol (a chain-agnostic trust
  kernel defining identity/authority/objects/data/enforcement seams, with
  an executable conformance suite). AgenticDID is its authority profile.
- The specification is chain- and proof-system-agnostic; Midnight is the
  normative reference deployment, not a requirement.

## What we are seeking

1. Feedback on the spec's conformance-class structure and KYA-OS mapping.
2. Adoption as a WG work item (Pre-Draft), with John M.P. Santi as
   editor and community co-development invited.
3. Reviewers for the privacy claims — particularly unlinkability across
   verifier collusion and the v1 topology-leakage caveat (public
   parent/root pointers), which v2 closes with committed graphs and
   nullifier-based revocation checks.

**Specification:** `FORMAL_SPECS_W3C_DIF/AGENTICDID_SPEC.md` in the
AgenticDID repository. **License:** Apache 2.0.

Respectfully,

**John M.P. Santi**
EnterpriseZK Labs LLC
Midnight Network Ambassador
