# Midnight.js API Reference v2.0.2

**Package**: Midnight.js v2.0.2  
**Status**: ✅ Comprehensive Application Development Framework  
**Purpose**: TypeScript-based framework for building Midnight blockchain applications  
**Analogous to**: Web3.js (Ethereum), polkadot.js (Polkadot)

---

## 🎯 Overview

Midnight.js is the primary TypeScript application development framework for the Midnight blockchain. It provides a complete toolkit for building privacy-preserving decentralized applications with zero-knowledge proofs.

### Core Capabilities

**Standard Blockchain Operations**:
- ✅ Creating and submitting transactions
- ✅ Interacting with wallets
- ✅ Querying for block and state information
- ✅ Subscribing to chain events

**Privacy-Preserving Unique Features**:
- ✅ Executing smart contracts locally
- ✅ Incorporating private state into contract execution
- ✅ Persisting, querying, and updating private state
- ✅ Creating and verifying zero-knowledge proofs

---

## 📦 Package Structure

Midnight.js is organized into specialized packages, each handling a specific aspect of Midnight application development:

### 1. types
**Contains**: Types and interfaces common to all other packages

**Purpose**: Shared type definitions used across the entire Midnight.js ecosystem

**Usage**: Foundation for type-safe development across all packages

```typescript
import type { /* Common types */ } from '@midnight-ntwrk/midnight-js-types';
```

---

### 2. contracts
**Contains**: Utilities for interacting with Midnight smart contracts

**Purpose**: High-level contract interaction layer

**Key Features**:
- Contract deployment
- Circuit invocation
- State management
- Transaction construction

**Usage**: Primary interface for working with Compact/Minokawa smart contracts

```typescript
import { /* Contract utilities */ } from '@midnight-ntwrk/midnight-js-contracts';
```

**Related**: Works with compiled Compact contracts, uses @midnight-ntwrk/ledger internally

---

### 3. indexer-public-data-provider
**Contains**: Cross-environment implementation of a Midnight indexer client

**Purpose**: Query blockchain data (blocks, transactions, state)

**Key Features**:
- Block queries
- Transaction lookup
- State queries
- Event subscriptions

**Cross-Environment**: Works in Node.js, browsers, and other JavaScript environments

**Usage**: Essential for querying historical and current blockchain data

```typescript
import { IndexerPublicDataProvider } from '@midnight-ntwrk/indexer-public-data-provider';

const provider = new IndexerPublicDataProvider(indexerUrl);
const latestBlock = await provider.getLatestBlock();
```

**Related**: Connects to Midnight Indexer (v2.1.4+)

---

### 4. node-zk-config-provider
**Contains**: File system based Node.js utility for retrieving zero-knowledge artifacts

**Purpose**: Load ZK proving and verifying keys from local filesystem

**Environment**: **Node.js only** (uses fs module)

**Key Features**:
- Load proving keys
- Load verifying keys
- Load circuit definitions (zkir)
- Local filesystem access

**Usage**: Ideal for server-side applications and development

```typescript
import { NodeZkConfigProvider } from '@midnight-ntwrk/node-zk-config-provider';

const zkProvider = new NodeZkConfigProvider('./output/keys');
const proverKey = await zkProvider.getProverConfig('myCircuit');
```

**Use Case**: Server-side proof generation, development environments

---

### 5. fetch-zk-config-provider
**Contains**: Fetch-based cross-environment utility for retrieving zero-knowledge artifacts

**Purpose**: Load ZK artifacts over HTTP/HTTPS

**Environment**: **Cross-environment** (browsers, Node.js, Deno, etc.)

**Key Features**:
- HTTP/HTTPS artifact loading
- CDN support
- Cross-environment compatibility
- Browser-friendly

**Usage**: Essential for browser-based applications

```typescript
import { FetchZkConfigProvider } from '@midnight-ntwrk/fetch-zk-config-provider';

const zkProvider = new FetchZkConfigProvider('https://cdn.example.com/zk-artifacts');
const verifierKey = await zkProvider.getVerifierConfig('myCircuit');
```

