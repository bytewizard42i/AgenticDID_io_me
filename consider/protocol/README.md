# AgenticDID Protocol Layer

**Midnight Network Smart Contracts & Blockchain Integration**

---

## 📁 Directory Structure

```
protocol/
├── contracts/              ← Compact smart contracts (.compact files)
│   ├── AgenticDIDRegistry.compact
│   ├── CredentialVerifier.compact
│   ├── ProofStorage.compact
│   ├── test_minimal.compact
│   ├── README.md          ← Contract documentation
│   └── COMPILATION_STATUS.md
│
├── compiled/              ← Compiled contract output (gitignored)
│   ├── registry/
│   ├── verifier/
│   └── storage/
│
├── scripts/               ← Compilation & deployment scripts
│   ├── compile-all.sh    ← Compile all contracts
│   ├── compile-fast.sh   ← Fast compile (no ZK keys)
│   ├── compile-registry.sh
│   ├── compile-verifier.sh
│   └── compile-storage.sh
│
├── docs/                  ← Midnight & Compact documentation
│   └── (to be added)
│
├── package.json          ← Midnight dependencies
└── README.md             ← This file
```

---

## 🎯 Purpose

This directory contains all **blockchain/protocol layer** components for AgenticDID:

- **Smart Contracts**: Compact language contracts for Midnight Network
- **Compilation Tools**: Scripts to build contracts with ZK circuits
- **Documentation**: Protocol specs, Midnight guides, Compact language docs

**Separation Philosophy**:
- Backend services (`/backend`) handle HTTP/API layer
- Protocol layer (`/protocol`) handles blockchain/ZK proof layer
- Clean separation = modular architecture

---

## 🏗️ Smart Contracts

### 1. AgenticDIDRegistry.compact

**Purpose**: On-chain agent identity and credential registry

**Key Functions**:
- `registerAgent()` - Register new agent with DID and credentials
- `revokeDelegation()` - Revoke agent permissions
- `getDelegation()` - Query delegation status
- `checkRevocation()` - Check if agent is revoked

**Storage**:
- Agent credentials (role, scopes, keys)
- Delegations (user → agent permissions)
- Revocation bitmap

### 2. CredentialVerifier.compact

**Purpose**: ZK proof verification and credential validation

**Key Functions**:
- `verifyPresentation()` - Verify VP with zero-knowledge proof
- `generateSpoofQuery()` - Create privacy-preserving noise transactions
- `checkCredentialStatus()` - Query credential state

**Privacy Features**:
- Selective disclosure (prove role without revealing other attributes)
- Spoof transactions (80% noise to hide real queries)

### 3. ProofStorage.compact

**Purpose**: Store and retrieve ZK proofs

**Key Functions**:
- `storeProof()` - Save verification proof
- `getProof()` - Retrieve historical proof
- `revokeProof()` - Mark proof as invalid

---

## 🔧 Compilation

### Quick Start

```bash
# Development mode (fast, no ZK keys)
bun run compile:fast

# Production mode (full build with ZK keys)
bun run compile
```

### Manual Compilation

```bash
# All contracts
./scripts/compile-all.sh

# Fast mode (development)
./scripts/compile-all.sh --fast

# Individual contracts
./scripts/compile-registry.sh
./scripts/compile-verifier.sh
./scripts/compile-storage.sh
```

### Using Docker Directly

```bash
docker run --rm \
  -v "$(pwd)/contracts:/work" \
  midnightnetwork/compactc:latest \
  "compactc /work/AgenticDIDRegistry.compact /work/compiled/registry/"
```

---

## 📦 Dependencies

### Midnight Network

All Midnight dependencies are in this `protocol/` directory:

```json
{
  "@midnight-ntwrk/compact-runtime": "^0.9.0",
  "@midnight-ntwrk/midnight-js-types": "^0.1.0"
}
```

**Installation**:
```bash
cd protocol
bun install
```

### Compiler

**Docker Image**: `midnightnetwork/compactc:latest`

- Minokawa 0.18.0 language
- Compact compiler 0.26.0
- ZK circuit generator
- No local installation needed (runs in Docker)

---

## 🚀 Integration with Backend

### Backend → Midnight Gateway Service

The `backend/midnight/` service (Phase 3) will:

1. **Load compiled contracts** from `protocol/compiled/`
2. **Connect to Midnight Network** via RPC
3. **Submit transactions** to contracts
4. **Verify ZK proofs** on-chain
5. **Return results** to API Gateway

### Example Integration

```typescript
// backend/midnight/src/contract-client.ts
import { ContractInstance } from '@midnight-ntwrk/midnight-js-types';
import registryArtifacts from '../../../protocol/compiled/registry/contract/index.cjs';

const registry = new ContractInstance({
  artifacts: registryArtifacts,
  address: REGISTRY_CONTRACT_ADDRESS,
});

// Call contract
const result = await registry.query('getDelegation', [delegationId]);
```

