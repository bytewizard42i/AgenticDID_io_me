# Ledger API Reference

**@midnight-ntwrk/ledger v3.0.2**  
**Midnight Ledger TypeScript API**  
**Updated**: October 28, 2025

> ⚙️ **Transaction assembly and ledger state management**

---

## Overview

This document outlines the flow of transaction assembly and usage with the Ledger TypeScript API. The Ledger API provides the core functionality for:
- Transaction construction and assembly
- Zswap (shielded token) operations
- Contract call and deployment management
- Ledger state tracking

---

## Installation

```bash
# Using Yarn
yarn add @midnight-ntwrk/ledger

# Using NPM
npm install @midnight-ntwrk/ledger
```

---

## API Classes

### AuthorizedMint

A request to mint a coin, authorized by the mint's recipient.

```typescript
class AuthorizedMint {
  private constructor();
  
  readonly coin: CoinInfo;          // The coin to be minted
  readonly recipient: string;        // The recipient of this mint
  
  erase_proof(): ProofErasedAuthorizedMint;
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): AuthorizedMint;
}
```

**Properties**:
- `coin`: The coin to be minted
- `recipient`: The recipient of this mint

**Methods**:
- `erase_proof()`: Returns proof-erased version for testing
- `serialize()`: Serialize to bytes for network transmission
- `toString()`: Human-readable string representation
- `deserialize()`: Deserialize from bytes

---

### ContractCall

A single contract call segment.

```typescript
class ContractCall {
  private constructor();
  
  readonly address: string;                                      // Address being called
  readonly entryPoint: string | Uint8Array;                      // Entry point being called
  readonly guaranteedTranscript: undefined | Transcript<AlignedValue>;  // Guaranteed stage
  readonly fallibleTranscript: undefined | Transcript<AlignedValue>;    // Fallible stage
  readonly communicationCommitment: string;                      // Communication commitment
  
  toString(compact?: boolean): string;
}
```

**Properties**:
- `address`: The address being called
- `entryPoint`: The entry point being called
- `guaranteedTranscript`: The guaranteed execution stage transcript
- `fallibleTranscript`: The fallible execution stage transcript
- `communicationCommitment`: The communication commitment of this call

---

### ContractCallPrototype

A ContractCall still being assembled.

```typescript
class ContractCallPrototype {
  constructor(
    address: string,                                              // Address being called
    entry_point: string | Uint8Array,                            // Entry point being called
    op: ContractOperation,                                        // Expected operation
    guaranteed_public_transcript: undefined | Transcript<AlignedValue>,  // Guaranteed transcript
    fallible_public_transcript: undefined | Transcript<AlignedValue>,    // Fallible transcript
    private_transcript_outputs: AlignedValue[],                  // Private transcript outputs
    input: AlignedValue,                                          // Input(s) provided
    output: AlignedValue,                                         // Output(s) computed
    communication_commitment_rand: string,                        // Communication randomness
    key_location: string                                          // Key lookup identifier
  );
  
  toString(compact?: boolean): string;
}
```

**Parameters**:
- `address`: The address being called
- `entry_point`: The entry point being called
- `op`: The operation expected at this entry point
- `guaranteed_public_transcript`: The guaranteed transcript computed for this call
- `fallible_public_transcript`: The fallible transcript computed for this call
- `private_transcript_outputs`: The private transcript recorded for this call
- `input`: The input(s) provided to this call
- `output`: The output(s) computed from this call
- `communication_commitment_rand`: The communication randomness used for this call
- `key_location`: An identifier for how the key for this call may be looked up

---

### ContractCallsPrototype

An atomic collection of ContractActions, which may interact with each other.

```typescript
class ContractCallsPrototype {
  constructor();
  
  addCall(call: ContractCallPrototype): ContractCallsPrototype;
  addDeploy(deploy: ContractDeploy): ContractCallsPrototype;
  addMaintenanceUpdate(upd: MaintenanceUpdate): ContractCallsPrototype;
  toString(compact?: boolean): string;
}
```

