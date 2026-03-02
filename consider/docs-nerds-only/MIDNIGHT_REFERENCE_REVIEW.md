# Midnight Reference Repository Review

**Date**: November 14, 2025, 9:30am  
**Last Updated**: Nov 14, 2025, 10:45am  
**Next Review**: After Phase 3 (Midnight Gateway) complete  
**Status**: Acknowledged and action items documented
**Source**: `/AgenticDID_DEMO-LAND/reference-repos/example-counter/`  
**Purpose**: Guide Phase 3 (Midnight Gateway) implementation

---

## 📚 Additional Resources

### Mesh.js & Edda Labs APIs

See **[MESHJS_EDDA_MIDNIGHT_APIS.md](./MESHJS_EDDA_MIDNIGHT_APIS.md)** for:
- Mesh.js SDK packages and capabilities
- React components for Midnight
- Edda Labs educational resources
- Comparison: Official SDK vs Mesh.js
- Integration patterns and examples

### Reference Repositories

**Location**: `/AgenticDID_DEMO-LAND/reference-repos/`

**Now includes**:
1. ✅ `example-counter/` - Official Midnight counter example
2. ✅ `compact-contracts/` - OpenZeppelin security patterns
3. ⭐ `midnight/` - **NEW** MeshJS SDK monorepo (89MB)
4. ⭐ `midnight-starter-template/` - **NEW** MeshJS starter template (3.4MB)

**Total**: 4 reference repos, ~100MB of examples and patterns

---

## 📚 Key Learnings from Official Midnight Example

### 1. **Local Development Setup** ✅

#### Proof Server Configuration

**Three deployment modes available**:

1. **Undeployed/Standalone** (`proof-server.yml`):
   ```yaml
   services:
     proof-server:
       image: "midnightnetwork/proof-server:4.0.0"
       command: ["midnight-proof-server --network undeployed"]
       ports:
         - "6300:6300"
       environment:
         RUST_BACKTRACE: "full"
   ```
   - Use for local development without testnet dependency ✅
   - **This is what we want for hackathon!**

2. **DevNet** (`proof-server-devnet.yml`):
   ```yaml
   command: ["midnight-proof-server --network devnet"]
   ```

3. **TestNet** (`proof-server-testnet.yml`):
   ```yaml
   command: ["midnight-proof-server --network testnet"]
   ```

#### Full Local Stack (`standalone.yml`)

For complete local development, they run:
- **Proof Server** (port 6300)
- **Midnight Node** (`midnightnetwork/midnight-node:0.12.0`, port 9944)
- **Indexer** (`midnightntwrk/indexer-standalone:2.1.1`, port 8088)

**Dependency chain**: `node → indexer → proof-server`

---

### 2. **Midnight SDK Versions** 📦

From their `package.json` (v2.0.2):

```json
{
  "dependencies": {
    "@midnight-ntwrk/compact-runtime": "^0.9.0",
    "@midnight-ntwrk/ledger": "^4.0.0",
    "@midnight-ntwrk/midnight-js-contracts": "2.0.2",
    "@midnight-ntwrk/midnight-js-http-client-proof-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-indexer-public-data-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-level-private-state-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-node-zk-config-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-types": "2.0.2",
    "@midnight-ntwrk/wallet": "5.0.0",
    "@midnight-ntwrk/wallet-api": "5.0.0",
    "@midnight-ntwrk/zswap": "^4.0.0",
    "pino": "^10.1.0",
    "ws": "^8.18.3"
  }
}
```

**Key packages for Phase 3**:
- ✅ `@midnight-ntwrk/midnight-js-contracts` - Contract client
- ✅ `@midnight-ntwrk/midnight-js-http-client-proof-provider` - Proof server client
- ✅ `@midnight-ntwrk/midnight-js-indexer-public-data-provider` - Indexer client
- ✅ `@midnight-ntwrk/midnight-js-node-zk-config-provider` - ZK config loader
- ✅ `@midnight-ntwrk/midnight-js-types` - TypeScript types
- ✅ `@midnight-ntwrk/wallet` - Wallet integration

---

### 3. **Configuration Patterns** 🔧

They use **config classes** for different environments:

```typescript
// config.ts
export interface Config {
  readonly logDir: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

export class StandaloneConfig implements Config {
  logDir = path.resolve(currentDir, '..', 'logs', 'standalone', `${new Date().toISOString()}.log`);
  indexer = 'http://127.0.0.1:8088/api/v1/graphql';
  indexerWS = 'ws://127.0.0.1:8088/api/v1/graphql/ws';
  node = 'http://127.0.0.1:9944';
  proofServer = 'http://127.0.0.1:6300';
  
  constructor() {
    setNetworkId(NetworkId.Undeployed); // Important!
  }
}

export class TestnetRemoteConfig implements Config {
  indexer = 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
  indexerWS = 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
  node = 'https://rpc.testnet-02.midnight.network';
  proofServer = 'http://127.0.0.1:6300'; // Still local!
  
  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}
```

