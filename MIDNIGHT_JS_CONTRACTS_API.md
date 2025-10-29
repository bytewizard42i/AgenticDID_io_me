# @midnight-ntwrk/midnight-js-contracts API Reference

**Package**: @midnight-ntwrk/midnight-js-contracts  
**Version**: Part of Midnight.js v2.0.2+  
**Purpose**: High-level utilities for interacting with Midnight smart contracts  
**Status**: ✅ Complete contract interaction layer

---

## 🎯 Overview

The `@midnight-ntwrk/midnight-js-contracts` package provides the primary interface for deploying, calling, and managing Midnight smart contracts. It abstracts away the complexity of transaction construction, proof generation, and state management.

### Key Capabilities

- ✅ **Contract Deployment** - Deploy new contracts to the blockchain
- ✅ **Circuit Invocation** - Call contract circuits with witnesses
- ✅ **State Management** - Handle public ledger and private witness state
- ✅ **Transaction Construction** - Build unproven and proven transactions
- ✅ **Contract Maintenance** - Update verifier keys and authorities
- ✅ **Contract Discovery** - Find and interact with deployed contracts

---

## 📋 Package Contents

### Classes (10 Error Classes)

All error classes extend the base `TxFailedError` (except `ContractTypeError` which extends `TypeError`):

1. **TxFailedError** - Base error for transaction failures
2. **CallTxFailedError** - Circuit call transaction failed
3. **DeployTxFailedError** - Contract deployment failed
4. **InsertVerifierKeyTxFailedError** - Verifier key insertion failed
5. **RemoveVerifierKeyTxFailedError** - Verifier key removal failed
6. **ReplaceMaintenanceAuthorityTxFailedError** - Authority replacement failed
7. **ContractTypeError** - Contract type mismatch
8. **IncompleteCallTxPrivateStateConfig** - Missing private state for call
9. **IncompleteFindContractPrivateStateConfig** - Missing private state for discovery

---

## 📋 Error Classes (Detailed)

### TxFailedError

Base error class for all transaction failures.

```typescript
class TxFailedError extends Error {
  constructor(finalizedTxData: FinalizedTxData, circuitId?: string)
  
  readonly finalizedTxData: FinalizedTxData;
  readonly circuitId?: string;
}
```

**Properties**:
- `finalizedTxData`: The finalization data of the transaction that failed
- `circuitId`: The name of the circuit (only defined for call transactions)

**Usage**: Base class for all transaction-related errors.

---

### CallTxFailedError

An error indicating that a call transaction was not successfully applied by the consensus node.

```typescript
class CallTxFailedError extends TxFailedError {
  constructor(finalizedTxData: FinalizedTxData, circuitId: string)
  
  readonly finalizedTxData: FinalizedTxData;
  readonly circuitId: string;
}
```

**Parameters**:
- `finalizedTxData`: The finalization data of the call transaction that failed
- `circuitId`: The name of the circuit that was called to build the transaction

**Properties**:
- `finalizedTxData`: Transaction data that failed (inherited)
- `circuitId`: Circuit name that was called (always defined for call errors)

**When Thrown**: When a circuit call transaction is rejected by the consensus node

**Example**:
```typescript
import { call, CallTxFailedError } from '@midnight-ntwrk/midnight-js-contracts';

try {
  const result = await call(contractAddress, 'myCircuit', options);
} catch (error) {
  if (error instanceof CallTxFailedError) {
    console.error(`Circuit ${error.circuitId} call failed`);
    console.error(`Transaction hash: ${error.finalizedTxData.transactionHash}`);
    console.error(`Reason: ${error.message}`);
    
    // Access finalized transaction data
    const txHash = error.finalizedTxData.transactionHash;
    const proof = error.finalizedTxData.proof;
  }
}
```

**Common Causes**:
- Invalid proof
- Gas limit exceeded
- Contract state mismatch
- Insufficient balance
- Contract logic rejection

---

### DeployTxFailedError

An error indicating that a deploy transaction was not successfully applied by the consensus node.

```typescript
class DeployTxFailedError extends TxFailedError {
  constructor(finalizedTxData: FinalizedTxData)
  
  readonly finalizedTxData: FinalizedTxData;
  readonly circuitId?: string; // Inherited but undefined for deploy errors
}
```