**Methods**:
- `addCall()`: Add a contract call to the collection
- `addDeploy()`: Add a contract deployment to the collection
- `addMaintenanceUpdate()`: Add a maintenance update to the collection
- `toString()`: String representation

---

### ContractDeploy

A contract deployment segment, instructing the creation of a new contract address (if not already present).

```typescript
class ContractDeploy {
  constructor(initial_state: ContractState);  // Creates deployment with randomized address
  
  readonly address: string;               // Address this deployment will create
  readonly initialState: ContractState;   // Initial contract state
  
  toString(compact?: boolean): string;
}
```

**Constructor**:
- Creates a deployment for an arbitrary contract state
- The deployment and its address are randomized

**Properties**:
- `address`: The address this deployment will attempt to create
- `initialState`: The initial state for the deployed contract

---

### ContractMaintenanceAuthority

A committee permitted to make changes to this contract.

```typescript
class ContractMaintenanceAuthority {
  constructor(
    committee: string[],      // Committee public keys
    threshold: number,        // Required signatures
    counter?: bigint          // Replay protection counter (default 0n)
  );
  
  readonly committee: string[];    // Committee public keys
  readonly threshold: number;      // How many keys must sign rule changes
  readonly counter: bigint;        // Replay protection counter
  
  serialize(networkid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, networkid: NetworkId): ContractState;
}
```

**Description**:
If a threshold of the public keys in this committee sign off, they can change the rules of this contract or recompile it for a new version.

If the threshold is greater than the number of committee members, it is impossible for them to sign anything.

**Constructor**:
- Values should be non-negative, and at most 2^32 - 1
- At deployment, counter must be 0n
- Any subsequent update should set counter to exactly one greater than the current value

---

### ContractOperation

An individual operation or entry point of a contract.

```typescript
class ContractOperation {
  constructor();
  
  verifierKey: Uint8Array;    // ZK verifier key (latest version)
  
  serialize(networkid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, networkid: NetworkId): ContractOperation;
}
```

**Description**:
Consists primarily of ZK verifier keys, potentially for different versions of the proving system. Only the latest available version is exposed to this API.

**Note**: The serialized form of the key is checked on initialization.

---

### ContractOperationVersion

The version associated with a ContractOperation.

```typescript
class ContractOperationVersion {
  constructor(version: "v1");
  
  readonly version: "v1";    // Currently only v1 supported
  
  toString(compact?: boolean): string;
}
```

---

## Network Configuration

### setNetworkId()

Prior to any interaction, `setNetworkId` should be used to set the NetworkId to target the correct network.

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/ledger';

// Set network before any operations
setNetworkId(NetworkId.TestNet);
```

**Available Networks**:
- `NetworkId.Undeployed` - Local test network
- `NetworkId.DevNet` - Developer network
- `NetworkId.TestNet` - Persistent testnet
- `NetworkId.MainNet` - Midnight mainnet

---

## Proof Stages

Most transaction components exist in one of three stages:

### Stage 1: UnprovenX

The initial stage - always the first one.

```typescript
// Example: UnprovenTransaction
const unprovenTx: UnprovenTransaction = /* ... */;
```

### Stage 2: X (Proven)

The proven stage - reached by proving an UnprovenTransaction through the proof server.

```typescript
// Prove the transaction
const provenTx: Transaction = await proveTransaction(unprovenTx);
```

### Stage 3: ProofErasedX

For testing where proofs aren't necessary - can be reached via `eraseProof[s]` from the other two stages.

```typescript
// Erase proof for testing
const proofErasedTx: ProofErasedTransaction = eraseProof(unprovenTx);
```

**Transition Flow**:
```
UnprovenX → X (via proving)
    ↓
