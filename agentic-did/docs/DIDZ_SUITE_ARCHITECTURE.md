# 🔮 DIDz Protocol Suite - Complete Architecture
**From AgenticDID.io to Universal Identity to "Fi" Economics**

**Created**: October 29, 2025  
**Updated**: November 14, 2025 (aligned with Grand Vision)  
**Purpose**: Technical architecture for universal identity protocol spanning humans, AI agents, and objects  
**Team**: Alice (architecture), Cassie (implementation), John Santi (product vision)

---

## 📋 Documentation Index

### Start Here
- **[GRAND_VISION.md](./GRAND_VISION.md)** - 🌟 **START HERE** - Complete vision from identity to "Fi"
  - Synthesis of 3 foundational packets (Grok ideation, Hoskinson philosophy, DIDz implementation)
  - Roadmap from current demo to agentic commerce to cooperative economics
- **This document** - Technical architecture and module specifications

### Detailed Specifications (Companion Files)
2. **[DIDZ_FOUNDATION_MODULES.md](./DIDZ_FOUNDATION_MODULES.md)** - DIDz Core, VCz, ACLz (Layers 1-2)
3. **[DIDZ_PRIVACY_MODULES.md](./DIDZ_PRIVACY_MODULES.md)** - PolicyZ, NotiZ, RecoverZ (Layer 3)
4. **[DIDZ_INTEGRATION_MODULES.md](./DIDZ_INTEGRATION_MODULES.md)** - DirectoryZ, InteropZ, OracleZ (Layer 4)
5. **[DIDZ_OPERATIONS_MODULES.md](./DIDZ_OPERATIONS_MODULES.md)** - AuditZ, PayZ, Observability (Layer 5)
6. **[DIDZ_NIGHTAGENT_INTEGRATION.md](./DIDZ_NIGHTAGENT_INTEGRATION.md)** - Healthcare use case implementation

---

## Executive Summary

### Vision

Build the **identity layer for the agentic web** - a universal privacy-preserving protocol for humans, AI agents, and objects that enables declarative task execution, cross-chain intentions, and ultimately realizes Charles Hoskinson's vision of "Fi" (Fair Finance).

**Starting Point**: AgenticDID.io (AI agent identity - Phase 1 complete)  
**Near-Term**: DIDz Protocol (human identity + healthcare - Phase 2)  
**Long-Term**: Agentic commerce + intention layer + "Fi" economics (Phases 3-5)

### Philosophical Foundation

Our architecture realizes three key insights:

1. **Universal Identity** (Packet 1 - Grok): DIDs aren't just for humans - they're for AI agents, robots, drones, objects
2. **Rational Privacy** (Packet 2 - Hoskinson): Privacy by DEFAULT, disclosure by CHOICE - the foundation for trust
3. **Human-Centric Use Cases** (Packet 3 - DIDz): Real-world applications like age verification drive adoption

### What We Have (AgenticDID.io MVP - Complete) ✅

**3 Minokawa Smart Contracts** (1,276 lines)
- `AgenticDIDRegistry.compact` - Agent registration & delegation
- `CredentialVerifier.compact` - ZKP verification + spoof transactions  
- `ProofStorage.compact` - Merkle proofs & audit logs

**Novel Privacy Features**
- Spoof transactions (80% white noise for metadata protection)
- Step-up authentication (biometric/2FA for sensitive operations)
- Selective disclosure proofs
- Multi-party mutual authentication

**Production-Ready Architecture**
- React frontend (results-focused UX)
- Fastify backend (Midnight gatekeeper)
- Comprehensive documentation (60+ pages)
- Docker deployment ready

### What We're Building (Evolution to Universal Identity)

Transform AgenticDID.io from **AI agent identity** → **universal protocol for humans, agents, and objects** → **agentic commerce** → **"Fi" economics**:

#### Current Modules (DIDz Suite - Technical Foundation)

| Module | Purpose | Status | Priority | Phase |
|--------|---------|--------|----------|-------|
| **DIDz Core** | Root identity, keys, resolution | 80% | ✅ Foundation | 1-2 |
| **VCz** | Verifiable credentials (CIP-68/143) | 60% | ✅ Foundation | 1-2 |
| **ACLz** | Access control & capabilities | 30% | 🔄 Phase 2 | 2 |
| **PolicyZ** | Privacy & redaction engine | 10% | 🔥 Healthcare | 2 |
| **NotiZ** | Private messaging | 0% | 🔥 Healthcare | 2 |
| **RecoverZ** | Recovery & estate | 0% | 🔜 Phase 3 | 3 |
| **DirectoryZ** | Discovery & names | 0% | 🔜 Phase 3 | 3 |
| **PayZ** | Payments & entitlements | 0% | 🔜 Phase 4 | 4 |
| **OracleZ** | Data attestations | 0% | 🔜 Phase 4 | 4 |
| **AuditZ** | Immutable audit trails | 40% | 🔄 Phase 2 | 2 |
| **InteropZ** | W3C DID/VC bridges | 0% | 🔜 Phase 5 | 5 |
| **Tooling** | SDKs & developer kit | 20% | 🔄 Ongoing | All |
| **Observability** | Privacy-safe telemetry | 0% | 🔜 Phase 5 | 5 |
| **Security** | Threat mitigations | 70% | ✅ Architected | 1-2 |

