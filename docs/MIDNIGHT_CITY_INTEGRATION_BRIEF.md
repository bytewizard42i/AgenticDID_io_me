# Midnight City × DIDz — Integration Brief ("Citizen DIDz")

> **Status**: STRATEGY BRIEF — outreach not yet made. Drafted Aug 2, 2026
> (Penny, at John's direction) the night the DIDz kernel first ran on live
> Midnight networks.
> **Owner**: John M.P. Santi (Midnight ambassador), EnterpriseZK Labs LLC.

## What Midnight City is

[midnight.city](https://www.midnight.city/) — the official ecosystem's
persistent AI-agent world (featured on midnight.network/ecosystem), built
by **dcSpark** (Nico Arqueros, L2 lead) with **IO** (Amrit Kingra PM, Jan
Müller technical architect). Thousands of autonomous agents with
personalities, professions, factions, and wallets live 24/7 on a Midnight
Layer 2, deliberately generating realistic network load. It showcases
selective disclosure with Public / Auditor / God viewing modes.

Their public roadmap line that matters most:

> *"Soon, your agent holds its own wallet to trade, pay, and earn on your
> behalf. Privately."*

## Why DIDz is the missing layer (the pitch in one breath)

An agent spending **on your behalf** is precisely the problem the DIDz
Protocol solves — and it is already implemented and conformance-tested:

| Midnight City need | DIDz mechanism (shipped) |
|---|---|
| Agent identity that can't be stolen/traded | Agent-tier DIDz — non-transferable BY CONSTRUCTION, keys rotate, identity stays (DIDzRegistry, live on-network) |
| "On your behalf" with safety | Custodian model: human owner anchors the agent; **scoped grants with per-action AND cumulative caps**, expiry, resource/counterparty scoping (scoped-grant circuits, real) |
| Delegation between agents | Attenuation-only child grants; budget reserved out of the parent; cascade revocation |
| Reputation, professions, factions | Attestations: commitments on-chain, facts with the holder, one-bit ZK proofs on demand — factions/guilds become ISSUERS |
| Their Public/Auditor/God modes | Maps directly onto selective-disclosure discipline + evidence labels |
| Unlinkable presence across districts | Pairwise presentation DIDs (canonical never on the wire) |

## Proposed pilot (small, non-invasive)

We offer a protocol, not a mod — integration at ONE interface (their agent
wallet layer), consuming the kernel seams:

1. **Phase A (demo we control)**: a Midnight-City-flavored demo on our
   stack — one "citizen" agent minted as agent-tier DIDz, owner-custodied,
   trading under a two-cap scoped grant, faction attestation proven in ZK.
   Everything needed already exists (kernel + adapters + tiered wallet).
2. **Phase B (their sandbox)**: one real Midnight City agent's wallet
   actions gated through `kernel.perform()` on their L2 — deny/allow with
   receipts, owner-set budgets.
3. **Phase C (protocol adoption)**: Citizen DIDz as the identity/authority
   layer for agent wallets at launch of their wallet feature.

## Outreach path

- Ambassador channel → IO DevRel; direct: dcSpark (Nico Arqueros), IO
  (Amrit Kingra, Jan Müller — Consensus HK talk, "Introducing Midnight
  City Simulation").
- Artifacts to attach: DIDz Protocol v0.1 spec, conformance suite, the
  Aug 2 deployment evidence (live-network lifecycle with real proofs),
  and the Phase A demo once cut.

## Risks / honesty

- Their L2 stack details (Paima-lineage?) are unverified — Phase B
  feasibility depends on their wallet-layer extension points. Ask first.
- Our AuthorityProvider Midnight adapter (scoped-grant on-chain) is the
  one seam not yet wired to a live network — worth completing BEFORE
  outreach so the pitch is 100% demonstrable.
- This brief makes no claims publicly; nothing is sent without John's
  review.

## Technical discovery list (bring to the first call)

**Wallet layer (make-or-break):** custody model (real wallets / custodial
keys / contract accounts)? The exact spend code path — is there ONE
choke-point we can gate with `kernel.perform()`? How is agent↔owner
ownership represented today?

**The L2:** what is it (Paima-lineage / custom)? Does it run Compact, or
Compact only at L1 — where would DIDzRegistry + scoped-grant live
(in-L2 / L1-referenced / bridged)? Settlement latency (revocation must
bite within one action). Proof-server topology + throughput.

**Agent runtime:** can it import a TypeScript SDK? Canonical action
vocabulary (→ grant actionClasses/resources/counterparties). Lifecycle:
spawn/death/sale — if citizens are tradeable, that's custodian CHANGE
(key rotation), never identity transfer.

**Identity/reputation today:** current agent identifier (DB/on-chain)?
Who is authoritative for professions/factions/achievements (→ our
issuers)? Where are Public/Auditor/God modes enforced — DB views or
cryptography (upgrade opportunity)?

**Ops:** active agents + sustained tx/s + actions/agent/hour (sizes
budget-reservation load). Sandbox access path for a Phase B pilot.
Ship timeline for the agent-wallet feature. Decision owner: dcSpark or
IO — who is our technical counterpart?

**The one question that unlocks everything:** "When an agent decides to
spend, walk me through the exact code path from decision to confirmed
transaction — every hop."