ProofErasedX (via eraseProof for testing)
```

---

## Transaction Structure

A `Transaction` runs in two phases:

### 1. Guaranteed Phase

Handles fee payments and fast-to-verify operations.

**Contains**:
- A "guaranteed" Zswap Offer (required)

### 2. Fallible Phase

Handles operations which may fail atomically, separate from the guaranteed phase.

**Contains**:
- Optionally, a "fallible" Zswap Offer
- Optionally, a sequence of `ContractCall`s or `ContractDeploy`s

**Complete Transaction Structure**:
```typescript
interface Transaction {
  guaranteedOffer: Offer;                   // Required
  fallibleOffer?: Offer;                    // Optional
  calls?: (ContractCall | ContractDeploy)[]; // Optional
  // Additional cryptographic glue
}
```

---

## Zswap (Shielded Tokens)

### Offer Structure

A Zswap `Offer` consists of:

```typescript
interface Offer {
  inputs: Input[];              // Set of Inputs (burning coins)
  outputs: Output[];            // Set of Outputs (creating coins)
  transients: Transient[];      // Coins created and burnt in same tx
  balances: Map<TokenType, bigint>; // Offer balance by token type
}
```

**Balance Calculation**:
- **Positive balance**: More inputs than outputs (providing tokens)
- **Negative balance**: More outputs than inputs (consuming tokens)

---

### Creating Inputs

Inputs burn existing coins.

#### Contract-Owned Coins

```typescript
import { createInput } from '@midnight-ntwrk/ledger';

const input = createInput(
  qualifiedCoinInfo,    // QualifiedCoinInfo
  contractAddress       // Contract address owning the coin
);
```

#### User-Owned Coins

```typescript
const input = createInput(
  qualifiedCoinInfo,    // QualifiedCoinInfo
  zswapLocalState       // User's ZswapLocalState
);
```

---

### Creating Outputs

Outputs create new coins.

#### Contract-Owned Coins

```typescript
import { createOutput } from '@midnight-ntwrk/ledger';

const output = createOutput(
  coinInfo,             // CoinInfo
  contractAddress       // Contract address to own the coin
);
```

#### User-Owned Coins

```typescript
const output = createOutput(
  coinInfo,                 // CoinInfo
  userCoinPublicKey,        // User's coin public key
  userEncryptionPublicKey   // User's encryption public key
);
```

---

### Creating Transients

A `Transient` indicates a coin created and burnt in the same transaction.

```typescript
import { createTransient } from '@midnight-ntwrk/ledger';

// From contract-owned coin
const transient = createTransient(
  existingOutput,       // Output to convert to transient
  contractAddress
);

// From user-owned coin
const transient = createTransient(
  existingOutput,
  zswapLocalState
);
```

---

### Coin Information Types

#### CoinInfo

A coin without Merkle tree location (used for creating new coins).

```typescript
interface CoinInfo {
  type: TokenType;      // Token type identifier
  value: bigint;        // Coin value (non-negative 64-bit)
  nonce: Nonce;         // Randomness (prevents collisions)
}
```

#### QualifiedCoinInfo

A coin with Merkle tree location (used for spending existing coins).

```typescript
interface QualifiedCoinInfo extends CoinInfo {
  mt_index: bigint;     // Index in Merkle tree of commitments
}
```

---

## Contract Operations

### ContractDeploy

Deploys a new contract to the network.

```typescript
interface ContractDeploy {
  initialState: ContractState;    // Initial contract state
  nonce: Nonce;                   // Deployment nonce
}
```

**Creating a Contract Deployment**:
```typescript
import { createContractDeploy } from '@midnight-ntwrk/ledger';

