# 🔮 AgenticDID.io

**Midnight-powered, privacy-preserving identity protocol for AI agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Midnight Network](https://img.shields.io/badge/Midnight-Network-purple)](https://midnight.network)
[![Status: MVP](https://img.shields.io/badge/Status-MVP%20Complete-green)](https://github.com/bytewizard42i/AgenticDID_io_me)

AgenticDID.io lets AI agents prove authenticity and authorization using **privacy-preserving digital identifiers (PIDs)**, **verifiable credentials (VCs)**, and **zero-knowledge proofs (ZKPs)**—all without exposing private data. Built for the Midnight Network hackathon.

---

## 🎯 What It Does

AgenticDID.io provides a complete identity protocol for AI agents to:

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

**See [AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md) for complete walkthrough**

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

### Prerequisites

- Node.js >= 18
- npm or yarn
- Git

### Installation

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

### Run the Demo

```bash
# Start both API and frontend
npm run dev
```

Visit:
- **Frontend**: http://localhost:5175
- **API**: http://localhost:8787

### Try It Out (Phase 1 Demo)

1. **Select an agent** (Banker, Traveler, or Rogue)
2. **Choose an action** (Send $50, Buy Headphones, Book Flight)
3. **Watch the verification flow** in the timeline:
   - Challenge requested ✓
   - Proof bundle built ✓
   - Presented to verifier ✓
   - Verification result ✓
   - Action executed or blocked ✓

**Expected Results:**
- ✅ Banker sending $50 → **PASS**
- ✅ Traveler booking flight → **PASS**
- ❌ Rogue agent (any action) → **FAIL** (revoked)
- ❌ Wrong role for action → **FAIL** (unauthorized)

### Real-World Use Case

For a complete walkthrough of the **User → Personal Agent (Comet) → Bank Agent (BOA)** delegation flow, see:

**🎯 [AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md)** - Multi-party authentication & delegation explained

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

### **For Hackathon Judges & Users**
- **[AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md)** - 🎯 **START HERE** - Real-world use case walkthrough
  - Complete multi-party authentication flow
  - User ↔ Agent ↔ Service delegation chain
  - Security guarantees and privacy preservation
  - Step-up authentication and merchant protection
  - Technical implementation details
- **[PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md)** - 🔐 **Privacy-First Design**
  - Zero-knowledge verification (no tracking)
  - Spoof transaction system (white noise)
  - Selective disclosure proofs
  - AgenticDID.io as trusted issuer
  - Attack prevention strategies

### **Technical Documentation**
- **[RESOURCES.md](./RESOURCES.md)** - Complete link collection for Midnight Network
- **[MIDNIGHT_DEVELOPMENT_PRIMER.md](./MIDNIGHT_DEVELOPMENT_PRIMER.md)** - Coding guide for Compact and Midnight
- **[MIDNIGHT_INTEGRATION_GUIDE.md](./MIDNIGHT_INTEGRATION_GUIDE.md)** - Phase 2 implementation blueprint
- **[PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md)** - Step-by-step integration guide

### **Development Logs**
- **[AI-chat.md](./AI-chat.md)** - Development conversation log
- **[AIsisters.md](./AIsisters.md)** - Notes for the Triplet AI team

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
- Check the [RESOURCES.md](./RESOURCES.md) for helpful links
- Review the [MIDNIGHT_DEVELOPMENT_PRIMER.md](./MIDNIGHT_DEVELOPMENT_PRIMER.md) for coding help

---

**Built with 🔮 for the Midnight Network Hackathon**  
*Prove, then act. Without exposing private data.*