**Parameters**:
- `finalizedTxData`: The finalization data of the deployment transaction that failed

**Properties**:
- `finalizedTxData`: Transaction data that failed
- `circuitId`: undefined for deployment errors (inherited but not used)

**When Thrown**: When a contract deployment transaction is rejected by the consensus node

**Example**:
```typescript
import { deployContract, DeployTxFailedError } from '@midnight-ntwrk/midnight-js-contracts';

try {
  const deployed = await deployContract(options);
} catch (error) {
  if (error instanceof DeployTxFailedError) {
    console.error('Contract deployment failed');
    console.error(`Transaction hash: ${error.finalizedTxData.transactionHash}`);
    console.error(`Reason: ${error.message}`);
    
    // Inspect failed deployment
    const txData = error.finalizedTxData;
    console.error(`Initial state: ${JSON.stringify(txData.initialState)}`);
  }
}
```

**Common Causes**:
- Invalid contract bytecode
- Constructor proof verification failed
- Insufficient deployment fee
- Network congestion
- Invalid initial state

---

### ContractTypeError

The error that is thrown when there is a contract type mismatch between a given contract type, and the initial state that is deployed at a given contract address.

```typescript
class ContractTypeError extends TypeError {
  constructor(contractState: ContractState, circuitIds: string[])
  
  readonly contractState: ContractState;
  readonly circuitIds: string[];
}
```

**Parameters**:
- `contractState`: The initial deployed contract state
- `circuitIds`: The circuits that are undefined, or have a verifier key mismatch with the key present in contractState

**Properties**:
- `contractState`: The actual contract state found at the address
- `circuitIds`: List of circuits with mismatches or undefined

**When Thrown**: Typically during `findDeployedContract()` when the supplied contract address represents a different type of contract than expected

**Example**:
```typescript
import { findDeployedContract, ContractTypeError } from '@midnight-ntwrk/midnight-js-contracts';

try {
  const contract = await findDeployedContract({
    contractAddress: '0x123...',
    contractType: MyContractType,
    providers
  });
} catch (error) {
  if (error instanceof ContractTypeError) {
    console.error('Contract type mismatch!');
    console.error(`Expected circuits: ${expectedCircuits.join(', ')}`);
    console.error(`Mismatched circuits: ${error.circuitIds.join(', ')}`);
    console.error(`Actual state: ${JSON.stringify(error.contractState)}`);
    
    // Check which circuits don't match
    error.circuitIds.forEach(circuitId => {
      console.error(`Circuit ${circuitId}: verifier key mismatch or undefined`);
    });
  }
}
```

**Common Causes**:
- Wrong contract address
- Contract was upgraded (verifier keys changed)
- Using wrong compiled contract code
- Contract type definition mismatch

**Recovery**:
- Verify contract address is correct
- Check if contract was upgraded
- Ensure you have the correct contract type definition
- Update your compiled contract if needed

---

### InsertVerifierKeyTxFailedError

An error indicating that a verifier key insertion transaction failed.

```typescript
class InsertVerifierKeyTxFailedError extends TxFailedError {
  constructor(finalizedTxData: FinalizedTxData)
  
  readonly finalizedTxData: FinalizedTxData;
}
```

**When Thrown**: When attempting to insert a new verifier key (contract upgrade) and the transaction is rejected

**Common Causes**:
- Not authorized to update contract
- Invalid verifier key format
- Circuit version already exists
- Incorrect maintenance authority

---

### RemoveVerifierKeyTxFailedError

An error indicating that a verifier key removal transaction failed.

```typescript
class RemoveVerifierKeyTxFailedError extends TxFailedError {
  constructor(finalizedTxData: FinalizedTxData)
  
  readonly finalizedTxData: FinalizedTxData;
}
```

**When Thrown**: When attempting to remove a verifier key and the transaction is rejected

**Common Causes**:
- Not authorized to update contract
- Verifier key doesn't exist
- Cannot remove last verifier key
- Incorrect maintenance authority

---

### ReplaceMaintenanceAuthorityTxFailedError

An error indicating that a maintenance authority replacement transaction failed.

```typescript
class ReplaceMaintenanceAuthorityTxFailedError extends TxFailedError {
  constructor(finalizedTxData: FinalizedTxData)
  
  readonly finalizedTxData: FinalizedTxData;
}
```

