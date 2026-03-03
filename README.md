# AgenticDID.io — Privacy-Preserving Identity for AI Agents

**Midnight-powered identity protocol that lets AI agents prove authenticity and authorization without exposing private data.**

**Website**: AgenticDID.io  
**Company**: [EnterpriseZK Labs LLC](https://enterprisezk.com)  
**Blockchain**: [Midnight Network](https://midnight.network)  
**Status**: MVP Complete (Phase 1) · Phase 2 In Progress

---

## What Is This Repo?

This is the **CloudRun edition** of AgenticDID — structured for the Google Cloud Run hackathon submission. It contains two main directories:

| Directory | Purpose |
|-----------|---------|
| **[agentic-did/](agentic-did/)** | Main codebase — MVP with React frontend, Fastify verifier API, SDK, and Midnight adapter. **Start here.** |
| **[consider/](consider/)** | Salvaged code from `AgenticDID_io_me_MAIN` — backend, contracts (19KB Compact contract), frontend, protocol layer, infrastructure configs. Under review for integration. |

## The Problem

In a world of autonomous AI agents, three critical questions arise:

1. **How do you trust your personal AI agent?** Malware could impersonate your assistant.
2. **How do agents prove authorization?** When your agent contacts your bank, how does it prove you authorized it?
3. **How do services verify authenticity?** When a bank's AI agent responds, how do you know it's not phishing?

## The Solution

AgenticDID.io solves these with **multi-party mutual authentication** and **delegation chains** using Midnight's zero-knowledge technology:

- **Privacy-Preserving Digital Identifiers (PIDs)** — Hash-based agent identities
- **Verifiable Presentations** — Proof bundles with selective disclosure
- **Capability Tokens** — Short-lived, key-bound authorization (DPoP-style)
- **Delegation Chains** — Users authorize agents with scopes, time limits, and revocation
- **Zero-Knowledge Proofs** — Verify everything, reveal nothing

## Quick Start

```bash
# Clone and run
cd agentic-did
bun install
bun run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8787

See [agentic-did/README.md](agentic-did/README.md) for full documentation, API reference, and architecture details.

---

## Part of the DIDz Ecosystem

AgenticDID extends [DIDz.io](https://github.com/bytewizard42i/didz-dapp-system) for autonomous AI agents. While DIDz handles human/organization/object identities, AgenticDID handles the unique challenges of AI agent identity: delegation, mutual authentication, and authorization chains.

Related products:
- **[DIDz.io](https://github.com/bytewizard42i/didz-dapp-system)** — Foundation identity layer (humans, orgs, objects)
- **[KYCz](https://github.com/bytewizard42i/KYCz_us_app)** — Zero-knowledge KYC verification
- **[HuddleBridge](https://github.com/bytewizard42i/huddlebridge_app_me_us)** — Video spaces with DIDz-verified participants
- **[MidnightVitals](https://github.com/bytewizard42i/MidnightVitals)** — Real-time diagnostics

---

## Hackathon Track Record

- **4x Midnight Hackathon Winner**
- **Google Cloud Run Hackathon** — Dual-stack innovation: Google ADK + Midnight ZK

---

*EnterpriseZK Labs LLC — [enterprisezk.com](https://enterprisezk.com)*  
*Built on Midnight. Powered by Cardano. Protected by zero-knowledge cryptography.*
