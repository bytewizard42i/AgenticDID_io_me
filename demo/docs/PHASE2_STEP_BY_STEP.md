# Phase 2: Step-by-Step Implementation Guide

## Overview
Build production AgenticDID with real Midnight while keeping demo UI identical.

---

## Week 1: Deploy Contracts

### Compile
```bash
docker run --rm -v "$(pwd):/work" midnightnetwork/compactc:latest \
  "compactc /work/contracts/AgenticDIDRegistry.compact /work/compiled/"
```

### Deploy to Testnet
```bash
midnight-cli deploy --network testnet \
  --contract ./compiled/contract/index.cjs \
  --keys ./compiled/keys/
```

### Save Addresses
```bash
# .env.production
REGISTRY_ADDRESS=0xABCD...
VERIFIER_ADDRESS=0xEF12...
```

---

## Week 2: Real Adapter

### Create Package
```bash
mkdir -p packages/midnight-adapter-v2/src
cd packages/midnight-adapter-v2
bun init -y
bun add @meshsdk/midnight
```

### Implement Adapter
```typescript
// src/real-adapter.ts
import { MidnightClient } from '@meshsdk/midnight';

export class RealMidnightAdapter {
  async verifyReceipt(input) {
    // Query on-chain registry
    // Verify ZK proof
    // Return status + policy
  }
}
```

### Update API
```typescript
// apps/verifier-api/src/index.ts
import { createAdapter } from '@agenticdid/midnight-adapter-v2';

const adapter = createAdapter({
  mode: process.env.MODE // 'mock' or 'real'
});
```

---

## Week 3: Agent Runtime

### Create Agents
```typescript
// packages/agent-runtime/src/base-agent.ts
export abstract class BaseAgent {
  async execute(action, delegation) {
    // Validate delegation
    // Check scopes
    // Generate ZK proof
    // Perform action
    // Return result + proof + transcript
  }
}

// Implement: BankerAgent, TravelerAgent, ShopperAgent
```

---

## Week 4: Lace Wallet

### Install & Connect
```bash
cd apps/web
bun add @midnight-ntwrk/lace-wallet-connector
```

```typescript
// src/hooks/useWallet.ts
export function useWallet() {
  const connectWallet = async () => {
    const did = await window.midnight.getDID();
    return did;
  };
  
  const signDelegation = async (agentDID, scopes) => {
    const sig = await window.midnight.sign(delegation);
    return sig;
  };
}
```

### Update UI
```typescript
// Add WalletConnect component
// Gate goal execution on wallet connection
// Create delegations on goal submit
```

---

## Week 5: Integration

### Connect Everything
- API uses real adapter
- Agents execute with proofs
- Frontend calls real backend
- E2E testing

### Test Flow
1. User connects Lace wallet
2. User selects goal
3. System creates delegation
4. Agent executes with ZK proof
5. Result displayed (UI unchanged!)

---

## Week 6: Deploy

### Frontend → Vercel
```bash
cd apps/web
vercel deploy --prod
```

### Backend → Render
```bash
# Connect GitHub to Render
# Auto-deploys on push to main
```

### Environment
```bash
# Production env vars
MODE=production
REGISTRY_ADDRESS=0x...
VERIFIER_ADDRESS=0x...
MIDNIGHT_RPC_URL=https://rpc.testnet.midnight.network
```

---

## Success Checklist

- [ ] Contracts deployed to testnet
- [ ] Real adapter queries blockchain
- [ ] Agents generate ZK proofs
- [ ] Lace wallet integrated
- [ ] E2E flow works
- [ ] UI looks identical to demo
- [ ] Performance <5s
- [ ] Deployed to production

---

## Quick Commands

```bash
# Test demo
./docker-quickstart.sh

# Compile contracts
npm run compile:contracts

# Run tests
bun test

# Deploy
npm run deploy:prod
```