**When Thrown**: When attempting to replace the contract's maintenance authority and the transaction is rejected

**Common Causes**:
- Not current authority
- Invalid new authority format
- Authority transfer not allowed by contract

---

### IncompleteCallTxPrivateStateConfig

An error indicating that a private state ID was specified for a call transaction while a private state provider was not.

```typescript
class IncompleteCallTxPrivateStateConfig extends Error {
  constructor()
}
```

**Purpose**: Let the user know that the private state of a contract was NOT updated when they might expect it to be.

**When Thrown**: When a private state ID is specified in call options but no private state provider is configured

**Why This Matters**: Without a provider, the private state cannot be persisted, and the user needs to know their state wasn't actually saved.

**Example**:
```typescript
try {
  await call(address, 'circuit', {
    arguments: { value: 42 },
    witnesses: { secret: mySecret },
    privateStateId: 'my-state',  // ❌ ID provided
    providers: {
      zkConfigProvider,
      proofProvider,
      indexer
      // ❌ Missing privateStateProvider!
    }
  });
} catch (error) {
  if (error instanceof IncompleteCallTxPrivateStateConfig) {
    console.error('Private state ID provided without provider!');
    console.error('Private state was NOT saved.');
    console.error('Add privateStateProvider to providers object.');
  }
}
```

**Fix**:
```typescript
// ✅ Correct: Provide both ID and provider
await call(address, 'circuit', {
  arguments: { value: 42 },
  privateStateId: 'my-state',
  providers: {
    zkConfigProvider,
    proofProvider,
    indexer,
    privateStateProvider  // ✅ Now included!
  }
});
```

---

### IncompleteFindContractPrivateStateConfig

An error indicating that an initial private state was specified for a contract find while a private state ID was not.

```typescript
class IncompleteFindContractPrivateStateConfig extends Error {
  constructor()
}
```

**Purpose**: We can't store the initial private state if we don't have a private state ID. The user needs to know this.

**When Thrown**: When finding a deployed contract with initial private state specified but no state ID to store it under

**Why This Matters**: Without an ID, there's no way to persist the private state, so it will be lost.

**Example**:
```typescript
try {
  await findDeployedContract({
    contractAddress: '0x123...',
    privateStateConfig: {
      store: true,
      initialState: myPrivateState,  // ❌ State provided
      // ❌ Missing stateId!
    },
    providers
  });
} catch (error) {
  if (error instanceof IncompleteFindContractPrivateStateConfig) {
    console.error('Initial private state provided without ID!');
    console.error('Cannot store private state without an ID.');
    console.error('Provide stateId in privateStateConfig.');
  }
}
```

**Fix**:
```typescript
// ✅ Correct: Provide both initial state and ID
await findDeployedContract({
  contractAddress: '0x123...',
  privateStateConfig: {
    store: true,
    stateId: 'my-contract-state',  // ✅ ID provided
    initialState: myPrivateState
  },
  providers
});
```

---

## 🔧 Core Functions

### Contract Deployment

#### deployContract()

Deploy a new contract to the Midnight blockchain.

```typescript
function deployContract<T>(
  options: DeployContractOptions<T>
): Promise<DeployedContract<T>>
```

**Parameters**:
- `options`: Configuration including:
  - `contract`: Compiled contract code
  - `initialState`: Initial ledger state
  - `privateState`: Optional private state
  - `providers`: ZK config, proof, indexer providers

**Returns**: `DeployedContract<T>` with contract address and initial state

**Example**:
```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

const deployed = await deployContract({
  contract: compiledContract,
  initialState: {
    owner: ownerPublicKey,
    counter: 0n
  },
  privateState: myPrivateState,
  providers: {
    zkConfigProvider,
    proofProvider,
    indexer
  }
});

console.log(`Contract deployed at: ${deployed.contractAddress}`);
```

---

#### createUnprovenDeployTx()

Create an unproven deployment transaction (without proof).

```typescript
function createUnprovenDeployTx(
  options: UnprovenDeployTxOptions
): Promise<UnsubmittedDeployTxData>
```

**Usage**: Lower-level function for custom deployment flows.

---

#### submitDeployTx()

Submit a deployment transaction with proof.

