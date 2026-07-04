# DIF Relevance for AgenticDID

> **Canonical source**: [`/home/js/DIDzMonolith/monolith-docs/DIF_KNOWLEDGE_BASE.md`](/home/js/DIDzMonolith/monolith-docs/DIF_KNOWLEDGE_BASE.md)
>
> This file is a short pointer. The deep content (specs, ecosystem, integration patterns, anti-patterns) lives in the canonical knowledge base. Refresh this file only when AgenticDID's DIF needs materially change.

## Why DIF matters for AgenticDID

The Trusted AI Agents WG (newly active at DIF) is the most strategically important emerging spec for AgenticDID. It defines the interoperable identity, authority, and governance stack for AI agents. AgenticDID can either align with this WG output or risk diverging from the standard the rest of the industry adopts. Joining DIF as a member to participate in the WG is worth serious consideration.

## DIF specs to adopt

- **Trusted AI Agents WG**: Delegated Authority task force (how an agent proves authority granted by a user within a scope until a time) and KYA-OS task force (operational substrate for agent-to-agent trust)
- **DIDComm v2**: agent-to-agent secure messaging
- **Universal Resolver**: AgenticDID resolves DIDs from many issuers, never hand-roll per-method resolvers
- **did:webvh**: lowest-friction self-hosted DID method, useful for agent-owned DIDs
- **Presentation Exchange**: when an agent presents credentials to another agent or service

## Integration patterns from the canonical doc

- Pattern A (Universal Resolver as DID translation layer)
- Pattern B (Presentation Exchange for credential proofs)
- Pattern C (DIDComm v2 for DID-to-DID messaging)

## Concrete next steps

1. Join DIF as a member to participate in the Trusted AI Agents WG. Slack channel: `#wg-trusted-ai-agents`.
2. Audit AgenticDID current agent identity model against the WG Delegated Authority drafts.
3. Run Universal Resolver as a sidecar for the agent runtime.
4. Adopt DIDComm v2 for agent-to-agent messages before locking in a custom protocol.

## New since May (July 4, 2026)

**Strategy flipped from "align with" to "lead."** We are building the protocol
first and proposing it to DIF as the privacy-preserving delegation profile of
the agentic stack (the Vouched/KYA-OS playbook). See:

- **The plan**: [`DIF_STANDARDIZATION_PLAN.md`](./DIF_STANDARDIZATION_PLAN.md)
- **The spec**: [`../spec/AGENTICDID_SPEC.md`](../spec/AGENTICDID_SPEC.md)
- **The reference implementation**: `midnight-modules/modules/scoped-grant/`
  (compiled, Compact 0.31.1)

Context: KYA-OS (Vouched's donated framework, renamed June 2026) has a v1 in
WG approval. It defines *what* must be verifiable about agents but not *how to
do it privacy-preserving* — that slot is empty and AgenticDID fills it.

## Last refreshed

July 4, 2026 (deep dive + standardization plan); previously May 24, 2026.
