# What we need from Patrick Tobler — Masumi × AgenticDID

> **Status**: OUTREACH PREP (nothing sent). Drafted Aug 3, 2026 (Opus, at
> John's request). Companion to `MASUMI_INTEGRATION_ARCHITECTURE.md`.
> **Rule**: nothing goes to Patrick until our side is demonstrable — the
> `didzAgentBinding` verifier + a DemoLand `masumi-sim` flow — same
> demonstrable-claims-only discipline as the Midnight City brief.

## Who Patrick is (so the ask is aimed right)

- **Patrick Tobler** — Founder & CEO of **NMKR** (largest minting platform
  on Cardano), co-founder of **Masumi Network** (with Serviceplan Group,
  launched Nov 2024), CEO of **utxo AG**. Zurich. Contact he lists
  publicly: `patrick (at) nmkr (dot) io`, X `@padierfind`.
- He owns the payment + registry rails. He is the RIGHT single person to
  bless a protocol-level integration, but he is a founder — respect his
  time: lead with a working demo and a narrow ask, not a whitepaper.
- **Framing that disarms** (he is building agent identity too — via
  NFTs): we are NOT a competing identity system. Masumi identity =
  "which agent is this + reputation." DIDz = "who authorized it, to spend
  how much, provably, privately." We make his agents *safe to hand a
  wallet*, we do not replace his registry. Complement, not conquest.

## The relationship asks (business / access — what John needs Patrick to grant)

1. **A 30-minute technical call** with him or whoever owns the Masumi
   registry + payment-service internals (likely an NMKR engineer). One
   call unlocks the whole technical discovery list below.
2. **Testnet/sandbox access**: Masumi on Cardano **preprod** — a test
   registry we can list into and a test escrow we can drive, with keys.
   (Their public materials mention preprod smart contracts; confirm the
   endpoints + how to get funded test agents.)
3. **Registry extensibility blessing**: permission/《path》 to attach a
   `didzAgentBinding` field to a Masumi registry entry — either a
   supported custom-metadata field today, or his openness to a small
   proposal (Masumi's equivalent of a MIP) if it needs a schema change.
4. **Escrow-hook openness**: is he willing to let escrow release be
   conditioned on / cross-referenced to an external receipt id (our
   kernel `Receipt`)? This is the crux of the "escrow ≤ reserved budget"
   invariant. If not natively, what is the nearest supported pattern?
5. **Positioning consent**: willingness to let AgenticDID be listed/known
   as *a* privacy-preserving identity option for Masumi agents (per the
   July synergy analysis: no one else on Masumi offers private-provenance
   DIDs). Not exclusivity — just permission to interoperate publicly.
6. **A warm intro to Serviceplan** if enterprise pilots come up — they
   lead Masumi's enterprise integration and are the demand side for
   "agents you can trust with a corporate card."

## The technical discovery list (facts we need to BUILD — bring to the call)

Grounded in `MASUMI_INTEGRATION_ARCHITECTURE.md`; each answer unblocks a
specific build step.

**Registry (identity/discovery):**
- Agents register "as NFTs" — what exactly is on-chain vs off-chain in a
  registry entry? Is there a **custom-metadata / extra-field** slot we can
  put `didzAgentBinding` (a 32-byte hash + Midnight network id + registry
  address) into TODAY, without a schema change?
- Is the registry entry mutable (for key-rotation re-attestation) and
  who is authorized to update it?
- Registry read API: can any verifier fetch an entry + its custom field
  by agent id, unauthenticated? (We need permissionless verification.)

**Payment / escrow:**
- Escrow lifecycle API: create → fund → release/refund/arbitrate — what
  are the exact calls, and can release be **gated on an external
  condition or reference** (our kernel receipt id)?
- Can we read an escrow's committed amount BEFORE release, to enforce
  escrow ≤ kernel-reserved budget?
- Stablecoin(s) used, and are micropayments / batched settlement exposed
  to integrators or internal only?

**Runtime / SDK:**
- Kodosumi runtime: can an agent's code import a TypeScript SDK (our
  `@didz/kernel-core`) and call `kernel.perform()` in its decision loop,
  or is the runtime sandboxed away from arbitrary deps?
- Sōkosumi marketplace: what is the canonical action vocabulary
  (list / hire / deliver / dispute…)? We map it onto grant
  `actionClasses`/`resources`.

**Identity today:**
- Confirm agents currently use `did:key` / `did:web` (per our July
  analysis) — and whether there is appetite to reference an external DID
  method (`did:didz` / Midnight) as the authority anchor behind the NFT.

**Cross-chain trust (future, L2/L3 in the arch doc):**
- Openness to mirroring the `didzAgentBinding` hash into a Cardano datum
  (so both chains hold the same 32 bytes) — is that a registry change or
  can it ride existing metadata?

## What John does NOT need from Patrick (scope guard)

- No payment integration on OUR side — Masumi IS the payment layer; we
  never touch funds, only prove authority. Say this explicitly; it lowers
  his risk assessment of us.
- No changes to Midnight — the binding is verifiable from Midnight public
  state as-is.
- No exclusivity, no token deal, no funding ask in the first
  conversation. The first ask is a call and sandbox keys. That's it.

## Readiness gate before contacting him (our homework, not his)

1. `didzAgentBinding` derivation + verifier shipped and TestTown-tested.
2. A DemoLand `masumi-sim` fixture (mock registry + mock escrow, honest
   labels) driving flows 3a/3b from the architecture doc end to end.
3. The 90-second demo extended with an agent-hires-agent scene, so the
   call opens with "here it is working" not "here is what we'd build."