```typescript
function submitDeployTx(
  txData: FinalizedDeployTxData,
  options: SubmitTxOptions
): Promise<void>
```

---

### Contract Calls

#### call()

Call a contract circuit (execute and submit).

```typescript
function call<TCircuitName, TArgs, TResult>(
  contractAddress: string,
  circuitName: TCircuitName,
  options: CallOptions<TArgs>
): Promise<CallResult<TResult>>
```

**Parameters**:
- `contractAddress`: Target contract address
- `circuitName`: Circuit to invoke
- `options`: Arguments, witnesses, providers

**Returns**: `CallResult<TResult>` with public outputs and updated state

**Example**:
```typescript
import { call } from '@midnight-ntwrk/midnight-js-contracts';

const result = await call(
  contractAddress,
  'registerAgent',
  {
    arguments: {
      did: '0xabc...',
      credential: credentialData
    },
    witnesses: {
      secretKey: await privateState.get('secretKey')
    },
    providers: {
      zkConfigProvider,
      proofProvider,
      indexer
    }
  }
);

console.log(`Registration successful: ${result.public.success}`);
```

---

#### createUnprovenCallTx()

Create an unproven call transaction.

```typescript
function createUnprovenCallTx(
  options: CallTxOptions
): Promise<UnsubmittedCallTxData>
```

**Usage**: Prepare transaction before proof generation.

---

#### submitCallTx()

Submit a call transaction with proof.

```typescript
function submitCallTx(
  txData: FinalizedCallTxData,
  options: SubmitTxOptions
): Promise<void>
```

---

### Contract Discovery

#### findDeployedContract()

Find and connect to an already-deployed contract.

```typescript
function findDeployedContract<T>(
  options: FindDeployedContractOptions<T>
): Promise<FoundContract<T>>
```

**Parameters**:
- `contractAddress`: Address of deployed contract
- `privateStateConfig`: How to handle private state
- `providers`: Required providers

**Returns**: `FoundContract<T>` ready for interaction

**Example**:
```typescript
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

const contract = await findDeployedContract({
  contractAddress: '0x123...',
  privateStateConfig: {
    store: true,
    stateId: 'my-contract-state'
  },
  providers: {
    zkConfigProvider,
    indexer
  }
});

// Now interact with the contract
const result = await call(contract.address, 'myCircuit', options);
```

---

### State Queries

#### getStates()

Get both public ledger state and private witness state.

```typescript
function getStates<T>(
  contractAddress: string,
  providers: ContractProviders
): Promise<ContractStates<T>>
```

**Returns**:
- `public`: On-chain ledger state
- `private`: Local witness state (if available)

**Example**:
```typescript
import { getStates } from '@midnight-ntwrk/midnight-js-contracts';

const states = await getStates(contractAddress, providers);

console.log(`Counter: ${states.public.counter}`);
console.log(`Secret: ${states.private?.mySecret}`);
```

---

#### getPublicStates()

Get only the public ledger state.

```typescript
function getPublicStates<T>(
  contractAddress: string,
  indexer: IndexerProvider
): Promise<PublicContractStates<T>>
```

**Usage**: When you don't need private state.

---

### Contract Maintenance

#### submitInsertVerifierKeyTx()

Insert a new verifier key (contract upgrade).

```typescript
function submitInsertVerifierKeyTx(
  contractAddress: string,
  operationName: string,
  version: bigint,
  verifierKey: VerifierKey,
  options: SubmitTxOptions
): Promise<void>
```

**Usage**: Add support for new circuit versions.

---

#### submitRemoveVerifierKeyTx()

Remove an old verifier key.

```typescript
function submitRemoveVerifierKeyTx(
  contractAddress: string,
  operationName: string,
  version: bigint,
  options: SubmitTxOptions
): Promise<void>
```

**Usage**: Remove support for deprecated circuits.

---

#### submitReplaceAuthorityTx()

Replace the contract's maintenance authority.

```typescript
function submitReplaceAuthorityTx(
  contractAddress: string,
  newAuthority: ContractMaintenanceAuthority,
  options: SubmitTxOptions
): Promise<void>
```

**Usage**: Transfer contract upgrade rights.

---

### Utility Functions

#### callContractConstructor()

Call the contract constructor during deployment.