**Use Case**: Browser dApps, serverless functions, edge computing

---

### 6. network-id
**Contains**: Utilities for setting the network id

**Purpose**: Configure which Midnight network to target

**Key Features**:
- Set network ID globally
- Affects ledger, zswap, and compact-runtime
- Network-specific configuration

**Networks**:
- **Undeployed** (0) - Local development
- **DevNet** (1) - Developer testing
- **TestNet** (2) - Public testnet
- **MainNet** (3) - Production mainnet

**Usage**: **Must be called before any other Midnight.js operations**

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';

// Set network before initialization
setNetworkId(NetworkId.TestNet);

// All subsequent operations use TestNet configuration
```

**Critical**: This affects ledger state, transaction format, and contract addresses

**Related**: See @midnight-ntwrk/ledger `setNetworkId()` and `NetworkId` enum

---

### 7. http-client-proof-provider
**Contains**: Cross-environment implementation of a proof-server client

**Purpose**: Generate zero-knowledge proofs via remote proof server

**Environment**: **Cross-environment** (browsers, Node.js, etc.)

**Key Features**:
- Remote proof generation
- Proof server communication
- Cross-environment HTTP client
- Handles proof complexity

**Usage**: Generate proofs without local computation (offload to server)

```typescript
import { HttpClientProofProvider } from '@midnight-ntwrk/http-client-proof-provider';

const proofProvider = new HttpClientProofProvider('https://proof-server.midnight.network');
const proof = await proofProvider.prove(circuit, witnesses, publicInputs);
```

**Proof Server**: Midnight Proof Server v4.0.0+

**Use Case**: 
- Browser applications (no local proving)
- Mobile applications
- Resource-constrained environments

**Performance**: Proof generation can take 1-60 seconds depending on circuit complexity

---

### 8. level-private-state-provider
**Contains**: Cross-environment implementation of persistent private state store

**Purpose**: Store and manage private user state (witness data)

**Environment**: **Cross-environment** (based on Level database)

**Key Features**:
- Persistent private state storage
- Key-value database
- Indexing and queries
- State updates
- Cross-environment (Level adapters)

**Usage**: Essential for maintaining private state between sessions

```typescript
import { LevelPrivateStateProvider } from '@midnight-ntwrk/level-private-state-provider';

const stateProvider = new LevelPrivateStateProvider('./private-state');

// Store private state
await stateProvider.set('mySecret', secretData);

// Retrieve private state
const secret = await stateProvider.get('mySecret');

// Update state
await stateProvider.update('mySecret', updatedData);
```

**Level Database**: 
- Node.js: Uses level (filesystem)
- Browser: Uses level-js (IndexedDB)
- Memory: Uses memory-level (testing)

**Privacy**: State is stored locally and never sent to the blockchain!

**Use Case**: Store witness data, user secrets, private balances

---

## 🔄 Package Interactions

### Typical Application Flow

```typescript
// 1. Set network
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
setNetworkId(NetworkId.TestNet);

// 2. Initialize providers
import { IndexerPublicDataProvider } from '@midnight-ntwrk/indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/fetch-zk-config-provider';
import { HttpClientProofProvider } from '@midnight-ntwrk/http-client-proof-provider';
import { LevelPrivateStateProvider } from '@midnight-ntwrk/level-private-state-provider';

const indexer = new IndexerPublicDataProvider(indexerUrl);
const zkConfig = new FetchZkConfigProvider(zkArtifactsUrl);
const proofProvider = new HttpClientProofProvider(proofServerUrl);
const privateState = new LevelPrivateStateProvider('./state');

// 3. Load contract
import { Contract } from '@midnight-ntwrk/midnight-js-contracts';
const myContract = new Contract(contractConfig, zkConfig);

// 4. Execute contract with private state
const witnesses = await privateState.get('myWitnesses');
const transaction = await myContract.call('myCircuit', {
  witnesses,
  publicInputs
});

