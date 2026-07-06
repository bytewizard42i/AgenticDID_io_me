# AgenticDID — Punch List

> Created: July 5, 2026 (Penny session)
> Status: gaps found during Docker demo spin-up + gap analysis

## Demo (hackathon-era, needs rebuild)
- [x] Docker demo still reflects OLD monolithic registry architecture — new standalone demoLand (frontend-demoland/) shows four-pillar model on port 3014; Docker demo marked stale in docs
- [x] Demo doesn't show engine integration (scoped-grant v2, POL credential) — new demoLand shows two machines, scoped-grant lifecycle, ZK proof simulation, constitution alignment
- [x] Demo UI needs 2026 modernization (glassmorphism, 3D tilt, haptics, tooltips) — new demoLand has all 2026 design elements
- [x] Demo runs on port 3014 (standalone demoLand); Docker demo on 5173/8787/6300 marked stale

## Engine integration (in progress per DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md)
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
