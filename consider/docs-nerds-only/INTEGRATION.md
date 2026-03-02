# Protocol Integration Guide

**How to integrate Midnight contracts with backend services**

---

## Overview

The `protocol/` directory contains Midnight Network smart contracts that provide the blockchain layer for AgenticDID. This guide explains how backend services integrate with these contracts.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React)                                            │
│  - Agent selection UI                                        │
│  - Credential presentation                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: API Gateway (Phase 1) ✅                          │
│  - Routes: /challenge, /present, /verify                    │
│  - JWT token generation                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: Midnight Gateway (Phase 3) ⏳                     │
│  - Loads compiled contracts from protocol/compiled/         │
│  - Connects to Midnight Network RPC                         │
│  - Calls smart contracts for verification                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Protocol Layer (This directory) ✅                         │
│  - Smart contracts (.compact files)                         │
│  - Compiled outputs (ZK circuits, JS code)                  │
│  - Deployment scripts                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Midnight Network (Blockchain)                               │
│  - Testnet: testnet.midnight.network                        │
│  - Mainnet: midnight.network                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Midnight Gateway Integration

### Step 1: Install Protocol Package

From `backend/midnight/`:

```bash
# Add local protocol package
bun add file:../../protocol

# Or add to package.json
{
  "dependencies": {
    "@agenticdid/protocol": "file:../../protocol"
  }
}
```

### Step 2: Import Compiled Contracts

```typescript
// backend/midnight/src/contract-loader.ts
import registryContract from '@agenticdid/protocol/compiled/agenticdidregistry/contract/index.cjs';
import verifierContract from '@agenticdid/protocol/compiled/credentialverifier/contract/index.cjs';
import storageContract from '@agenticdid/protocol/compiled/proofstorage/contract/index.cjs';

export const CONTRACTS = {
  registry: registryContract,
  verifier: verifierContract,
  storage: storageContract,
};
```

### Step 3: Connect to Midnight Network

```typescript
// backend/midnight/src/midnight-client.ts
import { MidnightClient } from '@midnight-ntwrk/midnight-js';

const client = new MidnightClient({
  network: process.env.MIDNIGHT_NETWORK || 'testnet',
  rpcUrl: process.env.MIDNIGHT_RPC_URL || 'https://rpc.testnet.midnight.network',
});

export default client;
```

### Step 4: Initialize Contract Instances

```typescript
// backend/midnight/src/contracts.ts
import { ContractInstance } from '@midnight-ntwrk/midnight-js-types';
import midnightClient from './midnight-client.js';
import { CONTRACTS } from './contract-loader.js';

// Load contract addresses from env
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS!;
const VERIFIER_ADDRESS = process.env.VERIFIER_CONTRACT_ADDRESS!;

// Initialize contract instances
export const registryContract = new ContractInstance({
  client: midnightClient,
  artifacts: CONTRACTS.registry,
  address: REGISTRY_ADDRESS,
});

export const verifierContract = new ContractInstance({
  client: midnightClient,
  artifacts: CONTRACTS.verifier,
  address: VERIFIER_ADDRESS,
});
```

### Step 5: Call Contract Methods

```typescript
// backend/midnight/src/verifier.ts
import { verifierContract } from './contracts.js';
import type { VerifyPresentationRequest } from './types.js';

export async function verifyPresentation(request: VerifyPresentationRequest) {
  const { presentation, challenge } = request;
  
  // Call Midnight contract
  const result = await verifierContract.call('verifyPresentation', [
    presentation.proof,
    presentation.publicSignals,
    challenge.nonce,
  ]);
  
  return {
    valid: result.valid,
    agentDid: result.agentDid,
    role: result.role,
    scopes: result.scopes,
  };
}
```

---

## Contract APIs

### AgenticDIDRegistry

**Query Methods** (read-only, no gas):
```typescript
// Check delegation status
const delegation = await registry.query('getDelegation', [delegationId]);

// Check if agent is revoked
const isRevoked = await registry.query('checkRevocation', [agentDid]);

// Get agent public key
const publicKey = await registry.query('getAgentPublicKey', [agentDid]);

// Get total agents registered
const total = await registry.query('totalAgents', []);
```

**Transaction Methods** (write, requires gas):
```typescript
// Register new agent
const tx = await registry.call('registerAgent', [
  agentDid,
  agentCredential,
  signature,
]);

// Revoke delegation
const tx = await registry.call('revokeDelegation', [delegationId]);

// Revoke agent
const tx = await registry.call('revokeAgent', [agentDid]);
```

### CredentialVerifier

**Verification**:
```typescript
// Verify ZK presentation
const result = await verifier.call('verifyPresentation', [
  proof,
  publicSignals,
  challenge,
]);

// Generate spoof transaction (privacy)
const spoofTx = await verifier.call('generateSpoofQuery', [
  requestId,
  spoofRatio,
]);
```

### ProofStorage

**Storage**:
```typescript
// Store verification proof
await storage.call('storeProof', [
  proofId,
  proofData,
  metadata,
]);

// Get historical proof
const proof = await storage.query('getProof', [proofId]);
```

---

## Environment Configuration

### backend/midnight/.env