// 5. Generate proof
const proof = await proofProvider.prove(transaction);

// 6. Submit to chain
await indexer.submitTransaction(proof);

// 7. Update private state
await privateState.update('myWitnesses', newWitnesses);
```

---

## 🎯 Key Design Patterns

### 1. Cross-Environment Support

Many packages are designed to work across different JavaScript environments:

**Browsers**:
- Use `fetch-zk-config-provider`
- Use `http-client-proof-provider`
- Use `level-private-state-provider` (with browser adapter)

**Node.js**:
- Use `node-zk-config-provider` (filesystem)
- Or `fetch-zk-config-provider` (HTTP)
- Use `http-client-proof-provider`
- Use `level-private-state-provider`

**Serverless/Edge**:
- Use `fetch-zk-config-provider`
- Use `http-client-proof-provider`
- Use `level-private-state-provider` (memory adapter)

---

### 2. Provider Pattern

Midnight.js uses the **Provider Pattern** extensively:

```typescript
interface Provider<T> {
  get(key: string): Promise<T>;
  set(key: string, value: T): Promise<void>;
}
```

**Examples**:
- `ZkConfigProvider` - Provides ZK artifacts
- `ProofProvider` - Provides proof generation
- `PrivateStateProvider` - Provides state persistence
- `PublicDataProvider` - Provides blockchain data

**Benefits**:
- Swappable implementations
- Environment-specific optimizations
- Testing with mock providers

---

### 3. Privacy-First Architecture

```
┌─────────────────────────────────────────────┐
│           User's Local Machine              │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Private State Provider              │  │
│  │  (Witnesses, Secrets)                │  │
│  └──────────────────────────────────────┘  │
│               ↓                             │
│  ┌──────────────────────────────────────┐  │
│  │  Contract Execution (Local)          │  │
│  │  (Compact Circuit + Witnesses)       │  │
│  └──────────────────────────────────────┘  │
│               ↓                             │
│  ┌──────────────────────────────────────┐  │
│  │  Proof Generation                    │  │
│  │  (ZK Proof of Correct Execution)     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│        Midnight Blockchain                  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Public Ledger                       │  │
│  │  (Proof + Public Outputs Only)       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Key Principle**: Witnesses stay local, only proofs go on-chain!

---

## 🔧 Environment-Specific Usage

### Browser Application

```typescript
// Browser-optimized stack
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/fetch-zk-config-provider';
import { HttpClientProofProvider } from '@midnight-ntwrk/http-client-proof-provider';
import { LevelPrivateStateProvider } from '@midnight-ntwrk/level-private-state-provider';
import { IndexerPublicDataProvider } from '@midnight-ntwrk/indexer-public-data-provider';

setNetworkId(NetworkId.TestNet);

const app = {
  zkConfig: new FetchZkConfigProvider('https://cdn.example.com/zk'),
  proofs: new HttpClientProofProvider('https://proof-server.example.com'),
  state: new LevelPrivateStateProvider('indexeddb://my-app-state'),
  indexer: new IndexerPublicDataProvider('https://indexer.example.com')
};
```

---

### Node.js Server Application

```typescript
// Node.js-optimized stack
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
import { NodeZkConfigProvider } from '@midnight-ntwrk/node-zk-config-provider';
import { HttpClientProofProvider } from '@midnight-ntwrk/http-client-proof-provider';
import { LevelPrivateStateProvider } from '@midnight-ntwrk/level-private-state-provider';
import { IndexerPublicDataProvider } from '@midnight-ntwrk/indexer-public-data-provider';

setNetworkId(NetworkId.TestNet);

const app = {
  zkConfig: new NodeZkConfigProvider('./compiled-contracts/keys'),
  proofs: new HttpClientProofProvider('http://localhost:6382'),
  state: new LevelPrivateStateProvider('./data/private-state'),
  indexer: new IndexerPublicDataProvider('http://localhost:8080')
};
```

