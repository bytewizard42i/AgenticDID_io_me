# AgenticDID — Proof of Authority Demo

> **"Prove the mandate, not the man."**

A 3-act demonstration of the AgenticDID delegation engine (`scoped-grant`):
a principal issues her agent a scoped, capped, expiring grant; the agent
transacts and delegates a narrower grant to a sub-agent; the principal revokes
once and the whole delegation tree dies. Verifiers learn exactly **one bit**.

This is proposal artifact #3 in the [DIF standardization plan](../docs/DIF_STANDARDIZATION_PLAN.md),
alongside the [protocol spec](../spec/AGENTICDID_SPEC.md) and the
[reference implementation](../../midnight-modules/modules/scoped-grant/).

## Quick start (demoLand — zero setup)

```bash
npm install
npm run demoland
```

No Docker, no network, deterministic. Runs in seconds.

## Quick start (realDeal — real ZK proofs on a live localnet)

```bash
npm install
npm run compile-contract-zk   # full compile: prover/verifier keys (not in git)
npm run infra:up              # node + indexer + proof server (Docker)
npm run realdeal              # same 3 acts, real proofs (~2 min)
npm run infra:down            # when done (add :reset to wipe chain state)
```

## demoLand vs realDeal

Per the DIDzMonolith [demoLand/realDeal convention](./docs/DEMOLAND_VS_REALDEAL.md):

| | demoLand | realDeal |
|---|---|---|
| Contract logic | **real compiled circuits** (`scoped_grant.compact`, compactc 0.31.1) | same |
| Chain | in-process via `@midnight-ntwrk/compact-runtime` | Midnight localnet (node + proof server + indexer) |
| ZK proofs | not generated (circuit asserts still enforced) | real proofs |
| Setup | none | Docker |
| Status | ✅ working | ✅ working |

The storyline lives **once** in `shared/scenario.js`; both modes are thin
orchestrators over it.

## Layout

```
shared/     scenario.js (the 3 acts) + narrator.js — written once
demoLand/   simulator.js (compact-runtime adapter) + run.js
realDeal/   wallet.js + adapter.js (midnight-js localnet) + run.js + infra/ (compose)
contract/   managed/ — skip-zk output (in git); managed-zk/ — full ZK output (not in git)
docs/       DEMOLAND_VS_REALDEAL.md
```

**WSL note:** the compose file uses a bridge network with published ports —
`network_mode: host` containers are unreachable from WSL under Docker Desktop.

To regenerate the compiled contract after editing the module:
`npm run compile-contract`.
