# Midnight Network Integration Guide
**AgenticDID.io - Phase 2 Implementation**

## 📚 Research Summary

### Key Technologies
1. **Compact** - Midnight's domain-specific language for ZK smart contracts
   - Resembles TypeScript but more constrained
   - Designed for data protection and zero-knowledge circuits
   - Compiles to blockchain smart contracts
   - Does not require extensive math knowledge

2. **@meshsdk/midnight-setup** - Official SDK for Midnight integration
   - NPM package: `@meshsdk/midnight-setup`
   - Provides `MidnightSetupAPI` for contract deployment/interaction
   - Includes Lace wallet integration support
   - Full TypeScript support

3. **Lace Wallet** - Primary wallet for Midnight Network
   - Accessible via `window.midnight?.mnLace`
   - Supports transaction signing and balancing
   - Required for devnet interactions

4. **tDUST** - Testnet token for devnet
   - Used for transaction fees
   - Obtained from devnet faucet
   - Does not leave devnet environment

## 🏗️ Architecture for AgenticDID.io

### Current State (Phase 1 - MVP)
```
Frontend → Mock Adapter → Verifier API
           (hardcoded)
```

### Target State (Phase 2 - Real Midnight)
```
Frontend → Midnight Adapter → Minokawa Contract → Midnight Network
           (MidnightSetupAPI)   (Compact)          (Devnet)
```

## 📦 Required Dependencies

### 1. Core Midnight SDK
```bash
npm install @meshsdk/midnight-setup
```

### 2. Additional Tooling
```bash
# Compact compiler (if writing contracts locally)
# Install via Midnight CLI tools

# TypeScript support already in place ✓
```

## 🔧 Implementation Steps

### Step 1: Update Midnight Adapter Package

**File**: `packages/midnight-adapter/package.json`

```json
{
  "dependencies": {
    "@agenticdid/sdk": "*",
    "@meshsdk/midnight-setup": "^latest"
  }
}
```

### Step 2: Create Provider Setup

**File**: `packages/midnight-adapter/src/providers.ts`

```typescript
import { MidnightSetupContractProviders } from '@meshsdk/midnight-setup';

export async function setupMidnightProviders(): Promise<MidnightSetupContractProviders> {
  // Connect to Lace wallet
  const wallet = window.midnight?.mnLace;
  
  if (!wallet) {
    throw new Error('Lace Wallet for Midnight is required. Please install Lace Beta Wallet.');
  }

  // Enable wallet
  const walletAPI = await wallet.enable();
  const walletState = await walletAPI.state();
  const uris = await wallet.serviceUriConfig();

  return {
    wallet: walletAPI,
    fetcher: uris.indexer, // or blockfrost provider
    submitter: uris.node,   // or transaction submitter
  };
}
```

### Step 3: Write Compact Contract

**File**: `contracts/minokawa/AgenticDIDRegistry.compact`

```compact
// AgenticDID Credential Registry Contract
// Privacy-preserving credential state management

circuit CredentialRegistry {
  // Private state
  private credentials: Map<Bytes32, CredentialState>;
  private revocationList: Set<Bytes32>;
  
  // Public state
  public totalCredentials: UInt64;
  
  // Credential state structure
  struct CredentialState {
    credHash: Bytes32,
    role: String,
    scopes: Array<String>,
    issuedAt: UInt64,
    revoked: Boolean
  }
  
  // Register new credential
  public function registerCredential(
    credHash: Bytes32,
    role: String,
    scopes: Array<String>
  ): Void {
    require(!credentials.has(credHash), "Credential already exists");
    
    credentials.set(credHash, CredentialState {
      credHash: credHash,
      role: role,
      scopes: scopes,
      issuedAt: now(),
      revoked: false
    });
    
    totalCredentials = totalCredentials + 1;
  }
  
  // Revoke credential
  public function revokeCredential(credHash: Bytes32): Void {
    require(credentials.has(credHash), "Credential does not exist");
    
    let state = credentials.get(credHash);
    state.revoked = true;
    credentials.set(credHash, state);
    revocationList.add(credHash);
  }
  
  // Check credential status (ZK proof)
  public function verifyCredential(credHash: Bytes32): Boolean {
    if (!credentials.has(credHash)) {
      return false;
    }
    
    let state = credentials.get(credHash);
    return !state.revoked;
  }
  
  // Get credential policy (with selective disclosure)
  public function getCredentialPolicy(credHash: Bytes32): CredentialState {
    require(credentials.has(credHash), "Credential does not exist");
    return credentials.get(credHash);
  }
}
```

### Step 4: Update Midnight Adapter Implementation

**File**: `packages/midnight-adapter/src/adapter.ts`