**Key insight**: Even with remote testnet, proof server runs **locally** for privacy!

---

### 4. **Contract Compilation** 🔨

#### Compact Compiler Setup

**Install**:
```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

source $HOME/.local/bin/env
compact compile --version  # Should show 0.25.0
```

**Compile command**:
```bash
compact compile src/counter.compact src/managed/counter
```

**Output structure**:
```
src/managed/counter/
├── contract/
│   ├── index.cjs         # Contract bytecode
│   └── index.d.ts        # TypeScript bindings
└── circuit/
    ├── increment.cjs     # Circuit implementation
    └── keys/             # ZK proving/verifying keys
```

#### Build Script Pattern

```json
{
  "scripts": {
    "compact": "compact compile src/counter.compact src/managed/counter",
    "build": "rm -rf dist && tsc --project tsconfig.build.json && cp -Rf ./src/managed ./dist/managed && cp ./src/counter.compact ./dist"
  }
}
```

**Important**: Must copy `managed/` folder to `dist/` for runtime!

---

### 5. **Compact Language Patterns** 📝

From `counter.compact`:

```compact
pragma language_version >= 0.16 && <= 0.18;

import CompactStandardLibrary;

// Public state on ledger
export ledger round: Counter;

// Circuit (transition function)
export circuit increment(): [] {
  round.increment(1);
}
```

**Key patterns**:
- ✅ `pragma language_version` - Version constraint
- ✅ `export ledger` - Public state (on blockchain)
- ✅ `export circuit` - ZK transition function
- ✅ Type annotations required
- ✅ Must import `CompactStandardLibrary`

**Our contracts already follow these patterns!** ✅

---

### 6. **Docker Compose Setup** 🐳

#### Proof Server Only (Recommended for us)

```yaml
# docker-compose.proof-server.yml
services:
  proof-server:
    image: "midnightnetwork/proof-server:4.0.0"
    command: ["midnight-proof-server --network undeployed"]
    ports:
      - "6300:6300"
    environment:
      RUST_BACKTRACE: "full"
```

**Usage**:
```bash
docker compose -f docker-compose.proof-server.yml up -d
```

#### Full Local Stack (Optional)

```yaml
# docker-compose.midnight-local.yml
services:
  node:
    image: 'midnightnetwork/midnight-node:0.12.0'
    ports:
      - "9944:9944"
    environment:
      CFG_PRESET: "dev"

  indexer:
    image: 'midnightntwrk/indexer-standalone:2.1.1'
    ports:
      - "8088:8088"
    environment:
      APP__INFRA__NODE__URL: "ws://node:9944"
    depends_on:
      - node

  proof-server:
    image: "midnightnetwork/proof-server:4.0.0"
    command: ["midnight-proof-server --network undeployed"]
    ports:
      - "6300:6300"
```

---

### 7. **Testing Strategy** 🧪

From `TESTING.md`:

1. ✅ Compile contract
2. ✅ Build TypeScript
3. ✅ Start proof server
4. ✅ Create wallet
5. ✅ Fund wallet (faucet for testnet)
6. ✅ Deploy contract
7. ✅ Call contract functions
8. ✅ Verify state changes

**For hackathon**: We'll skip wallet/deployment and focus on proof verification!

---

## 🎯 Application to Our Phase 3

### What We Need to Build

**Backend Service**: `backend/midnight/`

```
backend/midnight/
├── docker-compose.proof-server.yml  ← Run local proof server
├── package.json                     ← Midnight SDK dependencies
├── tsconfig.json                    ← TypeScript config
├── src/
│   ├── config.ts                    ← Environment configs
│   ├── index.ts                     ← Fastify server
│   ├── proof-client.ts              ← Connect to proof server
│   ├── contract-loader.ts           ← Load compiled contracts from protocol/
│   ├── verifier.ts                  ← ZK proof verification logic
│   └── types.ts                     ← TypeScript types
├── Dockerfile                       ← Container (NOT including proof server)
└── .env.example                     ← Config template
```

### Dependencies to Install

```json
{
  "dependencies": {
    "@midnight-ntwrk/compact-runtime": "^0.9.0",
    "@midnight-ntwrk/midnight-js-contracts": "2.0.2",
    "@midnight-ntwrk/midnight-js-http-client-proof-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-node-zk-config-provider": "2.0.2",
    "@midnight-ntwrk/midnight-js-types": "2.0.2",
    "fastify": "^5.2.0",
    "zod": "^3.24.1",
    "pino": "^10.1.0"
  }
}
```

### Configuration Pattern

