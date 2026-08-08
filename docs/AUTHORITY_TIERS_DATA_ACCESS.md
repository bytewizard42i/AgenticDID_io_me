# Authority-Tiered Data Access (pointer)

**AgenticDID** scoped grants are one of three authority sources that compose
at query time in the **HelixCTW** gateway to determine tiered data access.

**How AgenticDID fits:** An AgenticDID scoped grant (scope, per_action_cap,
cumulative_cap, expiry, counterparty binding, attenuation-only delegation)
is the native authority tier. When an agent queries the data plane on behalf
of a user, the grant determines which fields of the result set are visible.
A broader grant unlocks a higher tier; a narrower grant (from dynamic
intent-scoped permissions) restricts to exactly what the user's intent
requires.

**The three authority sources:**
1. **DIDz** identity (who)
2. **AgenticDID** grants (what authority, native to DIDzM)
3. **Trusted-issuer credentials** (legacy permissions from external
   institutions, resolved via `TrustedIssuerRegistry.compact`)

A legacy prequalification from a bank can unlock the same tier as an
AgenticDID grant from a property platform, without the bank joining DIDzM
as a grantor. The trust flows from the issuer registry.

**Canonical example (real estate):** See the HelixCTW authority-tiers
document for the full walkthrough. AgenticDID grants map to Tier 4
(institutional) in that example; trusted-issuer credentials map to Tiers 2
and 3.

**AgenticDID contract impact:** None. The scoped grant contract already
supports scope, caps, expiry, and counterparty binding. Tiered access is a
gateway GATE-step refinement that reads grant scope, not a contract change.

## NIGHTGATE transport boundary

NIGHTGATE and NIGHTGATE-MCP are planned transport components, not a fourth
authority source. An `ngat_` bearer grant may authorize and budget a request at
the NIGHTGATE edge, but it does not prove control of a principal DIDz and does
not provide AgenticDID scope, counterparty binding, attenuation lineage,
cascade revocation, or a ZK delegation proof. The MCP server is a
credential-bearing proxy under the same boundary.

Before a NIGHTGATE request is treated as agent-authorized, AgenticDID must
independently resolve and verify the applicable scoped grant. Transport success
must not be promoted to `REALDEAL` authority evidence.

Never put wallet seeds, private keys, bearer tokens, private documents,
private claims, or ZK witnesses in repository files, examples, fixtures, logs,
telemetry, or MCP prompts. Any future runtime handoff of sensitive material
requires an approved ephemeral channel, least-privilege scope, redacted
observability, and a documented retention policy.

**Canonical specification:**
`helixctw/docs/AUTHORITY_TIERS_DATA_ACCESS.md`
