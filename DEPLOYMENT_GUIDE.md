# AgenticDID Deployment Guide

**Last Updated**: October 28, 2025  
**Target Network**: Midnight Testnet  
**Status**: ✅ Ready for Deployment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Compilation](#compilation)
4. [Local Testing](#local-testing)
5. [Testnet Deployment](#testnet-deployment)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# 1. Node.js 18+
node --version  # Should be >= 18.0.0

# 2. Docker (for Compact compiler)
docker --version  # Should be >= 20.0.0

# 3. Package manager (npm/bun)
npm --version   # or: bun --version
```

### Required Accounts & Tokens

1. **Lace Wallet**:
   - Install: https://www.lace.io/
   - Create Midnight testnet account
   - Switch to Midnight testnet mode

2. **tDUST Tokens**:
   - Use testnet faucet in Lace wallet
   - Minimum: ~100 tDUST for deployment
   - Get more: https://faucet.testnet.midnight.network

### Project Setup

```bash
# Clone or navigate to project
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me

# Install dependencies
npm install
# or: bun install

# Verify scripts are executable
chmod +x scripts/*.sh
```

---

## Quick Start

### One-Command Deployment

```bash
# Compile, test, and deploy everything
npm run deploy:all
```

This runs:
1. ✅ Contract compilation
2. ✅ Unit tests
3. ✅ Testnet deployment
4. ✅ Configuration update

---

## Compilation

### Compile All Contracts

```bash
./scripts/compile-contracts.sh
```

**What it does:**
- Pulls Compact compiler Docker image
- Compiles all 3 contracts in dependency order:
  1. AgenticDIDRegistry
  2. CredentialVerifier (depends on Registry)
  3. ProofStorage
- Outputs to `contracts/compiled/`

### Output Structure

```
contracts/compiled/
├── AgenticDIDRegistry/
│   ├── contract.json       # Contract metadata
│   ├── contract-api.ts     # TypeScript API
│   └── witness.ts          # ZK witness generation
├── CredentialVerifier/
│   └── ...
└── ProofStorage/
    └── ...
```

### Manual Compilation

```bash
# Compile individual contract
docker run --rm \
  -v $(pwd)/contracts:/workspace/contracts \
  -v $(pwd)/contracts/compiled:/workspace/output \
  ghcr.io/midnightntwrk/compact:latest \
  compactc contracts/AgenticDIDRegistry.compact -o output/AgenticDIDRegistry/
```

---

## Local Testing

### Run All Tests

```bash
./scripts/test-contracts.sh
```

### Individual Test Suites

```bash
# Unit tests for each contract
npm run test:registry
npm run test:verifier
npm run test:storage

# Integration tests
npm run test:integration

# Coverage report
npm run coverage:contracts
```

### Test Structure

```
tests/
├── unit/
│   ├── AgenticDIDRegistry.test.ts
│   ├── CredentialVerifier.test.ts
│   └── ProofStorage.test.ts
├── integration/
│   ├── delegation-flow.test.ts
│   └── verification-flow.test.ts
└── fixtures/
    └── test-data.ts
```

---

## Testnet Deployment

### Step 1: Configure Environment

Create `.env.midnight` file:

```bash
# Midnight Network Configuration
MIDNIGHT_NETWORK=testnet
MIDNIGHT_INDEXER_URL=https://indexer.testnet.midnight.network
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network

# Wallet Configuration
MIDNIGHT_WALLET_ADDRESS=your_lace_wallet_address
MIDNIGHT_PRIVATE_KEY=your_wallet_private_key

# Contract Configuration
INITIAL_SPOOF_RATIO=80  # 80% spoof transactions for privacy
```

⚠️ **Security**: Add `.env.midnight` to `.gitignore`!

### Step 2: Deploy

```bash
./scripts/deploy-testnet.sh
```

**Deployment Sequence:**

1. **AgenticDIDRegistry** (independent)
   - Constructor: `(owner: Address)`
   - Stores agent credentials

2. **CredentialVerifier** (depends on Registry)
   - Constructor: `(owner: Address, spoofRatio: Uint<8>, registry: AgenticDIDRegistry)`
   - Links to deployed Registry

3. **ProofStorage** (independent)
   - Constructor: `(owner: Address)`
   - Stores verification proofs

### Step 3: Verify Deployment

```bash
# Check deployment summary
cat deployments/testnet/deployment-summary.json

# View on explorer
# https://explorer.testnet.midnight.network/contract/<CONTRACT_ADDRESS>
```

---

## Configuration

### Update Frontend Config

After deployment, update `apps/web/src/config/contracts.ts`:

```typescript
export const contracts = {
  network: 'testnet',
  agenticDIDRegistry: {
    address: '0x...', // From deployment-summary.json
    abi: require('@/contracts/compiled/AgenticDIDRegistry/contract.json'),
  },
  credentialVerifier: {
    address: '0x...',
    abi: require('@/contracts/compiled/CredentialVerifier/contract.json'),
  },
  proofStorage: {
    address: '0x...',
    abi: require('@/contracts/compiled/ProofStorage/contract.json'),
  },
};
```

### Update Midnight Adapter

Update `packages/midnight-adapter/src/config.ts`:

```typescript
export const midnightConfig = {
  network: 'testnet',
  indexerUrl: 'https://indexer.testnet.midnight.network',
  nodeUrl: 'https://rpc.testnet.midnight.network',
  contracts: {
    registry: '0x...',      // From deployment
    verifier: '0x...',
    storage: '0x...',
  },
};
```

---

## Troubleshooting

### Compilation Issues

**Error: `unbound identifier Address`**
```bash
# This was fixed in COMPILATION_FIXES.md
# If you still see it, verify you have latest code:
git pull origin main
```

**Error: Docker not running**
```bash
# Start Docker Desktop
# Or on Linux:
sudo systemctl start docker
```

**Error: Compiler image not found**
```bash
# Pull latest compiler
docker pull ghcr.io/midnightntwrk/compact:latest
```

### Deployment Issues

**Error: Insufficient tDUST**
```bash
# Get more from faucet
# Open Lace wallet → Testnet → Faucet
# Or visit: https://faucet.testnet.midnight.network
```

**Error: Contract already deployed**
```bash
# Clear previous deployment
rm -rf deployments/testnet/
# Deploy again
./scripts/deploy-testnet.sh
```

**Error: Wallet not connected**
```bash
# Check .env.midnight configuration
# Ensure Lace wallet is installed and unlocked
# Verify network is set to "testnet" in Lace
```

### Testing Issues

**Error: Tests failing**
```bash
# Ensure contracts are compiled
./scripts/compile-contracts.sh

# Run tests with verbose output
npm run test:contracts -- --verbose

# Check specific test
npm run test:contracts -- --grep "AgenticDIDRegistry"
```

---

## Deployment Checklist

Before deploying to testnet:

- [ ] All contracts compile successfully
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] `.env.midnight` configured
- [ ] Lace wallet connected to testnet
- [ ] Sufficient tDUST in wallet (100+)
- [ ] Git committed (safe backup)

After deployment:

- [ ] Verify contracts on explorer
- [ ] Update frontend configuration
- [ ] Update SDK configuration
- [ ] Test basic operations (register agent, verify)
- [ ] Document contract addresses
- [ ] Run smoke tests

---

## Deployment Timeline

**Estimated Time**: 15-30 minutes

1. **Compilation** (2-5 min)
   - Pulling Docker image: 1-2 min
   - Compiling 3 contracts: 1-3 min

2. **Testing** (3-5 min)
   - Unit tests: 2-3 min
   - Integration tests: 1-2 min

3. **Deployment** (10-20 min)
   - Deploy Registry: 3-5 min
   - Deploy Verifier: 3-5 min
   - Deploy Storage: 3-5 min
   - Verification: 1-5 min

---

## Cost Estimates

**Testnet Deployment** (with tDUST):

| Contract | Estimated Cost | Function |
|----------|----------------|----------|
| AgenticDIDRegistry | ~30 tDUST | DID storage |
| CredentialVerifier | ~40 tDUST | Verification + spoofs |
| ProofStorage | ~30 tDUST | Proof storage |
| **Total** | **~100 tDUST** | Full deployment |

💡 **Tip**: Get extra tDUST from faucet for testing operations

---

## Post-Deployment Testing

### 1. Register Test Agent

```typescript
import { agenticDIDRegistry } from './config/contracts';

const result = await agenticDIDRegistry.registerAgent({
  did: '0x123...',
  publicKey: '0xabc...',
  role: 'test_agent',
  scopes: ['read', 'write'],
  expiresAt: Date.now() + 86400000, // 24 hours
});

console.log('Agent registered:', result.agentDID);
```

### 2. Verify Agent

```typescript
import { credentialVerifier } from './config/contracts';

const isValid = await credentialVerifier.verifyCredential({
  agentDID: '0x123...',
  proofHash: '0xdef...',
});

console.log('Agent valid:', isValid);
```

### 3. Check Statistics

```typescript
const stats = await credentialVerifier.getStats();
console.log('Total verifications:', stats.totalVerifications);
console.log('Spoof ratio:', stats.spoofRatio + '%');
console.log('Privacy level:', stats.privacyLevel);
```

---

## Production Deployment

When ready for mainnet:

1. **Update configuration**:
   ```bash
   # .env.midnight
   MIDNIGHT_NETWORK=mainnet
   MIDNIGHT_INDEXER_URL=https://indexer.midnight.network
   MIDNIGHT_NODE_URL=https://rpc.midnight.network
   ```

2. **Security audit** (recommended):
   - Review all contracts
   - Run static analysis
   - Perform penetration testing

3. **Deploy to mainnet**:
   ```bash
   ./scripts/deploy-mainnet.sh
   ```

4. **Monitor deployment**:
   - Transaction confirmations
   - Gas costs
   - Error logs

---

## Resources

### Documentation
- [Midnight Developer Docs](https://docs.midnight.network)
- [Compact Language Reference](https://docs.midnight.network/compact)
- [Lace Wallet Guide](https://docs.lace.io)

### Support
- Midnight Discord: https://discord.gg/midnight
- GitHub Issues: https://github.com/yourusername/AgenticDID/issues
- Project README: [README.md](./README.md)

### Internal Docs
- [COMPILATION_FIXES.md](./COMPILATION_FIXES.md) - Syntax fixes applied
- [PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md) - Implementation guide
- [PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md) - Privacy design

---

**Ready to deploy!** 🚀

Run `./scripts/compile-contracts.sh` to get started.