```typescript
// src/config.ts
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export interface MidnightConfig {
  proofServer: string;
  zkConfigPath: string;
  networkId: NetworkId;
}

export const config = {
  // For local development (undeployed network)
  local: {
    proofServer: 'http://localhost:6300',
    zkConfigPath: path.resolve(__dirname, '../../protocol/compiled'),
    networkId: NetworkId.Undeployed
  },
  
  // For testnet (future)
  testnet: {
    proofServer: 'http://localhost:6300', // Still local!
    zkConfigPath: path.resolve(__dirname, '../../protocol/compiled'),
    networkId: NetworkId.TestNet
  }
};
```

### Contract Loading Pattern

```typescript
// src/contract-loader.ts
import registryContract from '../../protocol/compiled/agenticdidregistry/contract/index.cjs';

export function loadContracts() {
  return {
    registry: registryContract,
    // ... other contracts
  };
}
```

---

## ⚠️ Important Rules to Follow

### 1. **Proof Server Runs Separately**

❌ **DON'T**: Include proof server in our Docker Compose with backend services  
✅ **DO**: Run proof server separately, backend connects to it

**Why**: Proof server is a shared resource, like a database. Multiple services connect to one instance.

### 2. **Network ID Must Match**

```typescript
// MUST set before any Midnight SDK calls
setNetworkId(NetworkId.Undeployed); // For local dev
```

**If mismatch**: Contract calls will fail with cryptic errors!

### 3. **ZK Config Path Must Be Correct**

```typescript
zkConfigPath: path.resolve(__dirname, '../../protocol/compiled')
```

**Structure expected**:
```
protocol/compiled/
├── agenticdidregistry/
│   ├── contract/index.cjs
│   └── circuit/keys/
├── credentialverifier/
│   └── ...
```

### 4. **Proof Server Must Be Running**

```bash
# Start before running backend
docker compose -f docker-compose.proof-server.yml up -d

# Check it's running
curl http://localhost:6300/health
```

### 5. **Don't Commit ZK Keys**

```gitignore
# protocol/.gitignore
compiled/*/circuit/keys/
*.prover
*.verifier
```

**Why**: Keys are 100s of MB, regenerated during compile

---

## 🚀 Phase 3 Implementation Plan

### Step 1: Setup Proof Server

1. Create `docker-compose.proof-server.yml`
2. Pull image: `docker pull midnightnetwork/proof-server:4.0.0`
3. Start: `docker compose -f docker-compose.proof-server.yml up -d`
4. Verify: `curl http://localhost:6300/health`

### Step 2: Create Midnight Gateway Service

1. Create `backend/midnight/` directory structure
2. Install dependencies (Midnight SDK 2.0.2)
3. Create config with `NetworkId.Undeployed`
4. Implement proof server client

### Step 3: Load Protocol Contracts

1. Import compiled contracts from `protocol/compiled/`
2. Initialize contract instances
3. Set up ZK config provider

### Step 4: Implement Verification API

1. `POST /verify-presentation` - Verify ZK proof
2. `GET /check-credential/:did` - Check credential status
3. `POST /verify-delegation` - Verify delegation

### Step 5: Integration

1. Update API Gateway's `midnightClient.ts` to call new service
2. Test end-to-end: Frontend → API → Midnight Gateway → Proof Server
3. Docker Compose orchestration

---

## 📊 Architecture Decision

### What We're Building

```
┌─────────────────────────────────────────────────────────────┐
│  Docker Compose: AgenticDID Services                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌─────────────┐      │
│  │ API Gateway│───▶│  Midnight  │───▶│   Agents    │      │
│  │  (3000)    │    │  Gateway   │    │  Runtime    │      │
│  │            │◀───│   (3002)   │    │   (3001)    │      │
│  └────────────┘    └──────┬─────┘    └─────────────┘      │
│                           │                                 │
│                           │ HTTP                            │
│                           ▼                                 │
│                    ┌─────────────┐                         │
│                    │             │                         │
│                    │ EXTERNAL:   │                         │
│                    │ Proof Server│                         │
│                    │  (6300)     │                         │
│                    │             │                         │
│                    └─────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Proof Server runs separately:
docker compose -f docker-compose.proof-server.yml up -d
```

**Rationale**:
- Proof server is shared infrastructure (like Postgres)
- Can be started/stopped independently
- Multiple devs can share one proof server
- Production: Use managed/hosted proof server

---

## 📝 Next Steps

1. ✅ Review complete
2. ⏳ Create proof server Docker Compose
3. ⏳ Build Midnight Gateway service structure
4. ⏳ Implement proof verification
5. ⏳ Test with local proof server
6. ⏳ Integration with API Gateway

---

**Status**: Ready to implement Phase 3 with confidence! 🚀  
**Estimated Time**: 2-3 hours  
**Dependencies**: Local proof server running
