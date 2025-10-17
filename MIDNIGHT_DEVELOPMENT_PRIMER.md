# Midnight Development Primer
**Quick reference guide for building on Midnight Network**

> A practical guide for coding in Compact, structuring Midnight projects, and integrating with the Midnight stack. Use this as your go-to reference for future Midnight-based projects.

---

## 📁 Standard Project Structure

```
my-midnight-project/
├── contracts/
│   ├── MyContract.compact          # Compact smart contract
│   ├── compiled/                   # Compiler output
│   │   ├── contract-api.ts         # Generated TypeScript API
│   │   └── contract.json           # Contract metadata
│   └── tests/                      # Contract tests
├── src/
│   ├── midnight/
│   │   ├── adapter.ts              # Midnight adapter/wrapper
│   │   ├── providers.ts            # Provider setup
│   │   ├── types.ts                # TypeScript types
│   │   └── wallet.ts               # Wallet integration
│   ├── api/                        # Backend API (if needed)
│   └── frontend/                   # Frontend code
├── .env.example                    # Environment template
├── package.json
└── README.md
```

---

## 🎯 Compact Language Basics

### Core Syntax

**Compact looks like TypeScript but is more constrained:**

```compact
// Circuit definition (main contract)
circuit MyContract {
  // Private state (hidden from public)
  private secretData: Map<Bytes32, SecretStruct>;
  
  // Public state (visible on-chain)
  public totalCount: UInt64;
  public owner: Address;
  
  // Structs for data organization
  struct SecretStruct {
    value: UInt64,
    timestamp: UInt64,
    isActive: Boolean
  }
  
  // Public function (can be called by anyone)
  public function publicMethod(param: UInt64): Void {
    // Function body
  }
  
  // Private function (internal only)
  private function privateHelper(data: Bytes32): Boolean {
    // Helper logic
  }
}
```

### Data Types

**Primitive Types:**
```compact
Boolean         // true/false
UInt8           // 0-255
UInt16          // 0-65535
UInt32          // 0-4294967295
UInt64          // 0-18446744073709551615
Bytes32         // 32-byte hash
String          // Text data
Address         // Blockchain address
Void            // No return value
```

**Collection Types:**
```compact
Array<Type>              // Fixed or dynamic arrays
Map<KeyType, ValueType>  // Key-value mappings
Set<Type>                // Unique value collections
```

### Control Flow

```compact
// If statements
if (condition) {
  // do something
} else {
  // do something else
}

// Require (assertions)
require(condition, "Error message");

// Loops (limited in ZK circuits)
for (let i = 0; i < limit; i = i + 1) {
  // loop body
}
```

### Common Patterns

**State Management:**
```compact
circuit StateManager {
  private stateMap: Map<Bytes32, StateData>;
  public stateCount: UInt64;
  
  struct StateData {
    id: Bytes32,
    value: UInt64,
    active: Boolean,
    createdAt: UInt64
  }
  
  // Create new state
  public function createState(id: Bytes32, value: UInt64): Void {
    require(!stateMap.has(id), "State already exists");
    
    stateMap.set(id, StateData {
      id: id,
      value: value,
      active: true,
      createdAt: now()
    });
    
    stateCount = stateCount + 1;
  }
  
  // Read state
  public function getState(id: Bytes32): StateData {
    require(stateMap.has(id), "State not found");
    return stateMap.get(id);
  }
  
  // Update state
  public function updateState(id: Bytes32, newValue: UInt64): Void {
    require(stateMap.has(id), "State not found");
    
    let current = stateMap.get(id);
    current.value = newValue;
    stateMap.set(id, current);
  }
  
  // Delete/deactivate state
  public function deactivateState(id: Bytes32): Void {
    require(stateMap.has(id), "State not found");
    
    let current = stateMap.get(id);
    current.active = false;
    stateMap.set(id, current);
  }
}
```