const deployment = createContractDeploy(
  initialContractState,
  deploymentNonce
);
```

---

### ContractCall

Calls an existing contract's entry point.

```typescript
interface ContractCall {
  address: ContractAddress;           // Contract address
  entryPoint: string;                 // Entry point name
  guaranteedTranscript: Transcript;   // Guaranteed phase transcript
  fallibleTranscript: Transcript;     // Fallible phase transcript
  communicationCommitment: string;    // Communications commitment
  proof: Proof;                       // Zero-knowledge proof
}
```

---

### ContractCallPrototype

ContractCalls are constructed via `ContractCallPrototype`s, which consist of:

```typescript
interface ContractCallPrototype {
  contractAddress: ContractAddress;
  entryPoint: string;
  contractOperation: ContractOperation;     // Expected verifier key & shape
  guaranteedTranscript: Transcript;         // From generated JS code
  fallibleTranscript: Transcript;           // From generated JS code
  privateOracleOutputs: AlignedValue;       // Private oracle call outputs (FAB)
  inputs: AlignedValue;                     // Concatenated inputs (FAB)
  outputs: AlignedValue;                    // Concatenated outputs (FAB)
  communicationCommitmentRandomness: string; // Hex-encoded field element
  zkCircuitId: string;                      // Unique ZK circuit identifier
}
```

**Field-Aligned Binary (FAB)**: A compact binary representation used internally.

---

### Assembling Contract Calls

```typescript
import { ContractCalls, addContractCall } from '@midnight-ntwrk/ledger';

// Create ContractCalls object
const calls = new ContractCalls();

// Add contract call prototype
calls.add(contractCallPrototype);

// Add contract deployment
calls.add(contractDeploy);

// Insert into transaction
const unprovenTx = new UnprovenTransaction({
  guaranteedOffer,
  fallibleOffer,
  calls
});
```

---

## Ledger State Structure

### LedgerState

The primary entry point for Midnight's ledger state.

```typescript
interface LedgerState {
  zswapChainState: ZswapChainState;              // Zswap state
  contracts: Map<ContractAddress, ContractState>; // Contract states
}
```

**Properties**:
- `zswapChainState`: The current state of the Zswap (shielded token) system
- `contracts`: Mapping from contract addresses to their current states

**Immutability**: States are immutable - applying transactions always produces new output states.

---

### ZswapChainState

Tracks the global Zswap state including all coin commitments and nullifiers.

```typescript
interface ZswapChainState {
  commitments: MerkleTree;          // Tree of coin commitments
  nullifiers: Set<Nullifier>;       // Set of spent nullifiers
  balances: Map<TokenType, bigint>; // Global token balances
}
```

---

### ContractState

Represents the state of an individual contract.

```typescript
interface ContractState {
  data: StateValue;                              // Contract's state data
  maintenanceAuthority: ContractMaintenanceAuthority;
  operations: Map<string, ContractOperation>;    // Available entry points
}
```

---

## Transaction Assembly Workflow

### Complete Flow

```typescript
import { 
  setNetworkId, 
  NetworkId,
  UnprovenTransaction,
  createInput,
  createOutput,
  ContractCalls
} from '@midnight-ntwrk/ledger';

// Step 1: Set network
setNetworkId(NetworkId.TestNet);

// Step 2: Create Zswap offers
const guaranteedOffer = {
  inputs: [createInput(qualifiedCoin, zswapState)],
  outputs: [createOutput(newCoin, recipientPubKey, encryptionKey)],
  transients: [],
  balances: new Map()
};

// Step 3: Create contract calls (if any)
const calls = new ContractCalls();
calls.add(contractCallPrototype);

// Step 4: Assemble unproven transaction
const unprovenTx = new UnprovenTransaction({
  guaranteedOffer,
  fallibleOffer,
  calls
});

// Step 5: Prove transaction (via proof server)
const provenTx = await proveTransaction(unprovenTx);

// Step 6: Submit to network
const txHash = await submitTransaction(provenTx);
```

---

## State Management

### Applying Transactions

```typescript
import { applyTransaction } from '@midnight-ntwrk/ledger';

// Apply transaction to state
const newState: LedgerState = applyTransaction(
  currentState,
  transaction
);

// State is immutable - always returns new state
console.log('New state:', newState);
console.log('Old state unchanged:', currentState);
```

---

### Querying State

#### Get Contract State

```typescript
const contractState = ledgerState.contracts.get(contractAddress);

if (contractState) {
  console.log('Contract data:', contractState.data);
  console.log('Available operations:', contractState.operations.keys());
}
```

#### Get Zswap State

```typescript
const zswapState = ledgerState.zswapChainState;

