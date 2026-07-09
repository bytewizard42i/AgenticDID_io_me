# AgenticDID × DIDz.io, Integration Architecture

**Author**: Penny 🎀  
**Date**: March 21, 2026  
**Status**: Architecture, Cross-Pollination  
**Related**: [DIDz-io mirror doc](../../../DIDz-io/docs/TRUSTED_ISSUER_AGENT_ARCHITECTURE.md)

---

## How AgenticDID Fits Into DIDz.io

AgenticDID is the **agentic layer** of the DIDz ecosystem. DIDz.io provides the Trust Triangle (Holder → Trusted Issuer → Verifier) and AgenticDID provides the agent lifecycle that operates within it.

```
DIDz.io Trust Triangle                AgenticDID Agentic Layer
───────────────────────                ────────────────────────

   Trusted Issuer                      Issuer creates Agents
        │                                    │
        │ attests                            │ registerAgent()
        ▼                                    ▼
     Holder                              Agent acts for Holder
        │                                    │
        │ presents proof                     │ createDelegation()
        ▼                                    ▼
     Verifier                            Agent-to-Agent verification
                                             │
                                             │ verifyCredential() + spoof
                                             ▼
                                         Boolean result
```

**Key insight**: Every "Trusted Issuer" in DIDz.io's architecture can also be an entity that creates agents in AgenticDID. The **Trusted Issuer DApp** is where these two worlds merge.

---

## What AgenticDID Already Has (That DIDz.io Needs)

### 1. AgenticDIDRegistry Contract
The on-chain registry for agent identity, credentials, delegation, and revocation. DIDz.io's Trust Triangle needs this to manage agents that act on behalf of Trusted Issuers.

**Circuits available**:
- `registerAgent()`, Issuer creates an agent with DID, role, scopes, expiration
- `verifyAgent()`, Check if agent is valid, active, and not expired
- `getAgentPublicKey()`, Retrieve agent's public key for ZK verification
- `createDelegation()`, User authorizes agent to act with scoped permissions
- `checkDelegation()`, Verify delegation is valid and not expired/revoked
- `revokeDelegation()`, User revokes agent authorization
- `revokeAgent()`, Issuer or admin deactivates an agent

### 2. CredentialVerifier Contract
Verification engine with **spoof transaction privacy**, a novel defense against timing analysis that should be adopted across ALL DIDz verification flows.

**Circuits available**:
- `verifyCredential()`, Verify + generate spoof transactions
- `verifyDelegation()`, Check delegation + spoof
- `batchVerify()`, Multi-agent verification
- `getStats()`, Public verification statistics
- `updateSpoofRatio()`, Tune privacy vs. performance

### 3. Three-Axis Issuer Model
Composable classification that eliminates category explosion:

```
Axis 1: issuerType   , INDIVIDUAL | CORPORATION | GOVERNMENT_ENTITY | INSTITUTION | COOPERATIVE
Axis 2: domains[]    , FINANCIAL | MEDICAL | EDUCATION | VETERINARY | EQUINE | LEGAL | ...
Axis 3: assuranceLevel, SELF_DECLARED | PEER_REVIEWED | REGULATED_ENTITY | SYSTEM_CRITICAL
```

This model should become the **standard for DIDz.io's TrustedIssuerRegistry**.

### 4. Issuer → Agent Hierarchy
Every Trusted Issuer can create one or more agents. Each agent inherits its parent issuer's trust level and operates within the issuer's domain scope.

```
AgenticDID Foundation (root issuer)
    ├── AgenticDID Issuer Agent (issues KYC credentials)
    └── Comet (user's local agent)

Bank of America (trusted issuer)
    └── BOA Agent (banking operations)

Stanford University (trusted issuer)
    └── Stanford Agent (education + research + medical + IVF)

Vet Practice (trusted issuer)             ← NEW: PetProData
    └── Vet Agent (clinical records, vaccines, prescriptions)

AQHA Registry (trusted issuer)            ← NEW: EquineProData
    └── Registry Agent (breed registration, ownership transfers)
```

### 5. Delegation Chain with Mutual Authentication
The full workflow: User proves identity to Agent, Agent proves identity to User, User signs delegation with scoped permissions, Agent presents delegation to external services.

### 6. TD Bank Philosophy
"Build ONE perfect flow and replicate." The `agent_0` canonical flow is the template that every new issuer/agent pair follows.

---

## What DIDz.io Has (That AgenticDID Needs)

### 1. Trust Triangle Framework
The foundational three-party model that defines how identity verification works. AgenticDID's agents operate **within** this triangle, they are never independent of it.

### 2. KYCz Anchor Contract (7 Compiling Circuits)
The proven ZK proof engine. When an agent needs to prove a fact about a holder (age, residency, KYC status, sanctions), it calls KYCz circuits. This is the **only contract in the ecosystem that currently compiles and generates real ZK proofs**.

### 3. W3C DID Core + Verifiable Credentials Alignment
The `did:midnight` method spec and VC data model that makes agent DIDs globally interoperable. Without this, AgenticDID agents are Midnight-only. With it, they're compatible with any W3C DID resolver worldwide.

### 4. Credential Schema Registry (Proposed)
Machine-readable definitions of what each credential type contains. AgenticDID's credential type matrix should be formalized as W3C-compliant schemas stored in DIDz-io.

### 5. Hierarchical Privacy Wallet
The folderized wallet where holders store credentials. When AgenticDID agents issue credentials, those credentials land in the holder's DIDz wallet organized by folder (Government, Financial, Healthcare, etc.).

### 6. Verifier Integration DApp
The standard interface for external services to submit ZKQueries. AgenticDID's spoof transaction system wraps around this to protect timing privacy.