```bash
# Midnight Network
MIDNIGHT_NETWORK=testnet
MIDNIGHT_RPC_URL=https://rpc.testnet.midnight.network

# Contract Addresses (from deployment)
REGISTRY_CONTRACT_ADDRESS=0x1234567890abcdef...
VERIFIER_CONTRACT_ADDRESS=0xabcdef1234567890...
STORAGE_CONTRACT_ADDRESS=0x9876543210fedcba...

# Wallet (for transactions)
DEPLOYER_PRIVATE_KEY=your_key_here
TRANSACTION_GAS_LIMIT=1000000

# Spoof Transaction Settings
SPOOF_RATIO=80  # 80% fake queries for privacy
```

---

## Development Workflow

### 1. Compile Contracts

```bash
cd protocol
bun run compile:fast  # Quick compile for testing
```

### 2. Deploy to Testnet

```bash
# Deploy registry
midnight-cli deploy \
  --network testnet \
  --contract ./compiled/agenticdidregistry/contract/index.cjs \
  --keys ./compiled/agenticdidregistry/keys/

# Save address to .env
echo "REGISTRY_ADDRESS=0x..." >> ../backend/midnight/.env
```

### 3. Update Backend

```bash
cd ../backend/midnight

# Reload protocol package (if contracts changed)
bun install

# Test integration
bun test
```

### 4. Test End-to-End

```bash
# Start all services
docker-compose up

# Frontend → API Gateway → Midnight Gateway → Contracts
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{"presentation": {...}, "challenge": {...}}'
```

---

## Type Safety

### Generate TypeScript Types from Contracts

```bash
# Auto-generate types from compiled contracts
cd protocol
bun run generate-types

# Output: src/types/contracts.ts
```

### Use Generated Types

```typescript
import type {
  AgentCredential,
  Delegation,
  VerificationResult,
} from '@agenticdid/protocol/types';

const credential: AgentCredential = {
  did: '...',
  role: 'Banker',
  scopes: ['bank:transfer', 'bank:balance'],
  publicKey: '...',
};
```

---

## Error Handling

### Contract Call Errors

```typescript
try {
  const result = await verifier.call('verifyPresentation', [proof, signals]);
} catch (error) {
  if (error.code === 'PROOF_VERIFICATION_FAILED') {
    // Invalid ZK proof
    return { valid: false, error: 'Invalid proof' };
  } else if (error.code === 'REVOKED_CREDENTIAL') {
    // Agent credential was revoked
    return { valid: false, error: 'Credential revoked' };
  } else {
    // Network or other error
    logger.error({ error }, 'Contract call failed');
    throw error;
  }
}
```

### Network Errors

```typescript
import { retryWithBackoff } from '../utils/retry.js';

const result = await retryWithBackoff(
  () => registry.query('getDelegation', [id]),
  {
    maxRetries: 3,
    backoffMs: 1000,
  }
);
```

---

## Testing

### Mock Contracts (Development)

```typescript
// backend/midnight/src/tests/mocks.ts
export const mockRegistryContract = {
  query: jest.fn(),
  call: jest.fn(),
};

// Use in tests
import { mockRegistryContract } from './mocks.js';

test('verify delegation', async () => {
  mockRegistryContract.query.mockResolvedValue({
    isValid: true,
    expiresAt: Date.now() + 3600000,
  });
  
  const result = await checkDelegation('delegation-123');
  expect(result.isValid).toBe(true);
});
```

### Integration Tests (Testnet)

```typescript
// backend/midnight/src/tests/integration.test.ts
import { registryContract } from '../contracts.js';

describe('Registry Integration', () => {
  it('should query total agents', async () => {
    const total = await registryContract.query('totalAgents', []);
    expect(total).toBeGreaterThan(0);
  });
  
  it('should register agent', async () => {
    const tx = await registryContract.call('registerAgent', [
      testAgent.did,
      testAgent.credential,
      testAgent.signature,
    ]);
    expect(tx.status).toBe('success');
  });
});
```

---

## Performance

### Caching

```typescript
// Cache frequent queries
import { cache } from '../utils/cache.js';

async function getDelegation(id: string) {
  return cache.getOrSet(
    `delegation:${id}`,
    () => registry.query('getDelegation', [id]),
    { ttl: 60 } // 60 second cache
  );
}
```

### Batch Queries

```typescript
// Query multiple delegations in one call
const delegationIds = ['id1', 'id2', 'id3'];
const results = await Promise.all(
  delegationIds.map(id => registry.query('getDelegation', [id]))
);
```

---

## Security

### Never Expose Private Keys

```typescript
// ❌ WRONG
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
res.json({ privateKey }); // Never send to client!

// ✅ CORRECT
// Private keys stay server-side only
// Use for signing transactions, never expose
```

### Validate All Inputs

```typescript
import { z } from 'zod';

const VerificationRequestSchema = z.object({
  proof: z.string(),
  publicSignals: z.array(z.string()),
  challenge: z.string(),
});

const validated = VerificationRequestSchema.parse(request.body);
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Contracts compiled with full ZK keys (no `--skip-zk`)
- [ ] Security audit completed
- [ ] Integration tests passing on testnet
- [ ] Performance benchmarks met
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Backup RPC endpoints configured
- [ ] Gas limits optimized
- [ ] Contract addresses documented

---

## Resources

- **Midnight Docs**: https://docs.midnight.network
- **Contract README**: `./README.md`
- **Compilation Guide**: `./scripts/compile-all.sh`
- **Demo Integration**: `../AgenticDID_DEMO-LAND/agentic-did/packages/midnight-adapter/`

---

**Last Updated**: Nov 14, 2025  
**Status**: Ready for Phase 3 integration