**Access Control:**
```compact
circuit AccessControlled {
  public owner: Address;
  private admins: Set<Address>;
  
  // Modifier pattern (check in function)
  public function adminOnly(caller: Address): Void {
    require(admins.has(caller) || caller == owner, "Not authorized");
    // Function logic
  }
  
  // Add admin
  public function addAdmin(caller: Address, newAdmin: Address): Void {
    require(caller == owner, "Only owner can add admins");
    admins.add(newAdmin);
  }
}
```

**Time-based Logic:**
```compact
circuit TimeLocked {
  private lockTime: Map<Bytes32, UInt64>;
  
  public function lockUntil(id: Bytes32, timestamp: UInt64): Void {
    lockTime.set(id, timestamp);
  }
  
  public function isUnlocked(id: Bytes32): Boolean {
    if (!lockTime.has(id)) {
      return true;
    }
    return now() >= lockTime.get(id);
  }
}
```

---

## 🔌 TypeScript Integration

### Provider Setup

```typescript
// src/midnight/providers.ts
import { MidnightSetupContractProviders } from '@meshsdk/midnight-setup';

export async function setupProviders(): Promise<MidnightSetupContractProviders> {
  // 1. Connect to Lace Wallet
  const wallet = window.midnight?.mnLace;
  
  if (!wallet) {
    throw new Error('Lace Wallet required. Install from lace.io');
  }

  // 2. Enable wallet and get API
  const walletAPI = await wallet.enable();
  const walletState = await walletAPI.state();
  const uris = await wallet.serviceUriConfig();

  // 3. Return provider configuration
  return {
    wallet: walletAPI,
    fetcher: uris.indexer,      // For reading blockchain data
    submitter: uris.node,        // For submitting transactions
  };
}

// Alternative: Use custom providers
export async function setupCustomProviders(
  indexerUrl: string,
  nodeUrl: string
): Promise<MidnightSetupContractProviders> {
  const wallet = window.midnight?.mnLace;
  const walletAPI = await wallet.enable();

  return {
    wallet: walletAPI,
    fetcher: createFetcher(indexerUrl),
    submitter: createSubmitter(nodeUrl),
  };
}
```

### Contract Deployment

```typescript
// src/midnight/deploy.ts
import { MidnightSetupAPI } from '@meshsdk/midnight-setup';
import { setupProviders } from './providers';
import contractInstance from '../contracts/compiled/contract-api';

export async function deployContract(): Promise<{
  api: MidnightSetupAPI;
  address: string;
}> {
  try {
    // 1. Setup providers
    const providers = await setupProviders();

    // 2. Deploy contract
    console.log('Deploying contract...');
    const api = await MidnightSetupAPI.deployContract(
      providers,
      contractInstance
    );

    // 3. Get deployed address
    const address = api.deployedContractAddress;
    console.log('Contract deployed at:', address);

    // 4. Save address (to config/env)
    localStorage.setItem('midnight_contract_address', address);

    return { api, address };
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}
```

### Contract Interaction

```typescript
// src/midnight/adapter.ts
import { MidnightSetupAPI } from '@meshsdk/midnight-setup';
import { setupProviders } from './providers';
import contractInstance from '../contracts/compiled/contract-api';

export class MidnightAdapter {
  private api?: MidnightSetupAPI;
  private contractAddress?: string;

  // Initialize - join existing contract
  async initialize(contractAddress: string): Promise<void> {
    const providers = await setupProviders();
    
    this.api = await MidnightSetupAPI.joinContract(
      providers,
      contractInstance,
      contractAddress
    );
    
    this.contractAddress = contractAddress;
  }

  // Call contract method (read)
  async readMethod(param: string): Promise<any> {
    if (!this.api) throw new Error('Not initialized');
    
    try {
      const result = await this.api.contract.getState(param);
      return result;
    } catch (error) {
      console.error('Read failed:', error);
      throw error;
    }
  }

  // Call contract method (write/transaction)
  async writeMethod(param: string, value: number): Promise<string> {
    if (!this.api) throw new Error('Not initialized');
    
    try {
      const txHash = await this.api.contract.updateState(param, value);
      console.log('Transaction submitted:', txHash);
      return txHash;
    } catch (error) {
      console.error('Write failed:', error);
      throw error;
    }
  }

  // Get contract state
  async getContractState(): Promise<any> {
    if (!this.api) throw new Error('Not initialized');
    return await this.api.getContractState();
  }

  // Get ledger state
  async getLedgerState(): Promise<any> {
    if (!this.api) throw new Error('Not initialized');
    return await this.api.getLedgerState();
  }
}

// Singleton pattern
let adapterInstance: MidnightAdapter | null = null;

export async function getMidnightAdapter(
  contractAddress: string
): Promise<MidnightAdapter> {
  if (!adapterInstance) {
    adapterInstance = new MidnightAdapter();
    await adapterInstance.initialize(contractAddress);
  }
  return adapterInstance;
}
```