```typescript
import { MidnightSetupAPI } from '@meshsdk/midnight-setup';
import { setupMidnightProviders } from './providers.js';

export class MidnightAdapter {
  private api?: MidnightSetupAPI;
  private contractAddress?: string;
  private config: MidnightAdapterConfig;

  constructor(config: MidnightAdapterConfig = {}) {
    this.config = {
      enableMockMode: false, // Switch to real mode
      ...config,
    };
  }

  /**
   * Initialize connection to Midnight contract
   */
  async initialize(contractAddress?: string): Promise<void> {
    const providers = await setupMidnightProviders();
    
    if (contractAddress) {
      // Join existing contract
      this.api = await MidnightSetupAPI.joinContract(
        providers,
        contractInstance, // From compiled Compact contract
        contractAddress
      );
      this.contractAddress = contractAddress;
    } else {
      // Deploy new contract
      this.api = await MidnightSetupAPI.deployContract(
        providers,
        contractInstance
      );
      this.contractAddress = this.api.deployedContractAddress;
    }
  }

  /**
   * Verify receipt using real Midnight contract
   */
  async verifyReceipt(input: VerifyReceiptInput): Promise<VerifyReceiptResult> {
    if (this.config.enableMockMode) {
      return this.mockVerifyReceipt(input);
    }

    if (!this.api) {
      throw new Error('Midnight adapter not initialized. Call initialize() first.');
    }

    try {
      // Query contract state
      const contractState = await this.api.getContractState();
      
      // Call contract verification method
      const isValid = await this.api.contract.verifyCredential(input.cred_hash);
      
      if (!isValid) {
        return {
          status: 'revoked',
          verified_at: Date.now(),
        };
      }

      // Get credential policy
      const policy = await this.api.contract.getCredentialPolicy(input.cred_hash);

      return {
        status: 'valid',
        policy: {
          role: policy.role,
          scopes: policy.scopes,
        },
        verified_at: Date.now(),
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Verification failed',
        verified_at: Date.now(),
      };
    }
  }

  /**
   * Register a new credential on-chain
   */
  async registerCredential(
    credHash: string,
    role: string,
    scopes: string[]
  ): Promise<string> {
    if (!this.api) {
      throw new Error('Midnight adapter not initialized');
    }

    const txHash = await this.api.contract.registerCredential(
      credHash,
      role,
      scopes
    );

    return txHash;
  }

  /**
   * Revoke a credential on-chain
   */
  async revokeCredential(credHash: string): Promise<string> {
    if (!this.api) {
      throw new Error('Midnight adapter not initialized');
    }

    const txHash = await this.api.contract.revokeCredential(credHash);
    return txHash;
  }
}
```

### Step 5: Add Lace Wallet Support to Frontend

**File**: `apps/web/src/hooks/useMidnightWallet.ts`

```typescript
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
        state: () => Promise<any>;
        serviceUriConfig: () => Promise<any>;
      };
    };
  }
}

export function useMidnightWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletState, setWalletState] = useState<any>(null);
  const [address, setAddress] = useState<string>('');

  const connectWallet = async () => {
    const wallet = window.midnight?.mnLace;
    
    if (!wallet) {
      throw new Error('Please install Lace Beta Wallet for Midnight Network');
    }

    try {
      const walletAPI = await wallet.enable();
      const state = await walletAPI.state();
      
      setWalletState(state);
      setAddress(state.address || '');
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletState(null);
    setAddress('');
    setIsConnected(false);
  };

  return {
    connectWallet,
    disconnectWallet,
    walletState,
    address,
    isConnected,
  };
}
```

### Step 6: Update Verifier API Configuration

**File**: `apps/verifier-api/.env`

```bash
PORT=8787
JWT_SECRET=production-secret-change-me
TOKEN_TTL_SECONDS=120
NODE_ENV=development

# Midnight Network Configuration
MIDNIGHT_CONTRACT_ADDRESS=contract_xxxx_address_here
MIDNIGHT_NETWORK=devnet
MIDNIGHT_ENABLE_MOCK=false
```

## 🚀 Deployment Workflow

### 1. Compile Compact Contract
```bash
cd contracts/minokawa
# Use Midnight CLI to compile
compact compile AgenticDIDRegistry.compact
```

### 2. Deploy to Devnet
```bash
# Generate contract instance from compiled output
# Deploy using MidnightSetupAPI
npm run deploy:devnet
```

### 3. Update Configuration
```bash
# Save deployed contract address
echo "MIDNIGHT_CONTRACT_ADDRESS=0x..." >> apps/verifier-api/.env
```

### 4. Test Integration
```bash
# Start dev servers with real Midnight connection
npm run dev
```

## 🧪 Testing Strategy

### Phase 2.1: Local Mock → Real Contract
- Keep mock adapter as fallback
- Add feature flag: `MIDNIGHT_ENABLE_MOCK`
- Test contract deployment on devnet
- Verify state queries work

### Phase 2.2: Frontend Wallet Integration
- Add Lace wallet connect button
- Test wallet state retrieval
- Verify transaction signing

### Phase 2.3: End-to-End Flow
- Register credential on-chain
- Verify credential status
- Test revocation flow
- Confirm ZK proofs

## 📋 Checklist for Phase 2

- [ ] Install @meshsdk/midnight-setup package
- [ ] Write Compact contract (AgenticDIDRegistry)
- [ ] Compile Compact → TypeScript API
- [ ] Deploy contract to devnet
- [ ] Update midnight-adapter with real MidnightSetupAPI
- [ ] Add Lace wallet support to frontend
- [ ] Create provider setup utilities
- [ ] Wire contract methods to verifier API
- [ ] Add environment configuration
- [ ] Test credential registration
- [ ] Test credential verification
- [ ] Test revocation flow
- [ ] Update UI with wallet connect
- [ ] Add transaction status tracking
- [ ] Document deployment process
- [ ] Create testnet deployment scripts

## 🔗 Resources

- **Midnight Docs**: https://docs.midnight.network
- **Mesh SDK Docs**: https://meshjs.dev/midnight
- **GitHub Examples**: https://github.com/midnightntwrk
- **Devnet Faucet**: (obtain tDUST tokens)
- **Compact Language**: Domain-specific for ZK circuits

## 🎯 Success Criteria

Phase 2 complete when:
1. ✅ Compact contract deployed to devnet
2. ✅ Real credential verification via Midnight
3. ✅ Lace wallet integration working
4. ✅ On-chain registration functional
5. ✅ Revocation updates contract state
6. ✅ ZK proofs generated and verified
7. ✅ Demo runs end-to-end on devnet

---

**Next Steps**: Start with installing @meshsdk/midnight-setup and writing the Compact contract.
