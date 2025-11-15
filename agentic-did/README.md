# 🔮 AgenticDID.io

**The Identity Layer for the Agentic Web**  
*Privacy-preserving DIDs for humans, AI agents, and critical infrastructure for the "Fi" ecosystem*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Google Cloud Run](https://img.shields.io/badge/Google-Cloud_Run-4285F4)](https://cloud.google.com/run)
[![Status: MVP](https://img.shields.io/badge/Status-MVP%20Complete-green)](https://github.com/bytewizard42i/AgenticDID_io_me)
[![Production](https://img.shields.io/badge/Production-REAL--DEAL-blue)](../AgenticDID_io_me_REAL-DEAL/)

> 🏗️ **NEW**: Production issuer model implemented in **[REAL-DEAL repo](../AgenticDID_io_me_REAL-DEAL/)** with three-axis categorization (Type + Domain + Assurance).  
> See **[PRODUCTION_MODEL.md](./docs/PRODUCTION_MODEL.md)** for details on the new model and Stanford University multi-domain showcase.

AgenticDID is building **universal decentralized identifiers (DIDs)** for the agentic web - enabling humans, AI agents, and objects to prove authenticity and execute declarative tasks using **zero-knowledge proofs**, **verifiable credentials**, and **rational privacy** - all without exposing private data. We're creating the **identity infrastructure FOR the "Fi" ecosystem**, enabling other protocols to become Fi-compatible.

> 🌌 **The Big Picture**: 
> - **What is Fi?**: "Fi" (Fair Finance) is the larger ecosystem vision - AgenticDID provides the identity layer
> - **3-minute overview**: [VISION_SUMMARY.md](./docs/VISION_SUMMARY.md) - Quick understanding of our role
> - **Complete vision**: [GRAND_VISION.md](./docs/GRAND_VISION.md) - How AgenticDID enables the Fi ecosystem
> - **Current status**: [CURRENT_SCOPE.md](./docs/CURRENT_SCOPE.md) - What works NOW vs what's coming

### 🏆 Dual-Stack Innovation
- **Google Cloud Run**: Serverless deployment with Google ADK multi-agent orchestration
- **Midnight Network**: Zero-knowledge proof verification and privacy preservation
- **World's First**: Integration of Google's Agent Development Kit with blockchain privacy layer

> 📋 **For Hackathon Judges**: See [CLOUD_RUN_HACKATHON.md](./docs/CLOUD_RUN_HACKATHON.md) for complete submission details
> 🏆 **Submission Readiness**: See [HACKATHON_COMPLIANCE_REVIEW.md](./HACKATHON_COMPLIANCE_REVIEW.md) for compliance analysis
> 👋 **Get Started**: See [USER_START_HERE.md](./USER_START_HERE.md) for quick navigation

---

## 🎯 Current Scope vs Grand Vision

### What This Demo Does (Phase 1 - ✅ Complete)

**AgenticDID.io**: Privacy-preserving identity for **AI agents**

Focus: Enable AI agents to prove authenticity and authorization with zero-knowledge proofs

> *Inspired by Charles Hoskinson's insight that the future is about results, not processes - users state what they want to achieve, and the system handles the implementation.*
> 
> **Source**: [Crypto Crow Interview with Charles Hoskinson](https://www.youtube.com/watch?v=HybXioqRr9A) - October 15, 2025

### Future Scope (Phases 2-5 - 🔮 Roadmap)

**Universal Identity Protocol**: Extend to humans, objects, and agentic commerce

- 🔜 **Phase 2 (Q4 2025)**: DIDz Protocol for humans (age verification, biometrics, healthcare)
- 🔮 **Phase 3 (Q2 2026)**: Agentic commerce (declarative intents, agent marketplace, "buy me a hat")
- 🔮 **Phase 4 (Q3 2026)**: Cross-chain intentions (capacity exchange, trustless routing)
- 🔮 **Phase 5 (2027+)**: "Fi" economics (fair distribution, cooperative consensus, no ponzinomics)

**See [GRAND_VISION.md](./docs/GRAND_VISION.md) for complete roadmap and philosophical foundation**

---

## 🎯 What the Current Demo Does

AgenticDID.io provides a complete identity protocol for AI agents with a **results-focused approach**:

- **Results-first UX** - Pick your goal ("Buy Headphones"), system auto-selects the right agent
- **Prove who they are** - Using privacy-preserving digital identifiers
- **Prove what they can do** - Via verifiable credentials with role/scope claims  
- **Execute authorized actions** - Without revealing unnecessary private information
- **Maintain privacy** - Through zero-knowledge proofs and selective disclosure
- **Enable safe delegation** - Users can authorize agents to act on their behalf with granular controls
- **Establish mutual trust** - Bidirectional authentication between users, agents, and services

### The Problem We Solve

In a world of autonomous AI agents, critical questions arise:

1. **How do you trust your personal AI agent?** When malware could impersonate your assistant, how do you verify it's really your agent?
2. **How do agents prove authorization?** When your agent contacts your bank, how does it prove you authorized it to act on your behalf?
3. **How do services verify authenticity?** When a bank's AI agent responds, how do you know it's not a phishing attack?

AgenticDID.io solves these with **multi-party mutual authentication** and **delegation chains** using Midnight's ZK technology:
- Users ↔ Agents verify each other (prevent malware impersonation)
- Users delegate authority to agents (with scopes, time limits, revocation)
- Agents ↔ Services verify each other (prevent phishing, ensure authenticity)
- All with zero-knowledge proofs that preserve privacy

---

## ✨ Features

### Phase 1 - MVP (✅ Complete)
- ✅ **Privacy-Preserving Digital Identifiers (PIDs)** - Hash-based agent identities
- ✅ **Verifiable Presentations (VPs)** - Proof bundles with selective disclosure
- ✅ **Challenge-Response Flow** - Nonce-based replay protection
- ✅ **Capability Tokens** - Short-lived, key-bound authorization tokens (DPoP-style)
- ✅ **Role-Based Access Control** - Banker, Traveler, Admin roles with scopes
- ✅ **Mock Midnight Adapter** - Simulates credential verification
- ✅ **Interactive Demo UI** - Real-time verification timeline
- ✅ **Verifier API** - Fastify-based Midnight Gatekeeper
- ✅ **"Listen In" Mode** 🎤 - Revolutionary transparency/efficiency toggle:
  - **Listen In Mode**: Hear all agent communications via Text-to-Speech (~10-15s)
  - **Fast Mode**: Silent machine-speed execution (~2-3s, 80%+ faster!)
  - Shows execution time comparison and efficiency gains
  - Demonstrates agents can communicate transparently OR efficiently
  - Educational for understanding multi-agent orchestration

### Phase 2 - Real Midnight Integration (🔜 Planned)
- 🔜 **Bidirectional Authentication** - User ↔ Agent mutual DID verification
- 🔜 **Delegation Credentials** - Merkle proof-based authorization chains
- 🔜 **Multi-Party Workflows** - User → Agent → Service verification flows
- 🔜 **Compact Smart Contracts** - On-chain credential & delegation registry
- 🔜 **Real ZK Proofs** - Midnight proof server integration
- 🔜 **Lace Wallet Integration** - User DID management
- 🔜 **Trusted Issuer Network** - BOA, airlines, etc. as verifiers
- 🔜 **Devnet Deployment** - Live on Midnight testnet
- 🔜 **Credential Revocation** - On-chain state management
- 🔜 **Audit Logging** - Cryptographically signed interaction logs

---

## 🏭️ Architecture

### **Phase 1: Current MVP (Single-Direction Verification)**

```
┌─────────────────┐
│  React Frontend │ ← User Interface
│   (Port 5175)   │
└────────┬────────┘
         │
         ↓ API Calls
┌─────────────────────────┐
│   Verifier API          │ ← Midnight Gatekeeper
│   (Fastify - Port 8787)│
└────────┬────────────────┘
         │
         ↓ Verification
┌─────────────────────────┐
│  Midnight Adapter       │ ← Mock Verification (MVP)
│  (SDK Integration)      │
└─────────────────────────┘
```

### **Phase 2: Multi-Party Delegation (Target Architecture)**

```
┌───────────────┐               ┌─────────────────────┐
│     USER       │               │   EXTERNAL SERVICE   │
│  (Lace Wallet) │               │    (e.g., BOA Agent)  │
└──────┬────────┘               └─────────┬───────────┘
       │                                    │
       │ 1. Mutual Authentication          │
       │ 2. Delegation Grant               │
       │    (Merkle Proof)                 │
       │                                    │
       ↓                                    │
┌──────────────────┐                       │
│  PERSONAL AGENT  │                       │
│     (Comet)     │ ← Local AI Assistant     │
│  (Port 5175)    │                       │
└────────┬─────────┘                       │
         │                                    │
         │ 3. Request + Delegation Proof    │
         │ 4. Verify Service Identity (ZKP) │
         └────────────────────────────────────┘
                              │
                              ↓ All Verifications
                   ┌────────────────────────────┐
                   │   AgenticDID Registry    │
                   │   (Minokawa Contract)    │ ← On-Chain State
                   │    Midnight Network      │
                   └────────────────────────────┘
```

**See [AGENT_DELEGATION_WORKFLOW.md](./docs/AGENT_DELEGATION_WORKFLOW.md) for complete walkthrough**

### Proof Flow (Phase 1 MVP)

```
1. Agent requests challenge
   ↓
2. Verifier returns {nonce, aud, exp}
   ↓
3. Agent builds VP (proof bundle):
   - Sign challenge
   - Attach minimal claims
   - Include Midnight receipt
   ↓
4. Verifier checks:
   - Signature valid?
   - Receipt valid?
   - Role matches?
   - Not revoked?
   ↓
5. Issue capability token
   ↓
6. Agent executes authorized action
```

### Multi-Party Delegation Flow (Phase 2 Target)

```
1. User ↔ Comet: Mutual DID authentication
   ↓
2. User → Comet: Grant delegation (Merkle proof)
   Scopes: [bank:read, bank:transfer]
   ↓
3. User: "Comet, check my BOA balance"
   ↓
4. Comet → BOA Agent: Request + Delegation proof
   ↓
5. BOA Agent → Comet: DID + ZKP (verified via Midnight)
   ↓
6. Comet verifies: "This is the real BOA agent" ✓
   ↓
7. BOA verifies: "User authorized Comet" ✓
   ↓
8. BOA → Comet: Account balance
   ↓
9. Comet → User: "Your balance is $2,847.53" ✓
   All interactions logged with cryptographic proofs
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended for Judges & Reviewers) 🐳

**One command to run everything:**

```bash
# Clone and run with Docker
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me
./docker-quickstart.sh
```

Or manually:
```bash
docker-compose up
```

**That's it!** Open http://localhost:5173 in your browser.

**Stop the demo:**
```bash
docker-compose down
```

---

### Option 2: Local Development (Bun)

**Prerequisites:**
- Bun >= 1.2 (https://bun.sh)
- Git

**Installation:**

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me

# Install dependencies (10x faster with Bun!)
bun install

# Run both services
bun run dev
```

**Visit:**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8787

---

### Option 3: Local Development (npm)

**Prerequisites:**
- Node.js >= 18
- npm or yarn
- Git

**Installation:**

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/AgenticDID_io_me.git
cd AgenticDID_io_me

# Install dependencies
npm install

# Set up environment variables
cp apps/verifier-api/.env.example apps/verifier-api/.env
cp apps/web/.env.example apps/web/.env

# Build packages
npm --prefix packages/agenticdid-sdk run build
npm --prefix packages/midnight-adapter run build
npm --prefix apps/verifier-api run build
```

**Run the Demo:**

```bash
# Start both API and frontend
npm run dev
```

**Visit:**
- **Frontend**: http://localhost:5175
- **API**: http://localhost:8787

### Try It Out (Phase 1 Demo) - Results-Focused UX

**New Workflow (Oct 2025):**
1. **Pick what you want to do** - "Buy Headphones", "Send Money", or "Book Flight"
2. **System auto-selects** the appropriate agent for you
3. **Watch the verification flow** in the timeline:
   - Challenge requested ✓
   - Proof bundle built ✓
   - Presented to verifier ✓
   - Verification result ✓
   - Action executed or blocked ✓

**What Happens:**
- 🎧 Click "Buy Headphones" → Amazon Shopper agent automatically selected → **PASS**
- 💸 Click "Send $50" → Banker agent automatically selected → **PASS**
- 🛫 Click "Book Flight" → Traveler agent automatically selected → **PASS**
- 🚨 Manual select Rogue agent → Any action → **FAIL** (credential revoked)

**Why This Matters:**
Instead of thinking in terms of tools and processes, users simply state their intent. The system intelligently routes to the appropriate authorized agent - **results over processes**.

### Real-World Use Case

For a complete walkthrough of the **User → Personal Agent (Comet) → Bank Agent (BOA)** delegation flow, see:

**🎯 [AGENT_DELEGATION_WORKFLOW.md](./docs/AGENT_DELEGATION_WORKFLOW.md)** - Multi-party authentication & delegation explained

---

## 📦 Project Structure

```
AgenticDID_io_me/
├── apps/
│   ├── web/                          # React frontend (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── components/           # UI components
│   │   │   ├── agents.ts             # Agent definitions
│   │   │   ├── api.ts                # API client
│   │   │   └── App.tsx               # Main app
│   │   └── package.json
│   └── verifier-api/                 # Midnight Gatekeeper (Fastify)
│       ├── src/
│       │   ├── challenge.ts          # Challenge generation
│       │   ├── verifier.ts           # VP verification
│       │   ├── token.ts              # Capability tokens
│       │   ├── routes.ts             # API endpoints
│       │   └── index.ts              # Server entry
│       └── package.json
├── packages/
│   ├── agenticdid-sdk/               # Core protocol SDK
│   │   ├── src/
│   │   │   ├── types.ts              # Type definitions
│   │   │   ├── crypto.ts             # PID generation
│   │   │   ├── proof.ts              # VP assembly
│   │   │   └── agent.ts              # Agent management
│   │   └── package.json
│   └── midnight-adapter/             # Blockchain adapter
│       ├── src/
│       │   ├── adapter.ts            # Verification logic
│       │   └── types.ts              # Adapter types
│       └── package.json
├── contracts/
│   └── minokawa/                     # Compact contracts (Phase 2)
│       ├── AgenticDIDRegistry.compact
│       └── scripts/
├── media/                            # Brand assets
├── scripts/                          # Build/deploy scripts
├── RESOURCES.md                      # Link collection
├── MIDNIGHT_DEVELOPMENT_PRIMER.md    # Coding guide
├── MIDNIGHT_INTEGRATION_GUIDE.md     # Phase 2 blueprint
└── package.json                      # Monorepo root
```

---

## 🔌 API Reference

### Verifier API Endpoints

#### `POST /challenge`
Request a fresh challenge for proof generation.

**Request:**
```json
{
  "audience": "agenticdid.io"
}
```

**Response:**
```json
{
  "nonce": "base64url-encoded-random-bytes",
  "aud": "agenticdid.io",
  "exp": 1729134567890
}
```

#### `POST /present`
Present a verifiable presentation and receive capability token.

**Request:**
```json
{
  "vp": {
    "pid": "pid:xxxx",
    "proof": "signature-over-challenge",
    "sd_proof": "selective-disclosure-proof",
    "disclosed": {
      "role": "Banker",
      "scopes": ["bank:transfer"]
    },
    "receipt": {
      "attestation": "midnight-receipt",
      "cred_hash": "credential-hash"
    }
  },
  "challenge_nonce": "nonce-from-challenge"
}
```

**Response (Success - 200):**
```json
{
  "token": "jwt-capability-token",
  "pid": "pid:xxxx",
  "role": "Banker",
  "scopes": ["bank:transfer"],
  "expires_in": 120
}
```

**Response (Failure - 403):**
```json
{
  "error": "Credential revoked"
}
```

#### `GET /verify?token=<token>`
Verify a capability token.

**Response:**
```json
{
  "valid": true,
  "claims": {
    "sub": "pid:xxxx",
    "scope": ["bank:transfer"],
    "exp": 1729134567
  }
}
```

---

## 🛠️ Development

### Monorepo Commands

```bash
# Install all dependencies
npm install

# Run dev servers (API + Web)
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Clean build artifacts
npm run clean
```

### Package-Specific Commands

```bash
# Build SDK
npm --prefix packages/agenticdid-sdk run build

# Build Adapter
npm --prefix packages/midnight-adapter run build

# Build API
npm --prefix apps/verifier-api run build

# Build Web
npm --prefix apps/web run build
```

### Environment Variables

**Verifier API** (`apps/verifier-api/.env`):
```bash
PORT=8787
JWT_SECRET=your-secret-key
TOKEN_TTL_SECONDS=120
MIDNIGHT_ADAPTER_URL=http://localhost:8788
NODE_ENV=development
```

**Web** (`apps/web/.env`):
```bash
VITE_API_BASE=http://localhost:8787
```

---

## 📚 Documentation

### **🌌 Vision & Philosophy**
- **[GRAND_VISION.md](./docs/GRAND_VISION.md)** - 🌟 **START HERE** - Complete vision from identity to "Fi"
  - Synthesis of 3 foundational packets (Grok, Hoskinson, DIDz)
  - Universal identity for humans, AI agents, and objects
  - Roadmap from current demo to agentic commerce to fair finance
  - Novel innovations (spoof transactions, Listen In Mode, results-focused UX)
  - Alignment with Midnight Network architecture
- **[DIDZ_SUITE_ARCHITECTURE.md](./docs/DIDZ_SUITE_ARCHITECTURE.md)** - Complete protocol suite architecture
- **[WINNING_ROADMAP_FOR_JOHN.md](./docs/WINNING_ROADMAP_FOR_JOHN.md)** - Hackathon strategy & tool recommendations

### **Quick Start**
- **[USER_START_HERE.md](./USER_START_HERE.md)** - 👋 Quick navigation guide for users
- **[LINKS_TOOLS.md](./LINKS_TOOLS.md)** - 🔗 All resources organized by category
- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Get running in 2 minutes

### **For Hackathon Judges & Users**
- **[AGENT_DELEGATION_WORKFLOW.md](./docs/AGENT_DELEGATION_WORKFLOW.md)** - 🎯 Real-world use case walkthrough
  - Complete multi-party authentication flow
  - User ↔ Agent ↔ Service delegation chain
  - Security guarantees and privacy preservation
  - Step-up authentication and merchant protection
  - Technical implementation details
- **[PRIVACY_ARCHITECTURE.md](./docs/PRIVACY_ARCHITECTURE.md)** - 🔐 Privacy-First Design
  - Zero-knowledge verification (no tracking)
  - Spoof transaction system (white noise)
  - Selective disclosure proofs
  - AgenticDID.io as trusted issuer
  - Attack prevention strategies
- **[CLOUD_RUN_HACKATHON.md](./docs/CLOUD_RUN_HACKATHON.md)** - Complete hackathon submission

### **Technical Documentation**
- **[docs/reference/RESOURCES.md](./docs/reference/RESOURCES.md)** - Complete link collection for Midnight Network
- **[docs/MIDNIGHT_INTEGRATION_PLAN.md](./docs/MIDNIGHT_INTEGRATION_PLAN.md)** - Phase 2 implementation blueprint
- **[docs/PHASE2_IMPLEMENTATION.md](./docs/PHASE2_IMPLEMENTATION.md)** - Step-by-step integration guide
- **[docs/reference/PROJECT_STRUCTURE.md](./docs/reference/PROJECT_STRUCTURE.md)** - Code organization

### **Development Logs**
- **[docs/technical/AI-DEVELOPMENT-LOG.md](./docs/technical/AI-DEVELOPMENT-LOG.md)** - Development journey
- **[docs/AIsisters.md](./docs/AIsisters.md)** - Notes for the AI team
- **[archive/session-logs/](./archive/session-logs/)** - Session summaries

---

## 🧪 Testing

### Manual Testing

1. Start the dev servers: `npm run dev`
2. Open http://localhost:5175
3. Test each agent type with different actions
4. Verify expected pass/fail results

### Expected Outcomes (Phase 1)

| Agent | Action | Expected | Reason |
|-------|--------|----------|--------|
| Banker | Send $50 | ✅ PASS | Correct role + scope |
| Banker | Book Flight | ❌ FAIL | Wrong scope |
| Banker | Buy Headphones | ❌ FAIL | Wrong role |
| Traveler | Book Flight | ✅ PASS | Correct role + scope |
| Traveler | Send $50 | ❌ FAIL | Wrong role |
| Traveler | Buy Headphones | ❌ FAIL | Wrong role |
| Amazon Shopper | Buy Headphones | ✅ PASS | Authorized merchant agent |
| Amazon Shopper | Send $50 | ❌ FAIL | Wrong role |
| Rogue | Any Action | ❌ FAIL | Revoked credential |

### Expected Outcomes (Phase 2 - Multi-Party)

| Scenario | User Auth | Agent Auth | Delegation | Service Auth | Result |
|----------|-----------|------------|------------|--------------|--------|
| User → Comet → BOA (balance) | ✓ | ✓ | ✓ bank:read | ✓ | ✅ PASS |
| User → Comet → BOA (transfer) | ✓ | ✓ | ✓ bank:transfer | ✓ | ✅ PASS |
| Malware → BOA | ✗ | ✗ | ✗ | ✓ | ❌ FAIL (no auth) |
| User → Comet → Fake BOA | ✓ | ✓ | ✓ | ✗ | ❌ FAIL (phishing) |
| User → Comet (expired delegation) | ✓ | ✓ | ✗ | ✓ | ❌ FAIL (expired) |

---

## 🚢 Deployment

### Phase 1 (Current - Mock Mode)

The current MVP runs entirely locally with a mock Midnight adapter.

```bash
# Build for production
npm run build

# Start production server
cd apps/verifier-api && npm start
cd apps/web && npm run preview
```

### Phase 2 (Planned - Real Midnight)

Will deploy to Midnight devnet with real contracts:

1. Write Compact contracts
2. Compile to TypeScript API
3. Deploy to Midnight devnet
4. Update adapter with contract address
5. Enable Lace wallet integration
6. Test on devnet with tDUST

---

## 🤝 Contributing

This project was built for the Midnight Network hackathon. Contributions welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- **Midnight Network** - For the incredible ZK infrastructure and hackathon opportunity
- **Mesh SDK Team** - For the excellent developer tools and documentation
- **The Triplet Team** - Alice (architecture), Cassie (implementation), Casey (maintenance)
- **John Santi** - Product vision, real-world use cases, and guidance

---

## 🔗 Links

- **Midnight Network**: https://midnight.network
- **Documentation**: https://docs.midnight.network
- **Mesh SDK**: https://meshjs.dev/midnight
- **GitHub Org**: https://github.com/midnightntwrk

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check [USER_START_HERE.md](./USER_START_HERE.md) for navigation
- Check [LINKS_TOOLS.md](./LINKS_TOOLS.md) for all resources
- Review [docs/reference/RESOURCES.md](./docs/reference/RESOURCES.md) for Midnight links

---

**Built with 🔮 for the Midnight Network Hackathon**  
*Prove, then act. Without exposing private data.*
