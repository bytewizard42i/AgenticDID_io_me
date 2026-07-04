# AgenticDID → DIF Standardization Plan

> **Goal**: Get AgenticDID adopted as a DIF work item — ideally as the
> **privacy-preserving delegation profile** of the agentic identity stack —
> with John Santi on record as the author, before the KYA-OS v1.x window closes.
>
> **Strategy in one line** (per Patrick Tobler's advice): *build the protocol
> first, prove it with running code, then propose it — DIF ratifies facts on
> the ground, it does not adopt ideas on paper.*
>
> **Created**: July 4, 2026 · **Owner**: John Santi · **Status**: In motion

---

## 1. Why now (the timing window)

- **KYA-OS** (Know Your Agent Operating System, donated to DIF by Vouched in
  March 2026, renamed June 2026) has cut a **v1** that is moving through
  working-group approval inside DIF's **Trusted AI Agents Working Group (TAAWG)**.
- KYA-OS defines *what* must be verifiable about an agent (identity, scoped
  delegation, revocation, audit) but **not how to do it privacy-preserving**.
  That slot is empty.
- v1.x / v2 gaps are being identified **right now**. Privacy is the most
  obvious gap, and nobody in TAAWG has zero-knowledge proofs of delegated
  authority over private state. We do (Midnight).
- Waiting = someone fills the slot with a weaker design and we retrofit forever.

## 2. What we walk in with (the three artifacts)

DIF adopts artifacts, not ideas. The proposal package is:

| # | Artifact | Where it lives | Status |
|---|---|---|---|
| 1 | **Reference implementation** — `scoped-grant` Compact module (grant graph, attenuated delegation, cascade revocation) + the seven supporting modules | `midnight-modules/modules/scoped-grant/` | building |
| 2 | **Protocol specification** — normative spec (MUST/SHOULD language, KYA-OS-native vocabulary) | `AgenticDID/spec/AGENTICDID_SPEC.md` | drafting |
| 3 | **Killer demo** — agent completes a task with a ZK proof that "a verified human authorized me, in scope, unexpired" while revealing nothing about the human | script in §5 below | scripted |

## 3. Positioning: conform at the interface, differentiate underneath

- **Interface**: AgenticDID speaks DIDs + VCs, represents delegation as
  scoped tamper-evident credentials, and targets **KYA-OS Level 2/3
  conformance semantics** (full DID verification, credential-based delegation,
  revocation, immutable audit). Any KYA-OS-aware platform can plug in day one.
- **Underneath (the moat)**: Midnight private state — the grant graph is
  shielded; verifiers learn a **binary answer** ("authorized, in scope,
  unexpired"), never the principal's identity, the delegation chain, or
  sibling grants. Cross-context unlinkability via pairwise agent DIDs and
  context nullifiers.
- **Framing to DIF**: not a competing standard — the **ZK delegation profile**
  of the agentic stack. Every privacy-conscious implementation of KYA-OS
  flows through this design.

## 4. The sequence

1. ✅ **DIF deep dive** — landscape mapped (see `monolith-docs/DIF_KNOWLEDGE_BASE.md` §5a).
2. 🔨 **Build the first slice** — `scoped-grant` module, compiled against the
   real toolchain (compact CLI 0.5.x / compiler 0.31.x), in `midnight-modules`.
3. 🔨 **Write the spec** — skeleton first, normative language, KYA-OS
   vocabulary (principal, agent, grant, attenuation, revocation, audit).
4. ⏭ **Wire the demo** — compose scoped-grant + access-control +
   commitment-nullifier into a demoable flow; record it.
5. ⏭ **Adoption pressure** — AgenticDID live in DIDz + SmartCart's Alist
   (+ external pilot if possible) before proposing. Protocols with users get
   standardized; protocols on paper get discussed.
6. ⏭ **Join DIF** — individual contributor or organizational tier. Puts the
   contribution under DIF IPR protection (which also protects John from
   someone else patenting his own design). Note: IOHK is already a member —
   John's Midnight-ambassador relationship is a warm path.
7. ⏭ **Lurk TAAWG first** — Monday Delegated Authority calls (7:00 PST),
   Tuesday KYA-OS task force (7:00 PST), Slack `#wg-trusted-ai-agents`.
   Learn the room's vocabulary and politics before proposing.
8. ⏭ **Propose the work item** — spec + code + demo video in hand. Two routes:
   - **Own task force** (the Vouched outcome — highest ceiling), or
   - **ZK delegation profile of KYA-OS** (lowest friction, still puts every
     ZK implementation through our design).
9. ⏭ **Keep the name** — donated work keeps attribution. "AgenticDID,
   contributed by John Santi" stays in the record, the way KYA-OS press still
   credits Vouched everywhere.

## 5. Demo script (the artifact nobody else can replicate)

**Title**: *"Prove the mandate, not the man."*

1. **Setup (off-camera)**: Alice holds a KYCz-style credential binding her to
   a DIDz. She creates an agent ("Alist") with a pairwise agent DID and issues
   it a **scoped grant**: `purchase ≤ $50, groceries only, expires in 24h`.
2. **Act 1 — the purchase**: Alist approaches a merchant contract and presents
   a ZK proof: *a verified human principal granted me this exact authority; it
   is in scope and unexpired.* The merchant contract verifies on-chain and
   accepts. **The merchant never learns who Alice is.**
3. **Act 2 — attenuation**: Alist spawns a sub-agent with a narrower grant
   (`≤ $10`). Sub-agent transacts. Chain of authority verifies; still zero
   knowledge of Alice.
4. **Act 3 — revocation**: Alice revokes the root grant. Both agents'
   next proofs fail instantly (cascade revocation). One action, whole subtree dead.
5. **Closer**: side-by-side with OAuth — "OAuth would have shown you Alice's
   token everywhere and revoked nothing cleanly. This is delegated authority
   done right."

## 6. DIF work-item proposal outline (to be finalized at step 8)

1. Problem statement: privacy hole in agentic delegation (cite TAAWG's own
   Delegated Authority Reports — prompt fatigue, missing attribution,
   ephemeral lifecycles).
2. Proposed work item: AgenticDID — privacy-preserving delegation profile.
3. Relationship to existing work: complements KYA-OS L2/L3; consumes DIDs,
   VCs, Presentation Exchange; aligns with did:peer for pairwise DIDs.
4. Deliverables: spec, reference implementation, test vectors, conformance notes.
5. Evidence: demo video + live deployments.
6. IPR: contributed under DIF's IPR policy, attribution retained.

## 7. Risks and honest caveats

- **Standards leadership = attendance.** If we ship the proposal and vanish,
  the WG reshapes it without us. Budget ongoing presence (even 1 hr/week).
- **Midnight dependency**: DIF specs must be chain-agnostic in principle. The
  spec should define the *interface* abstractly (any ZK system with private
  state can implement) with Midnight as the reference implementation, not a
  requirement.
- **KYA-OS may add its own privacy story** in v1.x. Mitigation: move fast,
  be in the room, make ours the obvious one to adopt.

---

*Related docs: `AgenticDID/spec/AGENTICDID_SPEC.md` (the spec),
`AgenticDID/docs/DIF_RELEVANCE.md` (pointer),
`monolith-docs/DIF_KNOWLEDGE_BASE.md` (canonical DIF landscape),
`midnight-modules/docs/MODULES_CATALOG.md` (implementation modules).*