#### Future Extensions (Grand Vision - Beyond DIDz)

| Extension | Purpose | Inspiration | Phase | Status |
|-----------|---------|-------------|-------|--------|
| **Agentic Commerce** | Declarative task execution | Packet 1 (Grok) | 3 | 🔮 Placeholder |
| **Agent Marketplace** | Specialized agent discovery | Packet 1 | 3 | 🔮 Placeholder |
| **Intent Parsing** | Natural language → structured | Packet 1 | 3 | 🔮 Placeholder |
| **A2A Communication** | DIDComm for bot coordination | Packet 1 | 3 | 🔮 Placeholder |
| **Capacity Exchange** | Pay in any token | Packet 2 (Hoskinson) | 4 | 🔮 Placeholder |
| **Cross-Chain Folding** | Trustless chain observation | Packet 2 | 4 | 🔮 Placeholder |
| **Intention Layer** | Route tasks to best chain | Packet 2 | 4 | 🔮 Placeholder |
| **Cooperative Consensus** | Multi-resource validation | Packet 2 | 5 | 🔮 Placeholder |
| **Fair Distribution** | No ponzinomics | Packet 2 | 5 | 🔮 Placeholder |
| **"Fi" Economics** | Fair finance ecosystem | Packet 2 | 5 | 🔮 Placeholder |

**Note**: Modules marked 🔮 are architectural placeholders - part of the grand vision but not in active development. See [GRAND_VISION.md](./GRAND_VISION.md) for complete roadmap.

---

## Architecture Layers