---

## 🔐 Security & Privacy

### Witness Disclosure

All contracts properly use `disclose()` for witness data:

```compact
// ✅ Correct
agentCredentials.insert(disclose(did), disclose(credential));

// ❌ Wrong (leaks witness data)
agentCredentials.insert(did, credential);
```

### Privacy Model

**Public (on-chain)**:
- DID hashes
- Role hashes
- Scope hashes
- Revocation status

**Private (off-chain)**:
- Private keys
- Full credential details
- Proof witnesses
- User identities

---

## 📊 Compilation Status

**All contracts compile successfully** ✅

See `contracts/COMPILATION_STATUS.md` for details:
- All witness disclosure violations fixed
- All structural issues resolved
- Type safety maintained
- Ready for deployment

---

## 🧪 Testing

### Unit Tests (Compact)

```bash
# Test minimal contract
compactc --test contracts/test_minimal.compact
```

### Integration Tests (TypeScript)

```typescript
// In backend/midnight/src/tests/
import { MidnightClient } from '@midnight-ntwrk/midnight-js';

const client = new MidnightClient({
  network: 'testnet',
  rpcUrl: 'https://rpc.testnet.midnight.network'
});

// Test contract deployment and calls
```

---

## 🌐 Deployment

### Testnet Deployment

1. **Compile contracts** with full ZK keys:
   ```bash
   bun run compile
   ```

2. **Deploy to Midnight Testnet**:
   ```bash
   midnight-cli deploy \
     --network testnet \
     --contract ./compiled/registry/contract/index.cjs \
     --keys ./compiled/registry/keys/
   ```

3. **Save contract addresses**:
   ```bash
   echo "REGISTRY_ADDRESS=0xABC..." >> ../backend/midnight/.env
   ```

### Mainnet Deployment

**Prerequisites**:
- Security audit completed
- Full test suite passing
- Performance benchmarks met
- Governance approval (if required)

---

## 📚 Documentation

### Compact Language

- **Official Docs**: https://docs.midnight.network/compact
- **Language Spec**: Minokawa 0.18.0
- **Examples**: See `reference-repos/example-counter`

### Midnight Network

- **Docs**: https://docs.midnight.network
- **Testnet**: https://testnet.midnight.network
- **Status**: https://status.midnight.network

### Internal Docs

Located in `contracts/`:
- `README.md` - Contract architecture and patterns
- `COMPILATION_STATUS.md` - Build status and fixes applied

---

## 🔄 Development Workflow

### 1. Modify Contracts

Edit `.compact` files in `contracts/`:
- Follow privacy patterns (use `disclose()`)
- Maintain type safety
- Document changes

### 2. Compile

```bash
bun run compile:fast  # Quick iteration
```

### 3. Test

```bash
# Unit tests
compactc --test contracts/test_minimal.compact

# Integration tests
cd ../backend/midnight && bun test
```

### 4. Deploy

```bash
# Testnet
./scripts/deploy-testnet.sh

# Update backend .env with addresses
```

---

## 🎯 Phase 3 Integration Plan

**When building Midnight Gateway service** (Phase 3):

1. **Install this protocol package**:
   ```bash
   cd backend/midnight
   bun add file:../../protocol
   ```

2. **Import compiled contracts**:
   ```typescript
   import registry from '@agenticdid/protocol/compiled/registry';
   ```

3. **Connect to network**:
   ```typescript
   const client = new MidnightClient({ network: 'testnet' });
   ```

4. **Call contracts**:
   ```typescript
   const result = await registry.query('getDelegation', [id]);
   ```

---

## 📝 Notes

### Why Separate Directory?

**Modularity**:
- Backend services are HTTP/API layer
- Protocol is blockchain/ZK proof layer
- Clean separation of concerns
- Independent versioning

**Reusability**:
- Protocol package can be used by:
  - Backend services
  - Frontend (for direct queries)
  - CLI tools
  - Other projects

**Deployment**:
- Contracts deployed once to blockchain
- Backend services can be updated independently
- No tight coupling

---

## 🚀 Quick Commands

```bash
# Compile all contracts (fast mode)
bun run compile:fast

# Compile for production (with ZK keys)
bun run compile

# Clean build artifacts
bun run clean

# Install dependencies
bun install
```

---

## 📖 Resources

- **Midnight Network**: https://midnight.network
- **Compact Docs**: https://docs.midnight.network/compact
- **Demo Contracts**: `../AgenticDID_DEMO-LAND/agentic-did/contracts/`
- **Phase 3 Plan**: `../BUILDING_STATUS.md`

---

**Last Updated**: Nov 14, 2025  
**Status**: ✅ Contracts migrated from demo, ready for Phase 3 integration