---

## The Trusted Issuer DApp, Shared Architecture

This is the DApp both repos are building toward. It has three main screens:

### Screen 1: Issuer Dashboard
- Register as a Trusted Issuer (entity name, type, domains, assurance level)
- View issuer status (active, pending, revoked)
- Manage issuer keys (rotation, recovery)
- View credential issuance statistics

### Screen 2: Agent Management
- Create new agents (DID, role, scopes, expiration)
- View active agents and their delegation chains
- Revoke agents
- Monitor agent verification activity

### Screen 3: Credential Issuance
- Issue credentials to holders (select credential type, fill claims)
- View issued credentials and their status
- Revoke credentials
- Search credential by holder DID or credential hash

### DemoLand Implementation

For demoLand, the Trusted Issuer DApp simulates the full flow with mock data:

```
demoLand Trusted Issuers:
  ├── AgenticDID Foundation (root)    , issues KYC_TIER_1, KYC_TIER_2
  ├── Demo Bank                       , issues FINANCIAL_ACCOUNT, CREDIT_SCORE
  ├── Demo Hospital                   , issues HEALTH_RECORD, VACCINATION_RECORD
  ├── Demo Vet Clinic                 , issues PET_HEALTH_RECORD
  ├── Demo Equine Registry            , issues EQUINE_OWNERSHIP, EQUINE_HEALTH_RECORD
  └── Demo University                 , issues DEGREE, CERTIFICATION

demoLand Agents:
  ├── Comet (local)                   , user's personal agent
  ├── AgenticDID Issuer Agent         , KYC workflows
  ├── Bank Agent                      , account operations
  ├── Hospital Agent                  , health record access
  ├── Vet Agent                       , pet health workflows
  ├── Registry Agent                  , equine registration
  └── University Agent                , credential verification
```

---

## Contract Update Requirements

AgenticDID contracts were written for Compact v0.26.0 (compiler has bugs). They need updating to the stable v0.25.0 compiler with these fixes:

### AgenticDIDRegistry.compact
1. **Pragma**: Change to `>= 0.16 && <= 0.18` (range, not exact version)
2. **Cross-contract calls**: Wire to TrustedIssuerRegistry when available
3. **`registerAgent()`**: Add check that `caller` is a registered Trusted Issuer
4. **Compilation verification**: Test against compactc v0.25.0

### CredentialVerifier.compact
1. **Pragma**: Same range fix
2. **Cross-contract calls**: Wire to AgenticDIDRegistry (currently TODO'd out)
3. **Compilation verification**: Test against compactc v0.25.0

### New: TrustedIssuerRegistry.compact (DIDz-io)
1. **`registerIssuer()`**, Admin-approved issuer onboarding
2. **`getIssuerStatus()`**, Is this issuer active/trusted?
3. **`revokeIssuer()`**, Remove a bad issuer
4. **`getIssuerDomains()`**, What domains can this issuer attest to?
5. **`trustedIssuers: Set<Bytes<32>>`**, On-chain issuer registry

---

## Ecosystem Integration Map

How the Trusted Issuer → Agent → Credential flow connects to every DIDz product:

| Product | Trusted Issuer | Agent | Credentials Issued |
|---------|---------------|-------|-------------------|
| **KYCz** | Any approved issuer | KYC Agent | KYC_TIER_1/2/3, AGE_VERIFICATION |
| **ProMingle** | Employer, University | Professional Agent | PROFESSIONAL_CREDENTIAL, DEGREE |
| **safeHealthData** | Hospital, Insurer | Health Agent | HEALTH_RECORD, INSURANCE |
| **PetProData** | Vet Practice | Vet Agent | PET_HEALTH_RECORD, VACCINATION |
| **EquineProData** | Equine Registry, Vet | Registry Agent | EQUINE_OWNERSHIP, EQUINE_HEALTH |
| **GeoZ** | Government | Location Agent | RESIDENCY_PROOF |
| **AutoDiscovery** | Law Firm, Court | Legal Agent | LEGAL_CREDENTIAL |
| **SilentLedger** | Exchange, Custodian | Finance Agent | ASSET_OWNERSHIP |
| **LegacyKey** | Estate Attorney | Estate Agent | INHERITANCE_CREDENTIAL |
| **HuddleBridge** | Platform, Peer | Social Agent | SOCIAL_ATTESTATION |
| **SouLink** | Platform, Peer | Identity Agent | CROSS_PLATFORM_LINK |
| **PopCork** | Platform | Content Agent | CONTENT_CREATOR_CREDENTIAL |
| **EncryptVault** | Self | Vault Agent | ENCRYPTION_KEY_CREDENTIAL |

Every row follows the same pattern:
1. Trusted Issuer registers via DIDz.io TrustedIssuerRegistry
2. Issuer creates Agent via AgenticDID Registry
3. Agent issues Credentials to Holders
4. Holders present ZK proofs to Verifiers
5. Verifiers get boolean answers, no PII

---

## Next Steps

1. **Update AgenticDID contracts** to Compact ≥0.25.0 stable
2. **Build TrustedIssuerRegistry.compact** in DIDz-io
3. **Wire the contracts**, agents can only be created by registered issuers
4. **Build `@didz/core` shared SDK**, one package for the whole ecosystem
5. **Implement agent_0 canonical flow**, the one perfect check
6. **Build Trusted Issuer DApp frontend** (demoLand first)
7. **Extend credential types** for PetProData, EquineProData, safeHealthData

---

*This document is the AgenticDID perspective on the DIDz integration. See the DIDz-io mirror doc for the DIDz.io perspective.*
