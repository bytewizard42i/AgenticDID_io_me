# AgenticDID — Punch List

> Created: July 5, 2026 (Penny session)
> Status: gaps found during Docker demo spin-up + gap analysis

## Demo (hackathon-era, needs rebuild)
- [ ] Docker demo still reflects OLD monolithic registry architecture — update to four-pillar model
- [ ] Demo doesn't show engine integration (scoped-grant v2, POL credential)
- [ ] Demo UI needs 2026 modernization (glassmorphism, 3D tilt, haptics, tooltips)
- [ ] Demo runs on ports 5173/8787/6300 via Docker Compose

## Engine integration (in progress per DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md)
- [ ] Complete identity → DIDz root migration
- [ ] Complete authority → scoped-grant v2 migration
- [ ] Update CredentialVerifier + ProofStorage to work with new engine modules
- [ ] Verify all contracts compile on `compactc 0.31.1`

## Architecture
- [x] Constitution drafted — DIDZ_CONSTITUTION.md with Appendix A (AgenticDID rules: two machines, attenuation-only, agent-specific violations)
- [x] Cross-pollination docs — `docs/ENGINE_REFERENCE.md` created

## House convention docs
- [x] `docs/DEMOLAND_VS_REALDEAL.md` — created
- [x] `docs/DIF_RELEVANCE.md` — already existed

## Cleanup
- [x] `AgenticDID_io_me.zip` (63MB) — untracked from git, added *.zip to .gitignore
- [x] `didz-agenticdid-full-architecture.md:Zone.Identifier` — removed (already in .gitignore)