console.log('Total commitments:', zswapState.commitments.size);
console.log('Total nullifiers:', zswapState.nullifiers.size);
```

---

## Best Practices

### 1. Always Set Network ID First

```typescript
// ✅ GOOD - Set network before any operations
setNetworkId(NetworkId.TestNet);
const tx = createTransaction(/* ... */);

// ❌ BAD - Creating transaction without setting network
const tx = createTransaction(/* ... */);  // May use wrong network!
```

### 2. Use Appropriate Proof Stages

```typescript
// ✅ Production - Use proven transactions
const provenTx = await proveTransaction(unprovenTx);
await submitTransaction(provenTx);

// ✅ Testing - Use proof-erased transactions
const testTx = eraseProof(unprovenTx);
await testTransactionLocally(testTx);
```

### 3. Handle State Immutability

```typescript
// ✅ GOOD - Use returned new state
let state = initialState;
state = applyTransaction(state, tx1);
state = applyTransaction(state, tx2);

// ❌ BAD - Trying to mutate state
applyTransaction(state, tx1);  // State not updated!
applyTransaction(state, tx2);  // Still using old state!
```

### 4. Validate Coin Information

```typescript
// ✅ GOOD - Validate before creating coins
if (coinValue > 0n && coinValue <= MAX_COIN_VALUE) {
  const coin = createCoinInfo(tokenType, coinValue, nonce);
}

// ❌ BAD - Creating invalid coins
const coin = createCoinInfo(tokenType, -100n, nonce);  // Invalid!
```

---

## Complete Examples

### Example 1: Simple Token Transfer

```typescript
import { 
  setNetworkId, 
  NetworkId,
  createInput,
  createOutput,
  UnprovenTransaction
} from '@midnight-ntwrk/ledger';

async function transferTokens(
  fromCoin: QualifiedCoinInfo,
  toAddress: string,
  amount: bigint,
  zswapState: ZswapLocalState
) {
  // Set network
  setNetworkId(NetworkId.TestNet);
  
  // Create input (spend existing coin)
  const input = createInput(fromCoin, zswapState);
  
  // Create output (new coin for recipient)
  const output = createOutput(
    { type: fromCoin.type, value: amount, nonce: generateNonce() },
    toAddress,
    recipientEncryptionKey
  );
  
  // Create change output if needed
  const change = fromCoin.value - amount;
  const changeOutput = change > 0n
    ? createOutput(
        { type: fromCoin.type, value: change, nonce: generateNonce() },
        senderPublicKey,
        senderEncryptionKey
      )
    : null;
  
  // Assemble transaction
  const unprovenTx = new UnprovenTransaction({
    guaranteedOffer: {
      inputs: [input],
      outputs: changeOutput ? [output, changeOutput] : [output],
      transients: [],
      balances: new Map()
    }
  });
  
  // Prove and submit
  const provenTx = await proveTransaction(unprovenTx);
  return await submitTransaction(provenTx);
}
```

---

### Example 2: Contract Call with Token Transfer

```typescript
async function callContractWithTokens(
  contractAddress: ContractAddress,
  entryPoint: string,
  payment: QualifiedCoinInfo,
  zswapState: ZswapLocalState
) {
  setNetworkId(NetworkId.TestNet);
  
  // Create payment input
  const paymentInput = createInput(payment, zswapState);
  
  // Create contract call prototype
  const callPrototype: ContractCallPrototype = {
    contractAddress,
    entryPoint,
    contractOperation: /* from contract */,
    guaranteedTranscript: /* from generated code */,
    fallibleTranscript: /* from generated code */,
    privateOracleOutputs: /* from witness */,
    inputs: /* encoded inputs */,
    outputs: /* encoded outputs */,
    communicationCommitmentRandomness: generateRandomness(),
    zkCircuitId: 'my-contract-circuit'
  };
  
  // Assemble calls
  const calls = new ContractCalls();
  calls.add(callPrototype);
  
  // Create transaction
  const unprovenTx = new UnprovenTransaction({
    guaranteedOffer: {
      inputs: [paymentInput],
      outputs: [],
      transients: [],
      balances: new Map()
    },
    calls
  });
  
  const provenTx = await proveTransaction(unprovenTx);
  return await submitTransaction(provenTx);
}
```

---

### Example 3: Contract Deployment

```typescript
async function deployContract(
  initialState: ContractState,
  deploymentFee: QualifiedCoinInfo,
  zswapState: ZswapLocalState
) {
  setNetworkId(NetworkId.TestNet);
  
  // Create fee input
  const feeInput = createInput(deploymentFee, zswapState);
  
  // Create deployment
  const deployment = createContractDeploy(
    initialState,
    generateNonce()
  );
  
  // Assemble transaction
  const calls = new ContractCalls();
  calls.add(deployment);
  
  const unprovenTx = new UnprovenTransaction({
    guaranteedOffer: {
      inputs: [feeInput],
      outputs: [],
      transients: [],
      balances: new Map()
    },
    calls
  });
  
  const provenTx = await proveTransaction(unprovenTx);
  return await submitTransaction(provenTx);
}
```

---

## Common Patterns

### Pattern 1: Atomic Swap

```typescript
// Two parties exchange tokens atomically
const swap = new UnprovenTransaction({
  guaranteedOffer: {
    inputs: [
      createInput(aliceCoin, aliceState),  // Alice provides TokenA
      createInput(bobCoin, bobState)        // Bob provides TokenB
    ],
    outputs: [
      createOutput(newCoin1, bobAddress, bobKey),      // Bob receives TokenA
      createOutput(newCoin2, aliceAddress, aliceKey)   // Alice receives TokenB
    ],
    transients: [],
    balances: new Map()
  }
});
```

### Pattern 2: Multi-Contract Call

```typescript
const calls = new ContractCalls();
calls.add(contractCall1);  // Call first contract
calls.add(contractCall2);  // Call second contract
calls.add(contractCall3);  // Call third contract