```
┌────────────────────────────────────────────────────────────────────┐
│                          DIDz Protocol Suite                        │
│                                                                     │
│  Layer 1: Foundation (Midnight Blockchain + Minokawa)              │
│  - Zero-knowledge proofs, Private state, Selective disclosure       │
│                                                                     │
│  Layer 2: Core Identity & Credentials                              │
│  - DIDz Core (Root ID) → VCz (Credentials) → ACLz (Permissions)   │
│                                                                     │
│  Layer 3: Privacy & Governance                                      │
│  - PolicyZ (Privacy) → NotiZ (Messaging) → RecoverZ (Recovery)     │
│                                                                     │
│  Layer 4: Discovery & Integration                                   │
│  - DirectoryZ (Discovery) → InteropZ (Bridges) → OracleZ (Oracles) │
│                                                                     │
│  Layer 5: Operations & Observability                                │
│  - AuditZ (Logging) → PayZ (Payments) → Observability (Telemetry)  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Current State: AgenticDID.io Foundation

### Completion Matrix

| DIDz Module | AgenticDID Component | % Complete | Key Features |
|-------------|---------------------|------------|--------------|
| **DIDz Core** | `AgenticDIDRegistry.compact` | 80% | Registration, resolution, delegation ✅ |
| **VCz** | `CredentialVerifier.compact` | 60% | ZK verification, spoof transactions ✅ |
| **ACLz** | Delegation structs | 30% | Basic delegation (needs capability tokens) |
| **AuditZ** | `ProofStorage.compact` | 40% | Merkle proofs, basic trails ✅ |
| **PolicyZ** | `PRIVACY_ARCHITECTURE.md` | 10% | Documented (not implemented) |
| **Security** | Spoof system | 70% | Novel privacy patterns ✅ **UNIQUE** |

### Unique Innovations Already Built

1. **Spoof Transaction System** - 80% noise to hide verifications (no other DID system has this)
2. **Step-Up Authentication** - Biometric/2FA for sensitive ops (merchant protection built-in)
3. **Multi-Party Mutual Auth** - Bidirectional trust (User ↔ Agent ↔ Service)
4. **Privacy-First Architecture** - ZK verification with no logging

---

## Build Phases & Roadmap

### Phase 1: Foundation (✅ Complete)

**Delivered**: AgenticDID.io MVP with 3 contracts

- ✅ DIDz Core v0.1
- ✅ VCz v0.1
- ✅ ACLz v0.1
- ✅ AuditZ v0.1
- ✅ Spoof transaction system
- ✅ Step-up authentication architecture

### Phase 2: Healthcare Enablement (🔄 Current - Q4 2025)

**Goal**: Enable NightAgent clinical trial recruitment

**Critical Path**:
1. **PolicyZ v0.1** (4 weeks)
   - Template registry (IRB-approved messages)
   - Redaction profiles (HIPAA compliance)
   - Consent ledger

2. **NotiZ v0.1** (6 weeks) 🔥 **HIGH PRIORITY**
   - Anonymous inboxes
   - Template conformance proofs
   - Opt-in reveal mechanism

3. **ACLz v0.2** (3 weeks)
   - Capability tokens
   - Resource model (patient records = resources)
   - Context-aware policies

4. **AuditZ v0.2** (2 weeks)
   - Enhanced audit trails
   - IRB reporting format
   - Immutable logs

**Timeline**: 15 weeks (Dec 2025 - Mar 2026)  
**Deliverable**: NightAgent demo at Midnight Summit (Nov 2025 with mocks, production Q1 2026)

### Phase 3: Ecosystem Growth (Q1-Q2 2026)

**Goal**: Complete the protocol suite for broader adoption

- RecoverZ v0.1 - Guardian recovery
- DirectoryZ v0.1 - Name registry
- DIDz Core v0.2 - Key rotation
- VCz v0.2 - CIP-68/143 dynamic NFTs
- Tooling v0.2 - Enhanced SDKs

### Phase 4: Enterprise Features (Q2-Q3 2026)

**Goal**: Production-ready for enterprise deployments

- PayZ v0.1 - Entitlements & metered access
- OracleZ v0.1 - Data attestations
- PolicyZ v0.2 - ML-assisted privacy
- Observability v0.1 - Telemetry

### Phase 5: Interoperability (Q3-Q4 2026)

**Goal**: Bridge to broader DID/VC ecosystems

- InteropZ v0.1 - W3C DID/VC exports
- InteropZ v0.2 - Prism/Identus adapters
- DirectoryZ v0.2 - Reputation systems

---

## Healthcare Use Case: NightAgent Integration

### Problem Statement

**Clinical Trial Recruitment** is expensive ($1.4B annual waste) and privacy-invasive:
- Current: Manual EHR review, direct patient contact (HIPAA concerns)
- Challenges: 30-40% participation boost possible with privacy controls
- Solution: ZK-powered anonymous eligibility + opt-in reveal

### NightAgent + DIDz Solution

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: Eligibility Computation (OFF-CHAIN, HIPAA-Protected)    │
│                                                                  │
│  Clinic EHR → Eligibility Engine → Commitment Set               │
│  - Age 40-60 ✓                                                  │
│  - Diagnosis = Sleep Apnea ✓                                    │
│  - Not on excluded meds ✓                                        │
│  → Generates Merkle tree of eligible patient commitments        │
└──────────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Publish Root (ON-CHAIN, PolicyZ + NotiZ)               │
│                                                                  │
│  PolicyZ.registerTemplate(TRIAL_INVITATION_TEMPLATE, IRB_SIG)   │
│  NotiZ.publishEligibilityRoot(trialId, merkleRoot, templateHash)│
│  → Only commitment root published (no patient data)              │
└──────────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Send Notifications (ANONYMOUS via NotiZ)               │
│                                                                  │
│  for each eligible patient:                                      │
│    NotiZ.sendMessage(                                            │
│      recipient: patient.didz,  // Anonymous handle               │
│      templateHash: APPROVED_TEMPLATE,                            │
│      eligibilityProof: merkleProof,                              │
│      ttl: 30 days                                                │
│    )                                                             │
│  → Patient sees: "You may be eligible for trial NCT12345"       │
│  → Patient does NOT see: clinic, doctor, full details           │
└──────────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Opt-In Reveal (PATIENT-CONTROLLED via VCz)             │
│                                                                  │
│  If interested:                                                  │
│    Patient proves "I'm in eligible set" + reveals identity       │
│    VCz.presentCredential(eligibilityProof, selectiveDisclosure) │
│  If not interested:                                              │
│    Message expires, no trace, patient stays anonymous            │
└──────────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: Audit Trail (IMMUTABLE via AuditZ)                     │
│                                                                  │
│  AuditZ logs:                                                    │
│  - IRB-approved template used ✓                                 │
│  - N patients notified (count only, no IDs)                      │
│  - M patients opted in (with consent proofs)                     │
│  → Provable HIPAA compliance for IRB                             │
└──────────────────────────────────────────────────────────────────┘
```

### Benefits