### Wallet Integration (React)

```typescript
// src/midnight/wallet.ts
import { useState, useEffect } from 'react';

interface WalletState {
  address: string;
  balance: string;
  network: string;
}

export function useMidnightWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connect = async () => {
    try {
      const wallet = window.midnight?.mnLace;
      
      if (!wallet) {
        throw new Error('Lace Wallet not found');
      }

      const api = await wallet.enable();
      const state = await api.state();

      setWalletState({
        address: state.address || '',
        balance: state.balance || '0',
        network: state.network || 'devnet',
      });
      
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setWalletState(null);
    setIsConnected(false);
  };

  // Check if wallet is available
  const isWalletInstalled = () => {
    return typeof window !== 'undefined' && !!window.midnight?.mnLace;
  };

  return {
    connect,
    disconnect,
    isConnected,
    walletState,
    error,
    isWalletInstalled: isWalletInstalled(),
  };
}
```

---

## 🎨 Frontend Patterns

### Wallet Connect Component

```tsx
// components/WalletConnect.tsx
import { useMidnightWallet } from '../midnight/wallet';

export function WalletConnect() {
  const { connect, disconnect, isConnected, walletState, error, isWalletInstalled } = 
    useMidnightWallet();

  if (!isWalletInstalled) {
    return (
      <div className="wallet-error">
        <p>Lace Wallet not installed</p>
        <a href="https://lace.io" target="_blank">Install Lace</a>
      </div>
    );
  }

  if (isConnected && walletState) {
    return (
      <div className="wallet-connected">
        <p>Connected: {walletState.address.slice(0, 8)}...</p>
        <p>Balance: {walletState.balance} tDUST</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button onClick={connect}>Connect Wallet</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Transaction Status Component

```tsx
// components/TransactionStatus.tsx
import { useState } from 'react';

interface TxStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export function TransactionStatus({ hash }: { hash: string }) {
  const [status, setStatus] = useState<TxStatus>({
    hash,
    status: 'pending',
  });

  // Poll for status (implement actual polling logic)
  const checkStatus = async () => {
    // Query Midnight indexer for tx status
    // Update status accordingly
  };

  return (
    <div className="tx-status">
      <p>Transaction: {hash.slice(0, 10)}...</p>
      <p>Status: {status.status}</p>
      {status.status === 'pending' && <Spinner />}
    </div>
  );
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# .env.example

# Midnight Network
MIDNIGHT_NETWORK=devnet                    # or testnet, mainnet
MIDNIGHT_CONTRACT_ADDRESS=contract_xxx     # Deployed contract address
MIDNIGHT_INDEXER_URL=https://indexer.midnight.network
MIDNIGHT_NODE_URL=https://node.midnight.network

# Feature Flags
MIDNIGHT_ENABLE_MOCK=false                 # Use mock adapter or real
MIDNIGHT_ENABLE_LOGGING=true               # Debug logging

# Wallet
LACE_REQUIRED_VERSION=1.0.0                # Minimum Lace version
```

### Type Declarations

```typescript
// src/types/midnight.d.ts

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<MidnightWalletAPI>;
        state: () => Promise<WalletState>;
        serviceUriConfig: () => Promise<ServiceUris>;
      };
    };
  }
}

interface MidnightWalletAPI {
  state: () => Promise<WalletState>;
  submitTransaction: (tx: any) => Promise<string>;
  balanceAndProveTransaction: (tx: any) => Promise<any>;
}

