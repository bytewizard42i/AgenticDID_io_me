# AgenticDID — Engine Reference

> Pointer to the shared Compact modules that AgenticDID imports (or will import).

## Source

**Repo**: `midnight-modules` (`/home/js/DIDzMonolith/midnight-modules`)
**Catalog**: `midnight-modules/docs/MODULES_CATALOG.md`

## Modules AgenticDID uses (or plans to)

| Module | Status | How AgenticDID uses it |
|--------|--------|------------------------|
| `scoped-grant` | v2, compiled 0.31.1 | Agent delegation: per_action_cap + cumulative_cap budgets |
| `pol-credential` | compiled 0.31.1 | Proof-of-Life for human-vs-agent credential distinction |
| `commitment` | available | Identity commitments (privacy-first, per principle 0) |
| `nullifier` | available | Replay protection for credential presentations |

## Migration status

The old monolithic 2025 registry is archived. Identity → DIDz root, authority →
scoped-grant v2. CredentialVerifier + ProofStorage kept. See
`DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md` and `PUNCHLIST.md`.

## Import pattern

```compact
import { scoped_grant_v2 } from "../midnight-modules/modules/scoped-grant/scoped_grant_v2";
```
