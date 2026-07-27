# Draft Letter: AgenticDID Introduction to W3C

**To:** W3C Credentials Community Group
**From:** John M.P. Santi, EnterpriseZK Labs LLC
**Date:** July 27, 2026
**Subject:** AgenticDID — privacy-preserving delegated authority for autonomous agents

---

Dear members of the W3C Credentials Community Group,

I am writing to introduce **AgenticDID**, a specification for
privacy-preserving delegated authority for autonomous agents, relevant to
the CCG's work on verifiable credentials, DIDs, and privacy-preserving
presentation.

## The problem

Autonomous agents increasingly act on behalf of humans and organizations.
Today's delegation mechanisms force a choice between accountability and
privacy: either the verifier learns who the principal is (surveillance),
or the delegation cannot be verified at all (unaccountability). AgenticDID
removes the trade-off. A verifier learns exactly one bit — *this agent is
authorized for this scope and amount, unexpired, unrevoked* — proven in
zero knowledge over private delegation state.

## Relationship to W3C work

- **DID Core**: principals may be anchored by any DID method; agents use
  pairwise DIDs per counterparty aligned with `did:peer` semantics.
- **VC Data Model**: principal-level credentials (personhood, KYC) are
  ordinary Verifiable Credentials; AgenticDID adds the delegation layer
  above them.
- **Selective disclosure**: the one-bit proof-of-authority is an extreme
  point on the selective-disclosure spectrum the CCG has long championed
  — disclose the predicate result, nothing else.

## Key mechanisms

Scoped grants with dual spending caps; attenuation-only delegation
(child ⊆ parent, budget-conserving); cascade revocation; zero-knowledge
proofs of authority over a private grant graph. A reference
implementation exists in Compact on the Midnight Network; the
specification itself is chain- and proof-system-agnostic.

## What we are seeking

1. Community review of the delegation model and its privacy claims.
2. Guidance on expressing proof-of-authority requests/responses in
   CCG-aligned formats (VP Request, DIF Presentation Exchange).
3. Interest in incubating the work — noting we are proposing the
   companion DIDz Protocol (a chain-agnostic trust kernel) to the CCG in
   parallel; AgenticDID is its authority profile.

**Specification:** `FORMAL_SPECS_W3C_DIF/AGENTICDID_SPEC.md` in the
AgenticDID repository. **License:** Apache 2.0.

Respectfully,

**John M.P. Santi**
EnterpriseZK Labs LLC
Midnight Network Ambassador
