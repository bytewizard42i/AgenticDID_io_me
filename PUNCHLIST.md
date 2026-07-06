# AgenticDID — Punch List

> Created: July 5, 2026 (Penny session)
> Last updated: July 5, 2026 evening — all items complete

## Demo (hackathon-era, needs rebuild)
- [x] Docker demo still reflects OLD monolithic registry architecture — new standalone demoLand (frontend-demoland/) shows three-pillar model on port 3014; Docker demo marked stale in docs
- [x] Demo doesn't show engine integration (scoped-grant v2, POL credential) — new demoLand shows two machines, scoped-grant lifecycle, ZK proof simulation, constitution alignment
- [x] Demo UI needs 2026 modernization (glassmorphism, 3D tilt, haptics, tooltips) — new demoLand has all 2026 design elements
- [x] Demo runs on port 3014 (standalone demoLand); Docker demo on 5173/8787/6300 marked stale

## Engine integration (complete per DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md)
- [x] Complete identity → DIDz root migration — old AgenticDIDRegistry archived, README points to DIDzRegistry.compact
- [x] Complete authority → scoped-grant v2 migration — README points to midnight-modules/scoped-grant v2
- [x] Update CredentialVerifier + ProofStorage to work with new engine modules — both compile clean (6 + 10 circuits); standalone audit slices, cross-contract calls pending Midnight runtime support
- [x] Verify all contracts compile on `compactc 0.31.1` — CredentialVerifier (6 circuits) + ProofStorage (10 circuits) both clean

## Architecture
- [x] Constitution drafted — DIDZ_CONSTITUTION.md with Appendix A (AgenticDID rules: two machines, attenuation-only, agent-specific violations)
- [x] Cross-pollination docs — `docs/ENGINE_REFERENCE.md` created

## House convention docs
- [x] `docs/DEMOLAND_VS_REALDEAL.md` — created
- [x] `docs/DIF_RELEVANCE.md` — already existed

## Cleanup
- [x] `AgenticDID_io_me.zip` (63MB) — untracked from git, added *.zip to .gitignore
- [x] `didz-agenticdid-full-architecture.md:Zone.Identifier` — removed (already in .gitignore)

## Phase A2 — Intent Compiler (complete)
- [x] Intent compiler module — midnight-modules/modules/intent-compiler/ (NL → scoped grant with attenuation, scope/amount/expiry/counterparty extraction)
- [x] Intent compiler wired into demoLand UI — NL input box with example buttons, compiles to grant request in real-time

## Phase A3 — DIF Presentation Exchange (complete)
- [x] Presentation exchange module — midnight-modules/modules/presentation-exchange/ (DIF PEX envelope, single-bit proof of authority, 8 tests pass)

## Structural tests (complete)
- [x] All 6 engine modules tested — midnight-modules/tests/engine-modules.test.cjs (24 tests, all pass)