const tx = new UnprovenTransaction({
  guaranteedOffer,
  fallibleOffer,
  calls  // All calls execute in order
});
```

### Pattern 3: Fallible Operations

```typescript
const tx = new UnprovenTransaction({
  guaranteedOffer: {
    // Fee payment - always executes
    inputs: [feeInput],
    outputs: [],
    transients: [],
    balances: new Map()
  },
  fallibleOffer: {
    // Business logic - may fail without losing fee
    inputs: [businessInput],
    outputs: [businessOutput],
    transients: [],
    balances: new Map()
  },
  calls
});
```

---

## Error Handling

### Common Errors

**1. Network Not Set**
```typescript
try {
  const tx = createTransaction(/* ... */);
} catch (error) {
  if (error.message.includes('network')) {
    console.error('Must call setNetworkId first');
    setNetworkId(NetworkId.TestNet);
  }
}
```

**2. Invalid Coin Values**
```typescript
try {
  const coin = createCoinInfo(tokenType, -100n, nonce);
} catch (error) {
  console.error('Coin value must be non-negative');
}
```

**3. Insufficient Balance**
```typescript
try {
  const input = createInput(qualifiedCoin, zswapState);
} catch (error) {
  console.error('Insufficient balance for input');
}
```

---

## Related Documentation

- **[i_am_Midnight_LLM_ref.md](i_am_Midnight_LLM_ref.md)** - Compact runtime API
- **[DAPP_CONNECTOR_API_REFERENCE.md](DAPP_CONNECTOR_API_REFERENCE.md)** - Wallet integration
- **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction details
- **[ZSWAP_SHIELDED_TOKENS.md](ZSWAP_SHIELDED_TOKENS.md)** - Zswap mechanism

---

## Version Information

- **Package**: @midnight-ntwrk/ledger
- **Version**: 3.0.2
- **Last Updated**: October 28, 2025
- **Compatibility**: Minokawa 0.18.0 / Compact Compiler 0.26.0

---

**Status**: ✅ Complete Ledger API Reference  
**Purpose**: Transaction assembly and ledger state management  
**Last Updated**: October 28, 2025
