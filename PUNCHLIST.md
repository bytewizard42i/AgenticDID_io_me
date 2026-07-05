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
- [ ] Constitution still open — proposed: one DIDz root constitution + AgenticDID appendix
- [ ] Cross-pollination docs not written (pointer docs to engine modules)

## House convention docs (missing)
- [ ] `docs/DEMOLAND_VS_REALDEAL.md`
- [ ] `docs/DIF_RELEVANCE.md`

## Cleanup
- [ ] `AgenticDID_io_me.zip` (63MB) in repo root — should be gitignored or removed
- [ ] `didz-agenticdid-full-architecture.md:Zone.Identifier` — Windows metadata artifact, remove
