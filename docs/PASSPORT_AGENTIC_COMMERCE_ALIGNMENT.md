# Passport Agentic-Commerce Alignment

**Source:** Midnight Passport product presentation / whiteboard session (Charles Hoskinson
intro; Karmel product lead; Hector technical demo), 2026-07-04. Full transcript and
distilled takeaways live in the Passport fork at
`midnight-Passport-johns_copy/DIDz-Passport-Collaboration/`.

## Why this matters to AgenticDID

The Passport whiteboard session **validates AgenticDID's core thesis directly**: Midnight
is building agent authorisation with **principal privacy** and **scoped mandates** as a
first-class product concern. What AgenticDID has been designing, Passport now puts on the
Midnight roadmap. That is an opening for AgenticDID to align and contribute.

## What Passport said about agents

- **Agents are personas / first-class citizens**, treated like individual, managed, and
  enterprise users, with defined journeys.
- **Agentic commerce is huge and real:** the **Explorer 2** initiative processed
  **160 million agent payments** in under a year. (Track alongside the emerging
  **AP2 / Agent Payments** direction.)
- **Two missing pieces Passport targets:**
  1. **Principal Privacy**, the agent proves it is **authorised by a real human** and
     operates within a **defined scope** (spending limits, duration), **without publishing
     the human's identity on-chain**.
  2. **Legal Compliance**, agent transactions comply with the legal context.
- **The mandate/pact flow:**
  1. The human signs a **mandate** granting scope (example: a DeFi agent budget of
     **$10,000**).
  2. The agent proves **"I am this human's agent"** privately (no on-chain identity).
  3. Every request is evaluated against the **pact**: **in-scope settles, out-of-scope is
     rejected**.
- **Phishing resistance:** agents verify signatures and cryptographic proofs, so they are
  not fooled by look-alike DApps the way humans (who misread characters) are. **ZK gives
  provability of intention.**
- **Contingent settlement:** transactions can sit **"pending"** until ZK proofs / contract
  signatures satisfy defined criteria, a built-in audit trail.

## Mapping to AgenticDID concepts

| Passport concept | AgenticDID equivalent | Note |
|---|---|---|
| Mandate (signed grant of scope) | Delegation credential / grant | Align our delegation format to a signed mandate |
| Pact evaluation (in-scope settles) | Scope + policy enforcement | Our scope checks become the pact evaluator |
| Principal privacy (agent proves human authorised it, hides identity) | Agent↔principal binding via ZK | Core AgenticDID privacy claim, now Midnight-blessed |
| Spend limit + duration | Scope parameters | Add explicit budget + time-to-live to our scope schema |
| Agent as persona / first-class citizen | Agent DID class | Reinforces our human-vs-agent class distinction |
| Contingent settlement (pending until criteria) | Conditional execution + audit | New pattern to adopt for high-value agent actions |
| Revoke-and-continue | Revocation | We already model revocation; align semantics |

## Concrete action items for AgenticDID

1. **Add budget + duration** to the delegation/scope schema (mirror the mandate's
   spend-limit and time bounds).
2. **Formalise the pact evaluator**, the in-scope/out-of-scope decision, as an explicit,
   ZK-provable check.
3. **Principal-privacy proof:** specify the ZK statement "this agent is authorised by a
   human principal" that reveals no principal identity on-chain.
4. **Adopt contingent settlement** for high-value or regulated agent actions (pending until
   ZK criteria met), giving an audit trail.
5. **Align to Passport's agent persona** so an AgenticDID agent can operate through a
   Passport account (SDK: bridging, account setup, recovery out of the box).
6. **Cross-reference the human/agent distinction** with `onlyHumans` (agent credential
   class is explicitly *not* the human-personhood class).

## Contribution angle

Principal privacy + mandate/pact is a natural candidate for a future **agent-authorisation
MIP**, and complements our recovery (MIP-4) and credentials (MIP-6) contributions. See the
Passport fork's `04_First-PR-to-Passport-Origin-Strategy.md`.

## Contacts

- Karmel ("Carmel"), Passport **product lead**, GitHub `Karmoola`.
- Hector Bulgarini, technical demo, GitHub `hbulgarini`, X `@hectorest06`.

_Last updated: 2026-07-04._
