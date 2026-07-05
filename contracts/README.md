# AgenticDID Contracts — superseded by the DIDz engine

> Re-scoped July 5, 2026 under the four-pillar architecture. See
> `docs/DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md` (§2, §6) for the model.

## Where the real contracts live now

AgenticDID's on-chain machinery is the **shared DIDz engine** in
`midnight-modules` (compiled on compactc 0.31.1 with full ZK keys):

| Concern | Engine module |
|---|---|
| Agent identity anchor | DIDz root registry (`DIDz-io/contracts/DIDzRegistry.compact`) |
| Delegated authority: scoped, capped, expiring, attenuating grants + the ZK proof of authority | `midnight-modules/modules/scoped-grant` (**v2**: per-action + cumulative caps, counterparty lock, custom-constraints slot) |
| Living-principal checks | `midnight-modules/modules/pol-credential` |
| Trusted issuers | `DIDz-io/contracts/TrustedIssuerRegistry.compact` |

Still in this repo (compile clean on 0.31.1, kept as supporting slices):

- `protocol/contracts/CredentialVerifier.compact` — verification + spoof-traffic privacy
- `protocol/contracts/ProofStorage.compact` — proof/action logging + receipts

## `archive/` — the 2025 monolithic registry (do NOT use as reference)

`AgenticDIDRegistry.compact` (this folder and `protocol/contracts/archive/`)
bundled identity + roles + scopes + revocation into one contract. It no longer
compiles on 0.31.1 (anonymous struct return types, `Bytes<32>::zero()`), and
its job is now split across DIDz root (identity) and scoped-grant v2
(authority) — the "two machines" of the architecture. Kept for history only.
