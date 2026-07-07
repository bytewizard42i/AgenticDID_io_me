# demoLand vs realDeal, Proof of Authority Demo

> Follows the DIDzMonolith-standard split (see ZKSplunk's
> `DEMOLAND_VS_ZKMONITOR.md` and `~/PixyPi/docs/DEMOLAND_AUTH_STANDARD.md`).
> Same storyline. Same contract. Different backend.

## The split

| | demoLand | realDeal |
|---|----------|----------|
| **Contract** | real compiled `scoped_grant` circuits | identical binaries |
| **Execution** | in-process, `@midnight-ntwrk/compact-runtime@0.16.0` | deployed to Midnight localnet |
| **ZK proofs** | not generated, circuit asserts enforced, proofs skipped | real proofs via proof server |
| **Witnesses** | supplied by `demoLand/simulator.js` actor table | supplied by wallet/SDK providers |
| **Infra** | none (no Docker, no network) | node + proof server + indexer (Passport-demo-style compose) |
| **Determinism** | fully deterministic (sha256-derived keys/ids) | chain-dependent |
| **Purpose** | development, CI, safe video recording | credibility shot for the DIF proposal |

## The one rule

`shared/scenario.js` owns the story; `shared/narrator.js` owns the voice.
The mode directories contain ONLY an adapter and a runner. If you find
yourself writing storyline logic in `demoLand/` or `realDeal/`, stop ,
that logic belongs in `shared/`.

## Honesty note (stronger than the usual demoLand)

In most DIDzMonolith repos, demoLand mocks the domain logic. Here the domain
logic, every grant rule, every rejection, is the **actual compiled contract**.
Only the chain and proof generation are absent. A rejection in the demo output
is the compiled circuit saying no, not a scripted animation. The narrator's
`expectFailure` helper aborts the demo if the contract *fails* to reject.

## realDeal wiring (done, July 4, 2026)

1. Compose stack adapted from the Passport foundations harness, with one
   critical change: **bridge network + published ports** instead of
   `network_mode: host`, which is unreachable from WSL under Docker Desktop.
2. Full compile (`npm run compile-contract-zk`) generates prover/verifier keys
   into `contract/managed-zk/` (gitignored, regenerate, don't commit).
3. `realDeal/wallet.js` ports the proven Passport wallet/provider plumbing;
   `realDeal/adapter.js` deploys via `midnight-js` and implements the same
   10-method interface as the simulator. Actor switching = swapping which
   secret the `local_secret_key` witness reads.
4. Verified end-to-end: contract deployed to the localnet, 5 transactions with
   real ZK proofs landed, all 6 contract rejections fired as designed.

Known localnet quirks:
- The indexer can crash once at first boot ("block number 1 not found") if it
  races the node's first block, `restart: on-failure` in the compose absorbs it.
- The funding wallet is the genesis dev seed (`0…01`); it pays Dust fees for
  all actors. On-chain authority is decided solely by contract key commitments.