| Stakeholder | Benefit | DIDz Module |
|-------------|---------|-------------|
| **Patients** | Privacy preserved, opt-in control | VCz + NotiZ |
| **Clinics** | HIPAA-compliant recruitment | PolicyZ + AuditZ |
| **IRB** | Provable compliance, audit trail | AuditZ + PolicyZ |
| **Pharma** | Faster enrollment, lower costs | NotiZ + DirectoryZ |
| **Regulators** | Immutable logs, no PHI leaks | AuditZ |

---

## Technical Stack

### Smart Contracts (Minokawa/Compact)

- **Language**: Minokawa v0.18.0 (Compact)
- **Compiler**: compactc v0.26.0
- **Network**: Midnight devnet → testnet → mainnet
- **Runtime**: @midnight-ntwrk/compact-runtime v0.9.0

### Frontend (React + TypeScript)

- **Framework**: Vite + React 18
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand + React Query
- **Wallet**: Lace integration

### Backend (Node.js + Bun)

- **Runtime**: Bun (10x faster than Node)
- **Server**: Fastify (Midnight gatekeeper)
- **Effect-TS**: Functional composition
- **MCP**: Model Context Protocol (for NightAgent)

### Infrastructure (Post-Hackathon)

- **Orchestration**: Kubernetes (Talos Linux)
- **IaC**: Pulumi (TypeScript)
- **Cloud**: Hetzner Cloud
- **Networking**: Cilium CNI (eBPF)

---

## Next Steps

### Immediate (Nov 2025 - Hackathon)

1. ✅ **AgenticDID.io**: Deploy MVP with mock Midnight adapter
2. 🔄 **NightAgent**: Build MCP server with mock DIDz integration
3. 🔄 **Demo**: Clinical trial recruitment flow (with mocks)
4. 🔜 **Pitch**: Midnight Summit presentation

### Short-Term (Q4 2025 - Q1 2026)

1. **Fix Contracts**: Update to Compact v0.26 syntax (6-8 hours)
2. **Deploy Real Midnight**: TestNet deployment (2-3 hours)
3. **PolicyZ v0.1**: Template registry + consent ledger (4 weeks)
4. **NotiZ v0.1**: Anonymous messaging (6 weeks) 🔥 **CRITICAL PATH**

### Medium-Term (Q2-Q3 2026)

1. Complete Phase 3 modules (RecoverZ, DirectoryZ, enhanced DIDz/VCz)
2. Production deployment on NightAgent infrastructure
3. First enterprise customers (healthcare pilot programs)

### Long-Term (Q4 2026+)

1. Complete Phase 4-5 modules (PayZ, OracleZ, InteropZ)
2. Multi-chain support
3. Enterprise SaaS offering ($30M+ ARR potential)

---

## Revenue Model

### Target Markets

| Vertical | Use Case | ARR Potential (Year 3) |
|----------|----------|------------------------|
| **Healthcare** | Clinical trial recruitment | $5M |
| **Healthcare** | HIPAA consent platform | $10M |
| **Healthcare** | Insurance claims oracle | $20M |
| **Finance** | KYC-lite for DeFi | $8M |
| **Enterprise** | Employee identity/access | $12M |
| **Government** | Citizen services | $15M |
| **Total** | Privacy-preserving identity | **$70M+** |

### Pricing Strategy

- **Freemium**: Basic DIDz identity (free)
- **Professional**: PolicyZ + NotiZ ($50K/year per org)
- **Enterprise**: Full suite + SLA ($200K/year per org)
- **Custom**: Pharma/insurance custom contracts ($500K-$2M/year)

---

## Resources & References

### Internal Documentation

- [PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md) - Spoof transactions & privacy model
- [AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md) - Multi-party authentication
- [MIDNIGHT_INTEGRATION_PLAN.md](./MIDNIGHT_INTEGRATION_PLAN.md) - Deployment guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Repository organization

### Midnight Network

- [Midnight Docs](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/)
- [Minokawa Compiler](https://docs.midnight.network/develop/contracts/compactc/)

### PixyPi Reference (Read-Only)

- `/home/js/PixyPi/myAlice/MIDNIGHT_COMPILATION_DEPLOYMENT_GUIDE.md`
- `/home/js/PixyPi/myAlice/midnight-docs/` - Complete Midnight reference

### NightAgent Project

- `/home/js/utils_Midnight/utils_NightAgent/NightAgent-London/` - MCP server for healthcare

---

**Last Updated**: October 29, 2025  
**Status**: Phase 1 Complete, Phase 2 Planning  
**Next Milestone**: NightAgent Hackathon Demo (Nov 17-19, 2025)
