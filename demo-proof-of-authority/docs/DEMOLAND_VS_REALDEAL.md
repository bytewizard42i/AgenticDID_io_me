# demoLand vs realDeal — Proof of Authority Demo

> Follows the DIDzMonolith-standard split (see ZKSplunk's
> `DEMOLAND_VS_ZKMONITOR.md` and `~/PixyPi/docs/DEMOLAND_AUTH_STANDARD.md`).
> Same storyline. Same contract. Different backend.

## The split

| | demoLand | realDeal |
|---|----------|----------|
| **Contract** | real compiled `scoped_grant` circuits | identical binaries |
| **Execution** | in-process, `@midnight-ntwrk/compact-runtime@0.16.0` | deployed to Midnight localnet |
| **ZK proofs** | not generated — circuit asserts enforced, proofs skipped | real proofs via proof server |
| **Witnesses** | supplied by `demoLand/simulator.js` actor table | supplied by wallet/SDK providers |
| **Infra** | none (no Docker, no network) | node + proof server + indexer (Passport-demo-style compose) |
| **Determinism** | fully deterministic (sha256-derived keys/ids) | chain-dependent |
| **Purpose** | development, CI, safe video recording | credibility shot for the DIF proposal |

## The one rule

`shared/scenario.js` owns the story; `shared/narrator.js` owns the voice.
The mode directories contain ONLY an adapter and a runner. If you find
yourself writing storyline logic in `demoLand/` or `realDeal/`, stop —
that logic belongs in `shared/`.

## Honesty note (stronger than the usual demoLand)

In most DIDzMonolith repos, demoLand mocks the domain logic. Here the domain
logic — every grant rule, every rejection — is the **actual compiled contract**.
Only the chain and proof generation are absent. A rejection in the demo output
is the compiled circuit saying no, not a scripted animation. The narrator's
`expectFailure` helper aborts the demo if the contract *fails* to reject.

## realDeal wiring (next step)

1. Reuse the Passport foundations compose file (node + proof server + indexer).
2. Full-compile `scoped_grant` (drop `--skip-zk`) for prover/verifier keys.
3. Deploy via `@midnight-ntwrk/midnight-js-contracts`; implement the adapter
   with the same 10 methods as `demoLand/simulator.js`.
4. Point `realDeal/run.js` at the shared scenario. Record.