```typescript
function callContractConstructor<T>(
  options: ContractConstructorOptions<T>
): Promise<ContractConstructorResult<T>>
```

---

#### verifyContractState()

Verify that contract state matches expectations.

```typescript
function verifyContractState<T>(
  expected: T,
  actual: T
): boolean
```

---

#### verifierKeysEqual()

Compare two verifier keys for equality.

```typescript
function verifierKeysEqual(
  key1: VerifierKey,
  key2: VerifierKey
): boolean
```

---

## 📝 Key Type Aliases

### Contract Options

#### DeployContractOptions

Complete options for deploying a contract.

```typescript
type DeployContractOptions<T> = {
  contract: CompiledContract;
  initialState?: T;
  privateState?: PrivateState;
  providers: ContractProviders;
  constructorArgs?: any[];
};
```

---

#### CallOptions

Options for calling a circuit.

```typescript
type CallOptions<TArgs> = {
  arguments: TArgs;
  witnesses?: Record<string, any>;
  providers: ContractProviders;
  gasLimit?: bigint;
};
```

---

#### FindDeployedContractOptions

Options for finding a deployed contract.

```typescript
type FindDeployedContractOptions<T> = {
  contractAddress: string;
  privateStateConfig: {
    store: boolean;
    stateId?: string;
    existingState?: PrivateState;
  };
  providers: ContractProviders;
};
```

---

### Results

#### DeployedContract

Result of successful deployment.

```typescript
type DeployedContract<T> = {
  contractAddress: string;
  initialState: PublicContractStates<T>;
  transactionHash: string;
};
```

---

#### CallResult

Result of circuit call.

```typescript
type CallResult<T> = {
  public: T;
  private?: any;
  transactionHash: string;
  gasUsed: bigint;
};
```

---

#### FoundContract

Result of finding a deployed contract.

```typescript
type FoundContract<T> = {
  contractAddress: string;
  currentState: ContractStates<T>;
  metadata: ContractMetadata;
};
```

---

### State Types

#### ContractStates

Combined public and private state.

```typescript
type ContractStates<T> = {
  public: PublicContractStates<T>;
  private?: PrivateState;
};
```

---

#### PublicContractStates

On-chain ledger state.

```typescript
type PublicContractStates<T> = {
  ledger: T;
  blockNumber: bigint;
  blockTimestamp: bigint;
};
```

---

### Providers

#### ContractProviders

Required providers for contract operations.

```typescript
type ContractProviders = {
  zkConfigProvider: ZkConfigProvider;
  proofProvider: ProofProvider;
  indexer: IndexerProvider;
  privateStateProvider?: PrivateStateProvider;
};
```

---

### Transaction Data

#### UnsubmittedCallTxData

Unproven call transaction ready for proof generation.

```typescript
type UnsubmittedCallTxData = {
  unprovenTx: UnprovenTransaction;
  witnesses: Record<string, any>;
  publicInputs: any;
};
```

---

#### FinalizedCallTxData

Proven call transaction ready for submission.

```typescript
type FinalizedCallTxData = {
  provenTx: Transaction;
  proof: Proof;
  transactionHash: string;
};
```

---

## 🎯 Complete Usage Example

```typescript
import {
  deployContract,
  findDeployedContract,
  call,
  getStates
} from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';

// 1. Configure network
setNetworkId(NetworkId.TestNet);

// 2. Initialize providers
const providers = {
  zkConfigProvider,
  proofProvider,
  indexer,
  privateStateProvider
};

// 3. Deploy contract
const deployed = await deployContract({
  contract: compiledMyContract,
  initialState: {
    owner: myPublicKey,
    counter: 0n
  },
  privateState: {
    secretKey: mySecretKey
  },
  providers
});

console.log(`Deployed at: ${deployed.contractAddress}`);

// 4. Find contract (in another session)
const contract = await findDeployedContract({
  contractAddress: deployed.contractAddress,
  privateStateConfig: {
    store: true,
    stateId: 'my-app-state'
  },
  providers
});

// 5. Call circuit
const result = await call(
  contract.contractAddress,
  'increment',
  {
    arguments: { amount: 5n },
    witnesses: {
      secretKey: await privateStateProvider.get('secretKey')
    },
    providers
  }
);

console.log(`New counter: ${result.public.counter}`);

// 6. Query state
const states = await getStates(contract.contractAddress, providers);
console.log(`Public counter: ${states.public.counter}`);
console.log(`Private data: ${states.private?.mySecret}`);
```

