# AgenticDID — demoLand vs realDeal

> Convention: every DIDzMonolith product ships two modes.
> Canonical spec: `~/PixyPi/docs/DEMOLAND_AUTH_STANDARD.md`

## demoLand — standalone (new, 2026 UI)

- **Location**: `frontend-demoland/`
- **Port**: 3014
- **Server**: Express static server (`node server.js`)
- **No Docker, no network** — pure HTML/CSS/JS simulation
- **What it shows**: Three-pillar model, two machines, scoped-grant lifecycle
  (issue → delegate → prove → revoke with cascade), ZK proof simulation,
  constitution alignment, 2026 glassmorphism + 3D tilt design
- **Start**: `cd frontend-demoland && npm install && npm start`
- **URL**: http://localhost:3014

## demoLand — Docker (hackathon-era, needs rebuild)

- **Location**: `demo/`
- **Ports**: 5173 (frontend), 8787 (backend), 6300 (proof server)
- **Server**: Docker Compose (`demo/docker-compose.yml`)
- **Chain**: undeployed mode — local Midnight node + proof server
- **Auth**: 7-method standard (see canonical doc)
- **Docker required** — `docker compose up` in `demo/`
- **Safe to record** — local node, no external network
- **⚠️ STALE**: still reflects old monolithic registry architecture

## realDeal (planned)

- **Chain**: Midnight testnet → mainnet
- **Contracts**: engine-based (scoped-grant v2 + POL credential from midnight-modules)
- **Identity**: DIDz root (not the old monolithic 2025 registry — that's archived)
- **Agent delegation**: scoped-grant v2 with per_action_cap + cumulative_cap
- **Proof server**: remote proof server or hosted

## Rules

1. Shared pipeline logic written ONCE — both sides are thin orchestrators
2. The UI must never know which mode it's in (provider context switch)
3. demoLand must show the amber `🎭 DEMO MODE` banner
4. Auth must implement the 7-method standard

## Note

The current Docker demo reflects the **old hackathon-era architecture** (monolithic
registry). It needs to be rebuilt to show the three-pillar model with engine
integration. See `PUNCHLIST.md`.
