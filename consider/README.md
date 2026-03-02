# consider/ — Salvaged from AgenticDID_io_me_MAIN

**Date salvaged:** March 2, 2026
**Source repo:** `bytewizard42i/AgenticDID_io_me_MAIN`
**Salvaged by:** Penny

## What is this?

These files were copied from the `AgenticDID_io_me_MAIN` GitHub repo before John deletes it.
The goal is to preserve anything of value in one place so it can be reviewed and integrated
into the main AgenticDID codebase as needed.

## What was skipped (and why)

- **`demo/`** — Nearly identical to `../agentic-did/` (same apps, contracts, packages structure). Already exists locally.
- **`midnight-reference-repos/`** (195MB) — Cloned copies of Midnight repos. Already available at `/home/js/utils_Midnight/Midnight_reference_repos/`.
- **`LICENSE`** — Already exists in the root of this repo.

## Contents

### Code
- **`backend/`** — Agent logic, API endpoints, Midnight integration, shared utilities
- **`contracts/`** — `AgenticDIDRegistry.compact` (19KB main contract) + test suite
- **`frontend/web/`** — Web frontend
- **`protocol/`** — Protocol implementation (agents, contracts, issuers, scripts)
- **`scripts/`** — Build/deploy scripts (compile-with-docker, phase1-foundation, cloud proof server setup)
- **`infrastructure/`** — Cloud Run config, render.yaml, vercel.json
- **`test-zk-flow.ts`** — ZK flow test script

### Docs
- **`docs-nerds-only/`** — Architecture docs, protocol rules, code reviews, integration plans, status docs
- **`JUDGES-README.md`** — Hackathon submission README
- **`PITCH_DECK_5MIN.md`** — 5-minute pitch deck script
- **`PRESENTATION_SLIDES_GUIDE.md`** — Slide guide
- **`SPEAKER_NOTES.md`** + `.pdf` — Speaker notes
- **`VIDEO_SCRIPT_30SEC.md`** — 30-second video script
- **`LIVE_DEMO_INFO.md`** — Live demo details
- **`SLIDES_CONTENT_ONLY.txt`** — Raw slide text

### Config & Setup
- **`.env.example`** — Environment variables template
- **`docker-compose.yml`** — Root-level docker compose
- **`docker-compose.proof-server.yml`** — Proof server docker config
- **`setup-dev-machine.sh`** — Dev machine setup script
- **`start-everything.sh`** — Full startup script

### Other
- **`media/`** — Diagrams, images, music/sound, videos (65MB)
- **`wallets/`** — Test wallet data

## After review

Once John has reviewed everything and decided what to keep, integrate, or discard,
this entire `consider/` folder can be deleted.