---

## 🔐 Error Handling

All contract operations can throw specific error classes:

```typescript
import {
  call,
  CallTxFailedError,
  ContractTypeError
} from '@midnight-ntwrk/midnight-js-contracts';

try {
  const result = await call(contractAddress, 'myCircuit', options);
} catch (error) {
  if (error instanceof CallTxFailedError) {
    console.error('Circuit call failed:', error.message);
    console.error('Transaction hash:', error.transactionHash);
  } else if (error instanceof ContractTypeError) {
    console.error('Contract type mismatch:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## 🎨 Design Patterns

### 1. High-Level vs Low-Level APIs

**High-Level** (Recommended):
```typescript
// One function does everything
const result = await call(address, 'circuit', options);
```

**Low-Level** (Advanced):
```typescript
// Manual control over each step
const unprovenTx = await createUnprovenCallTx(txOptions);
const proof = await proofProvider.prove(unprovenTx);
const finalizedTx = finalizeTx(unprovenTx, proof);
await submitCallTx(finalizedTx, submitOptions);
```

---

### 2. Private State Management

**Store private state**:
```typescript
const options = {
  privateStateConfig: {
    store: true,
    stateId: 'unique-id'
  }
};
```

**Use existing private state**:
```typescript
const options = {
  privateStateConfig: {
    store: false,
    existingState: myPrivateState
  }
};
```

---

### 3. Provider Injection

All functions use dependency injection for testability:

```typescript
// Production providers
const providers = {
  zkConfigProvider: new FetchZkConfigProvider(url),
  proofProvider: new HttpClientProofProvider(url),
  indexer: new IndexerPublicDataProvider(url)
};

// Test providers (mocks)
const testProviders = {
  zkConfigProvider: mockZkProvider,
  proofProvider: mockProofProvider,
  indexer: mockIndexer
};
```

---

## 📚 Related Documentation

- **[Midnight.js Framework](MIDNIGHT_JS_API_REFERENCE.md)** - Complete framework overview
- **[@midnight-ntwrk/ledger](LEDGER_API_REFERENCE.md)** - Low-level transaction assembly (129 items)
- **[Compact Runtime API](i_am_Midnight_LLM_ref.md)** - Smart contract runtime (70+ functions)
- **[DApp Connector API](DAPP_CONNECTOR_API_REFERENCE.md)** - Wallet integration

---

## 🎯 Best Practices

### 1. Always Set Network ID First

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';

// MUST be called before any contract operations
setNetworkId(NetworkId.TestNet);
```

---

### 2. Handle Private State Carefully

**DO**:
- ✅ Store private state in LevelPrivateStateProvider
- ✅ Back up private state
- ✅ Use unique state IDs per contract

**DON'T**:
- ❌ Never send private state to the blockchain
- ❌ Never log witnesses
- ❌ Never share private state across users

---

### 3. Use High-Level Functions

Prefer `call()` and `deployContract()` over lower-level functions unless you need fine-grained control.

---

### 4. Error Recovery

```typescript
// Retry logic for transient failures
async function callWithRetry(address, circuit, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await call(address, circuit, options);
    } catch (error) {
      if (error instanceof CallTxFailedError && i < maxRetries - 1) {
        await sleep(1000 * Math.pow(2, i)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

---

## 🎊 Summary

The `@midnight-ntwrk/midnight-js-contracts` package provides:

- ✅ **20+ functions** for contract interaction
- ✅ **40+ type aliases** for type safety
- ✅ **10 error classes** for precise error handling
- ✅ **High-level APIs** for common operations
- ✅ **Low-level APIs** for advanced use cases
- ✅ **Complete state management** (public + private)
- ✅ **Contract lifecycle** (deploy, call, maintain, discover)

**Primary Interface**: This is the main package you'll use for all contract interactions in Midnight applications!

---

**Package**: @midnight-ntwrk/midnight-js-contracts  
**Part of**: Midnight.js v2.0.2+  
**Status**: ✅ Complete contract interaction layer  
**Last Updated**: October 28, 2025