---

## 📚 Related Documentation

- **[@midnight-ntwrk/ledger](LEDGER_API_REFERENCE.md)** - Low-level transaction assembly (129 items documented)
- **[@midnight-ntwrk/dapp-connector-api](DAPP_CONNECTOR_API_REFERENCE.md)** - Wallet integration
- **[Compact Runtime API](i_am_Midnight_LLM_ref.md)** - Smart contract runtime (70+ functions)
- **[Minokawa Language Guide](MINOKAWA_LANGUAGE_GUIDE.md)** - Smart contract language

---

## 🎯 Quick Start Example

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/fetch-zk-config-provider';
import { HttpClientProofProvider } from '@midnight-ntwrk/http-client-proof-provider';
import { LevelPrivateStateProvider } from '@midnight-ntwrk/level-private-state-provider';
import { Contract } from '@midnight-ntwrk/midnight-js-contracts';

// 1. Configure network
setNetworkId(NetworkId.TestNet);

// 2. Initialize providers
const zkConfig = new FetchZkConfigProvider('https://cdn.example.com/zk-artifacts');
const proofProvider = new HttpClientProofProvider('https://proof-server.example.com');
const privateState = new LevelPrivateStateProvider('./private-state');

// 3. Load your contract
const myContract = new Contract({
  address: '0x123...',
  zkConfig
});

// 4. Execute circuit with private data
const result = await myContract.call('registerAgent', {
  witnesses: {
    secretKey: await privateState.get('mySecretKey'),
    secretData: 'private information'
  },
  publicInputs: {
    did: '0xabc...'
  }
});

// 5. Generate proof
const proof = await proofProvider.prove(result);

// 6. Submit to blockchain
await myContract.submitProof(proof);

// 7. Update local state
await privateState.set('lastRegistration', Date.now());
```

---

## 🔐 Security Best Practices

### Private State Management

**DO**:
- ✅ Store witnesses in `LevelPrivateStateProvider`
- ✅ Use local encryption for sensitive data
- ✅ Back up private state securely
- ✅ Clear unused private state

**DON'T**:
- ❌ Never send witnesses to the blockchain
- ❌ Never log private state
- ❌ Never expose witnesses in API responses
- ❌ Never store private state in localStorage without encryption

### Proof Generation

**DO**:
- ✅ Use `http-client-proof-provider` for browsers
- ✅ Validate proof before submission
- ✅ Handle proof generation timeouts
- ✅ Cache ZK artifacts

**DON'T**:
- ❌ Don't generate proofs client-side for complex circuits (too slow)
- ❌ Don't trust unverified proofs
- ❌ Don't reuse randomness

---

## 📊 Version Compatibility

| Package | Version | Midnight Version |
|---------|---------|------------------|
| Midnight.js | 2.0.2+ | Latest |
| Ledger | 3.0.2+ | v3.0.2 |
| Compact Runtime | 0.9.0+ | v0.9.0 |
| Compactc | 0.26.0+ | Minokawa 0.18.0 |
| Indexer | 2.1.4+ | v2.1.4 |
| Proof Server | 4.0.0+ | v4.0.0 |

---

## 🎊 Summary

**Midnight.js v2.0.2** provides a complete, modular, cross-environment framework for building privacy-preserving dApps:

- ✅ **8 specialized packages** for every aspect of development
- ✅ **Cross-environment support** (browsers, Node.js, serverless)
- ✅ **Privacy-first architecture** (witnesses stay local)
- ✅ **Flexible provider pattern** (swappable implementations)
- ✅ **Production-ready** (used by Midnight ecosystem)

**Next Steps**:
1. Set network ID
2. Initialize providers
3. Load contracts
4. Execute with private state
5. Generate proofs
6. Submit to chain

---

**Package**: Midnight.js v2.0.2  
**Status**: ✅ Framework Overview Complete  
**Last Updated**: October 28, 2025  
**Compatibility**: Testnet_02, Minokawa 0.18.0