interface WalletState {
  address?: string;
  balance?: string;
  network?: string;
}

interface ServiceUris {
  indexer: string;
  node: string;
  prover?: string;
}

export {};
```

---

## 🧪 Testing Patterns

### Mock Adapter for Testing

```typescript
// src/midnight/__mocks__/adapter.ts

export class MockMidnightAdapter {
  private mockState: Map<string, any> = new Map();

  async initialize(address: string): Promise<void> {
    console.log('Mock: Initialized with', address);
  }

  async readMethod(param: string): Promise<any> {
    return this.mockState.get(param) || null;
  }

  async writeMethod(param: string, value: number): Promise<string> {
    this.mockState.set(param, value);
    return 'mock-tx-hash-' + Date.now();
  }

  async getContractState(): Promise<any> {
    return {
      state: 'mock',
      values: Array.from(this.mockState.entries()),
    };
  }
}
```

---

## 🚨 Common Gotchas & Best Practices

### ⚠️ Gotchas

1. **Compact is NOT full TypeScript**
   - No classes, promises, async/await in circuits
   - Limited standard library
   - Constraints for ZK proof generation

2. **State Updates are Transactions**
   - Every write operation costs gas (tDUST)
   - Transactions take time to confirm
   - Always handle async properly

3. **Private State is Still Recorded**
   - Private means "hidden from direct queries"
   - ZK proofs still prove things about private state
   - Not the same as encryption

4. **Wallet Connection is Required**
   - Users must have Lace installed
   - Connection can be rejected
   - Always check wallet availability

### ✅ Best Practices

1. **Structure Contracts Modularly**
   ```compact
   // Good: Separate concerns
   circuit Registry { /* core state */ }
   circuit AccessControl { /* permissions */ }
   circuit TimeLock { /* time logic */ }
   ```

2. **Use Descriptive Errors**
   ```compact
   require(caller == owner, "Only owner can perform this action");
   ```

3. **Validate Inputs**
   ```compact
   public function transfer(amount: UInt64): Void {
     require(amount > 0, "Amount must be positive");
     require(amount <= balance, "Insufficient balance");
     // proceed
   }
   ```

4. **Handle Errors Gracefully**
   ```typescript
   try {
     await adapter.writeMethod(param, value);
   } catch (error) {
     if (error.message.includes('insufficient funds')) {
       // Show friendly message
     }
     throw error;
   }
   ```

5. **Cache Contract State**
   ```typescript
   // Don't query on every render
   const [state, setState] = useState(null);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     async function load() {
       const data = await adapter.getContractState();
       setState(data);
       setLoading(false);
     }
     load();
   }, []);
   ```

---

## 📚 Quick Reference Snippets

### Deploy New Contract

```typescript
import { MidnightSetupAPI } from '@meshsdk/midnight-setup';
import { setupProviders } from './providers';
import contractInstance from './compiled/contract-api';

const providers = await setupProviders();
const api = await MidnightSetupAPI.deployContract(providers, contractInstance);
console.log('Deployed at:', api.deployedContractAddress);
```

### Join Existing Contract

```typescript
const api = await MidnightSetupAPI.joinContract(
  providers,
  contractInstance,
  'contract_address_here'
);
```

### Query State

```typescript
const state = await api.getContractState();
const ledger = await api.getLedgerState();
```

### Call Contract Method

```typescript
// Read (no transaction)
const value = await api.contract.getValue(key);

// Write (creates transaction)
const txHash = await api.contract.setValue(key, newValue);
```

### Connect Wallet

```typescript
const wallet = window.midnight?.mnLace;
const api = await wallet.enable();
const state = await api.state();
```

---

## 🎓 Learning Path

1. **Start Here**: Read official docs at docs.midnight.network
2. **Experiment**: Write simple Compact contracts
3. **Integrate**: Use @meshsdk/midnight-setup in TypeScript
4. **Deploy**: Test on devnet with tDUST
5. **Build**: Create full DApp with wallet integration

---

*Keep this primer handy for all your Midnight projects!*  
*Last updated: October 17, 2025*
