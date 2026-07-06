# AgenticDID — demoLand vs realDeal

> Convention: every DIDzMonolith product ships two modes.
> Canonical spec: `~/PixyPi/docs/DEMOLAND_AUTH_STANDARD.md`

## demoLand (current)

- **Ports**: 5173 (frontend), 8787 (backend), 6300 (proof server)
- **Server**: Docker Compose (`demo/docker-compose.yml`)
- **Chain**: undeployed mode — local Midnight node + proof server
- **Auth**: 7-method standard (see canonical doc)
- **Docker required** — `docker compose up` in `demo/`
- **Safe to record** — local node, no external network

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
registry). It needs to be rebuilt to show the four-pillar model with engine
integration. See `PUNCHLIST.md`.
