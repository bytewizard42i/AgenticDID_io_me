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

### ContractOperationVersionedVerifierKey

A versioned verifier key to be associated with a ContractOperation.

```typescript
class ContractOperationVersionedVerifierKey {
  constructor(
    version: "v1",
    rawVk: Uint8Array
  );
  
  readonly version: "v1";         // Version identifier
  readonly rawVk: Uint8Array;     // Raw verifier key bytes
  
  toString(compact?: boolean): string;
}
```

---

### ContractState

The state of a contract, consisting primarily of the data accessible directly to the contract, and the map of ContractOperations that can be called on it.

```typescript
class ContractState {
  constructor();  // Creates a blank contract state
  
  data: StateValue;                                    // Contract's primary state
  maintenanceAuthority: ContractMaintenanceAuthority;  // Maintenance authority
  
  // Query operations
  operation(operation: string | Uint8Array): undefined | ContractOperation;
  operations(): (string | Uint8Array)[];
  query(query: Op<null>[], cost_model: CostModel): GatherResult[];
  
  // Modify operations
  setOperation(operation: string | Uint8Array, value: ContractOperation): void;
  
  // Serialization
  serialize(networkid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, networkid: NetworkId): ContractState;
}
```

**Properties**:
- `data`: The current value of the primary state of the contract
- `maintenanceAuthority`: The maintenance authority associated with this contract

**Methods**:
- `operation()`: Get the operation at a specific entry point name
- `operations()`: Return a list of the entry points currently registered on this contract
- `query()`: Runs a series of operations against the current state, and returns the results
- `setOperation()`: Set a specific entry point name to contain a given operation
- `serialize()`: Serialize state for network transmission
- `toString()`: Human-readable string representation
- `deserialize()`: Deserialize from bytes

---

### CostModel

A cost model for calculating transaction fees.

```typescript
class CostModel {
  private constructor();
  
  toString(compact?: boolean): string;
  
  static dummyCostModel(): CostModel;  // For non-critical/testing contexts
}
```

**Static Methods**:
- `dummyCostModel()`: A cost model for use in non-critical contexts (testing)

---

### EncryptionSecretKey

Holds the encryption secret key of a user, which may be used to determine if a given offer contains outputs addressed to this user.

```typescript
class EncryptionSecretKey {
  private constructor();
  
  test(offer: Offer): boolean;  // Check if offer contains outputs for this user
  
  yesIKnowTheSecurityImplicationsOfThis_serialize(netid: NetworkId): Uint8Array;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): EncryptionSecretKey;
}
```

**Methods**:
- `test()`: Check if an offer contains outputs addressed to this user
- `yesIKnowTheSecurityImplicationsOfThis_serialize()`: Serialize secret key (⚠️ Security-sensitive!)
- `deserialize()`: Deserialize from bytes

⚠️ **Security Warning**: The serialization method has a deliberately long name to emphasize the security implications of serializing a secret key.

---

### Input

A shielded transaction input (burns an existing coin).

```typescript
class Input {
  private constructor();
  
  readonly nullifier: string;                      // Nullifier of the input
  readonly contractAddress: undefined | string;    // Contract address (if sender is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Input;
}
```

**Properties**:
- `nullifier`: The nullifier of the input (prevents double-spending)
- `contractAddress`: The contract address receiving the input, if the sender is a contract (undefined for user inputs)

**Methods**:
- `serialize()`: Serialize for network transmission
- `toString()`: Human-readable string representation
- `deserialize()`: Deserialize from bytes

---

### LedgerParameters

Parameters used by the Midnight ledger, including transaction fees and bounds.

```typescript
class LedgerParameters {
  private constructor();
  
  readonly transactionCostModel: TransactionCostModel;  // Cost model for transaction fees
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): LedgerParameters;
  static dummyParameters(): LedgerParameters;  // For testing
}
```

**Properties**:
- `transactionCostModel`: The cost model used for transaction fees contained in these parameters

**Methods**:
- `serialize()`: Serialize parameters for network transmission
- `toString()`: Human-readable string representation
- `deserialize()`: Deserialize from bytes
- `dummyParameters()`: A dummy set of testing parameters

**Usage**:
```typescript
// For testing
const testParams = LedgerParameters.dummyParameters();

// In production, deserialize from network
const params = LedgerParameters.deserialize(rawBytes, NetworkId.TestNet);
const costModel = params.transactionCostModel;
```

---

### LedgerState

The state of the Midnight ledger.

```typescript
class LedgerState {
  constructor(zswap: ZswapChainState);  // Initialize from Zswap state with empty contracts
  
  readonly zswap: ZswapChainState;                  // Zswap part of ledger state
  readonly unmintedNativeTokenSupply: bigint;       // Remaining unminted native tokens
  
  // Transaction application
  apply(transaction: ProofErasedTransaction, context: TransactionContext): 
    [LedgerState, TransactionResult];
  applySystemTx(transaction: SystemTransaction): LedgerState;
  
  // Contract state management
  index(address: string): undefined | ContractState;
  updateIndex(address: string, context: QueryContext): LedgerState;
  
  // Treasury and minting
  treasuryBalance(token_type: string): bigint;
  unclaimedMints(recipient: string, token_type: string): bigint;
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static blank(): LedgerState;  // Fully blank state
  static deserialize(raw: Uint8Array, netid: NetworkId): LedgerState;
}
```

**Constructor**:
- Initializes from a Zswap state, with an empty contract set

**Properties**:
- `zswap`: The Zswap part of the ledger state
- `unmintedNativeTokenSupply`: The remaining unminted supply of native tokens

**Methods**:
- `apply()`: Applies a ProofErasedTransaction, returns new state and result
- `applySystemTx()`: Applies a system transaction to this ledger state
- `index()`: Indexes into the contract state map with a given contract address
- `updateIndex()`: Sets the state of a given contract address from a QueryContext
- `treasuryBalance()`: Retrieves the balance of the treasury for a specific token type
- `unclaimedMints()`: How much in minting rewards a recipient is owed and can claim
- `serialize()`: Serialize state for network transmission
- `toString()`: Human-readable string representation
- `blank()`: Static method to create a fully blank state
- `deserialize()`: Deserialize from bytes

---

### MaintenanceUpdate

A contract maintenance update, updating associated operations or changing the maintenance authority.

```typescript
class MaintenanceUpdate {
  constructor(
    address: string,
    updates: SingleUpdate[],
    counter: bigint
  );
  
  readonly address: string;                   // Address this update targets
  readonly updates: SingleUpdate[];           // Updates to carry out
  readonly counter: bigint;                   // Counter this update is valid against
  readonly dataToSign: Uint8Array;           // Raw data for signature approval
  readonly signatures: [bigint, string][];    // Signatures on this update
  
  addSignature(idx: bigint, signature: string): MaintenanceUpdate;
  toString(compact?: boolean): string;
}
```

**Properties**:
- `address`: The address this deployment will attempt to create
- `updates`: The updates to carry out
- `counter`: The counter this update is valid against
- `dataToSign`: The raw data any valid signature must be over to approve this update
- `signatures`: The signatures on this update

**Methods**:
- `addSignature()`: Adds a new signature to this update

---

### MerkleTreeCollapsedUpdate

A compact delta on the coin commitments Merkle tree, used to keep local spending trees in sync with the global state without requiring receiving all transactions.

```typescript
class MerkleTreeCollapsedUpdate {
  constructor(
    state: ZswapChainState,
    start: bigint,     // Inclusive start index
    end: bigint        // Inclusive end index
  );
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): MerkleTreeCollapsedUpdate;
}
```

**Description**:
Creates a new compact update from a non-compact state, and inclusive start and end indices.

**Throws**: If the indices are out-of-bounds for the state, or end < start.

**Usage**: Enables efficient synchronization of local Merkle trees without downloading all transactions.

---

### Offer

A full Zswap offer; the zswap part of a transaction.

```typescript
class Offer {
  private constructor();
  
  readonly inputs: Input[];                    // Inputs this offer is composed of
  readonly outputs: Output[];                  // Outputs this offer is composed of
  readonly transient: Transient[];            // Transients this offer is composed of
  readonly deltas: Map<string, bigint>;       // Value for each token type
  
  merge(other: Offer): Offer;  // Combine with another offer
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Offer;
}
```

**Description**:
Consists of sets of Inputs, Outputs, and Transients, as well as a deltas vector of the transaction value.

**Properties**:
- `inputs`: The inputs this offer is composed of
- `outputs`: The outputs this offer is composed of
- `transient`: The transients this offer is composed of
- `deltas`: The value of this offer for each token type (may be negative). This is input coin values - output coin values

**Methods**:
- `merge()`: Combine this offer with another (for atomic operations)

---

### Output

A shielded transaction output (creates a new coin).

```typescript
class Output {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the output
  readonly contractAddress: undefined | string;     // Contract address (if recipient is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Output;
}
```

**Properties**:
- `commitment`: The commitment of the output
- `contractAddress`: The contract address receiving the output, if the recipient is a contract (undefined for user outputs)

---

### PreTranscript

A transcript prior to partitioning, consisting of the context to run it in, the program, and optionally a communication commitment.

```typescript
class PreTranscript {
  constructor(
    context: QueryContext,
    program: Op<AlignedValue>[],
    comm_comm?: string           // Optional communication commitment
  );
  
  toString(compact?: boolean): string;
}
```

**Description**:
Used to bind calls together with communication commitment when constructing contract calls.

---

### ProofErasedAuthorizedMint

A request to mint a coin, authorized by the mint's recipient, with the authorizing proof having been erased.

```typescript
class ProofErasedAuthorizedMint {
  private constructor();
  
  readonly coin: CoinInfo;          // The coin to be minted
  readonly recipient: string;        // The recipient of this mint
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedAuthorizedMint;
}
```

**Usage**: Primarily for use in testing, or handling data known to be correct from external information.

---

### ProofErasedInput

An Input with all proof information erased.

```typescript
class ProofErasedInput {
  private constructor();
  
  readonly nullifier: string;                      // Nullifier of the input
  readonly contractAddress: undefined | string;    // Contract address (if sender is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedInput;
}
```

**Usage**: Primarily for use in testing, or handling data known to be correct from external information.

---

### ProofErasedOffer

An Offer with all proof information erased.

```typescript
class ProofErasedOffer {
  private constructor();
  
  readonly inputs: ProofErasedInput[];         // Inputs this offer is composed of
  readonly outputs: ProofErasedOutput[];       // Outputs this offer is composed of
  readonly transient: ProofErasedTransient[];  // Transients this offer is composed of
  readonly deltas: Map<string, bigint>;        // Value for each token type
  
  merge(other: ProofErasedOffer): ProofErasedOffer;
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedOffer;
}
```

**Description**:
Same structure as Offer, but with all proof information erased for testing purposes.

**Usage**: Primarily for use in testing, or handling data known to be correct from external information.

---

### ProofErasedOutput

An Output with all proof information erased.

```typescript
class ProofErasedOutput {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the output
  readonly contractAddress: undefined | string;     // Contract address (if recipient is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedOutput;
}
```

**Usage**: Primarily for use in testing, or handling data known to be correct from external information.

---

### ProofErasedTransaction

Transaction with all proof information erased.

```typescript
class ProofErasedTransaction {
  private constructor();
  
  readonly guaranteedCoins: undefined | ProofErasedOffer;     // Guaranteed Zswap offer
  readonly fallibleCoins: undefined | ProofErasedOffer;       // Fallible Zswap offer
  readonly contractCalls: ContractAction[];                   // Contract interactions
  readonly mint: undefined | ProofErasedAuthorizedMint;       // Mint (if applicable)
  
  // Transaction analysis
  fees(params: LedgerParameters): bigint;
  identifiers(): string[];
  imbalances(guaranteed: boolean, fees?: bigint): Map<string, bigint>;
  wellFormed(ref_state: LedgerState, strictness: WellFormedStrictness): void;
  
  // Transaction operations
  merge(other: ProofErasedTransaction): ProofErasedTransaction;
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedTransaction;
}
```

**Description**:
Primarily for use in testing, or handling data known to be correct from external information.

**Properties**:
- `guaranteedCoins`: The guaranteed Zswap offer
- `fallibleCoins`: The fallible Zswap offer
- `contractCalls`: The contract interactions contained in this transaction
- `mint`: The mint this transaction represents, if applicable

**Methods**:
- `fees()`: The cost of this transaction, in the atomic unit of the base token
- `identifiers()`: Returns the set of identifiers. Any may be used to watch for this transaction
- `imbalances()`: For given fees and section (guaranteed/fallible), the surplus or deficit in any token type
- `wellFormed()`: Tests well-formedness criteria, optionally including transaction balancing (doesn't check proofs). Throws if not well-formed
- `merge()`: Merges this transaction with another. Throws if both have contract interactions or spend same coins

---

### ProofErasedTransient

A Transient with all proof information erased.

```typescript
class ProofErasedTransient {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the transient
  readonly nullifier: string;                       // Nullifier of the transient
  readonly contractAddress: undefined | string;     // Contract address (if applicable)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ProofErasedTransient;
}
```

**Properties**:
- `commitment`: The commitment of the transient
- `nullifier`: The nullifier of the transient
- `contractAddress`: The contract address creating the transient, if applicable

**Usage**: Primarily for use in testing, or handling data known to be correct from external information.

---

### QueryContext

Provides the information needed to fully process a transaction, including information about the rest of the transaction and the state of the chain at the time of execution.

```typescript
class QueryContext {
  constructor(state: StateValue, address: string);  // Basic context from state and address
  
  readonly address: string;                         // Contract address
  block: BlockContext;                              // Block-level information
  readonly state: StateValue;                       // Current contract state
  readonly comIndicies: Map<string, bigint>;        // Commitment indices map
  effects: Effects;                                 // Effects during execution
  
  // Commitment management
  insertCommitment(comm: string, index: bigint): QueryContext;
  qualify(coin: Value): undefined | Value;  // Internal
  
  // Transaction operations
  query(ops: Op<null>[], cost_model: CostModel, gas_limit?: bigint): QueryResults;
  runTranscript(transcript: Transcript<AlignedValue>, cost_model: CostModel): QueryContext;
  
  /** @deprecated Use ledger's partitionTranscripts instead */
  intoTranscript(program: Op<AlignedValue>[], cost_model: CostModel): 
    [undefined | Transcript<AlignedValue>, undefined | Transcript<AlignedValue>];
  
  toString(compact?: boolean): string;
}
```

**Properties**:
- `address`: The address of the contract
- `block`: The block-level information accessible to the contract
- `state`: The current contract state retained in the context
- `comIndicies`: The commitment indices map accessible to the contract, primarily via qualify
- `effects`: The effects that occurred during execution, should match those declared in a Transcript

**Methods**:
- `insertCommitment()`: Register a coin commitment at a specific index, for receiving coins in-contract
- `qualify()`: Internal - upgrades CoinInfo to QualifiedCoinInfo using inserted commitments
- `query()`: Runs operations in gather mode, returns results
- `runTranscript()`: Runs transcript in verifying mode, outputs new context with updated state and effects
- `intoTranscript()`: ⚠️ Deprecated - use ledger's partitionTranscripts instead

---

### QueryResults

The results of making a query against a specific state or context.

```typescript
class QueryResults {
  private constructor();
  
  readonly context: QueryContext;        // Context state after query
  readonly events: GatherResult[];       // Events/results during query
  readonly gasCost: bigint;              // Measured cost of query
  
  toString(compact?: boolean): string;
}
```

**Properties**:
- `context`: The context state after executing the query (can be used to execute further queries)
- `events`: Any events/results that occurred during or from the query
- `gasCost`: The measured cost of executing the query

---

### ReplaceAuthority

An update instruction to replace the current contract maintenance authority with a new one.

```typescript
class ReplaceAuthority {
  constructor(authority: ContractMaintenanceAuthority);
  
  readonly authority: ContractMaintenanceAuthority;
  
  toString(compact?: boolean): string;
}
```

**Description**:
Used in conjunction with MaintenanceUpdate to change the governance structure of a contract.

---

### StateBoundedMerkleTree

Represents a fixed-depth Merkle tree storing hashed data, whose preimages are unknown.

```typescript
class StateBoundedMerkleTree {
  constructor(height: number);  // Create blank tree with given height
  
  readonly height: number;
  
  // Tree operations
  update(index: bigint, leaf: AlignedValue): StateBoundedMerkleTree;
  collapse(start: bigint, end: bigint): StateBoundedMerkleTree;  // Internal
  
  // Path operations
  root(): Value;  // Internal
  pathForLeaf(index: bigint, leaf: AlignedValue): AlignedValue;  // Internal
  findPathForLeaf(leaf: AlignedValue): AlignedValue;  // Internal
  
  toString(compact?: boolean): string;
}
```

**Methods**:
- `update()`: Inserts a value into the Merkle tree, returning updated tree. Throws if index out-of-bounds
- `collapse()`: Internal - Erases all but necessary hashes between indices (inclusive). Throws if out-of-bounds or end < start
- `root()`: Internal - Merkle tree root primitive
- `pathForLeaf()`: Internal - Path construction primitive. Throws if index out-of-bounds
- `findPathForLeaf()`: Internal - Finding path primitive. Throws if leaf not in tree

---

### StateMap

Represents a key-value map, where keys are AlignedValues and values are StateValues.

```typescript
class StateMap {
  constructor();
  
  get(key: AlignedValue): undefined | StateValue;
  insert(key: AlignedValue, value: StateValue): StateMap;
  remove(key: AlignedValue): StateMap;
  keys(): AlignedValue[];
  toString(compact?: boolean): string;
}
```

---

### StateValue

Represents the core of a contract's state, and recursively represents each of its components.

```typescript
class StateValue {
  private constructor();
  
  // Type checking
  type(): "map" | "null" | "cell" | "array" | "boundedMerkleTree";
  
  // Type conversion
  asCell(): AlignedValue;
  asMap(): undefined | StateMap;
  asArray(): undefined | StateValue[];
  asBoundedMerkleTree(): undefined | StateBoundedMerkleTree;
  
  // Array operations
  arrayPush(value: StateValue): StateValue;
  
  // Utility
  logSize(): number;
  encode(): EncodedStateValue;  // Internal
  toString(compact?: boolean): string;
  
  // Static constructors
  static newNull(): StateValue;
  static newCell(value: AlignedValue): StateValue;
  static newMap(map: StateMap): StateValue;
  static newArray(): StateValue;
  static newBoundedMerkleTree(tree: StateBoundedMerkleTree): StateValue;
  static decode(value: EncodedStateValue): StateValue;  // Internal
}
```

**Description**:
Different classes of state values:
- `null`
- Cells of AlignedValues
- Maps from AlignedValues to state values
- Bounded Merkle trees containing AlignedValue leaves
- Short (<= 15 element) arrays of state values

**Immutability**: State values are immutable; any operations that mutate states will return a new state instead.

---

### SystemTransaction

A privileged transaction issued by the system.

```typescript
class SystemTransaction {
  private constructor();
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Transaction;
}
```

---

### Transaction

A Midnight transaction, consisting of a section of ContractActions, and a guaranteed and fallible Offer.

```typescript
class Transaction {
  private constructor();
  
  readonly guaranteedCoins: undefined | Offer;          // Guaranteed Zswap offer
  readonly fallibleCoins: undefined | Offer;            // Fallible Zswap offer
  readonly contractCalls: ContractAction[];             // Contract interactions
  readonly mint: undefined | AuthorizedMint;            // Mint (if applicable)
  
  // Transaction analysis
  fees(params: LedgerParameters): bigint;
  identifiers(): string[];
  transactionHash(): string;
  imbalances(guaranteed: boolean, fees?: bigint): Map<string, bigint>;
  wellFormed(ref_state: LedgerState, strictness: WellFormedStrictness): void;
  
  // Transaction operations
  merge(other: Transaction): Transaction;
  eraseProofs(): ProofErasedTransaction;
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Transaction;
  static fromUnproven(prove: any, unproven: UnprovenTransaction): Promise<Transaction>;
}
```

**Description**:
The guaranteed section runs first, and fee payment is taken during this part. If it succeeds, the fallible section is also run, and atomically rolled back if it fails.

**Properties**:
- `guaranteedCoins`: The guaranteed Zswap offer
- `fallibleCoins`: The fallible Zswap offer
- `contractCalls`: The contract interactions contained in this transaction
- `mint`: The mint this transaction represents, if applicable

**Methods**:
- `fees()`: The cost of this transaction in atomic units of the base token
- `identifiers()`: Returns set of identifiers. Any may be used to watch for this transaction
- `transactionHash()`: Returns the hash. Due to merge ability, shouldn't be used to watch for specific transaction
- `imbalances()`: For given fees and section, the surplus or deficit in any token type
- `wellFormed()`: Tests well-formedness criteria, optionally including balancing. Throws if not well-formed
- `merge()`: Merges with another transaction. Throws if both have contract interactions or spend same coins
- `eraseProofs()`: Erases proofs for testing
- `fromUnproven()`: Type hint to use external proving function (e.g., proof server)

---

### TransactionContext

The context against which a transaction is run.

```typescript
class TransactionContext {
  constructor(
    ref_state: LedgerState,        // Past ledger state as reference
    block_context: BlockContext,   // Block information
    whitelist?: Set<string>        // Tracked contracts (undefined = all)
  );
  
  toString(compact?: boolean): string;
}
```

**Parameters**:
- `ref_state`: A past ledger state used as reference point for 'static' data
- `block_context`: Information about the block this transaction is or will be contained in
- `whitelist`: A list of contracts being tracked, or undefined to track all contracts

---

### TransactionCostModel

Cost model for calculating transaction fees.

```typescript
class TransactionCostModel {
  private constructor();
  
  readonly inputFeeOverhead: bigint;     // Fee increase for adding input
  readonly outputFeeOverhead: bigint;    // Fee increase for adding output
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): TransactionCostModel;
  static dummyTransactionCostModel(): TransactionCostModel;  // For testing
}
```

**Properties**:
- `inputFeeOverhead`: The increase in fees to expect from adding a new input to a transaction
- `outputFeeOverhead`: The increase in fees to expect from adding a new output to a transaction

---

### TransactionResult

The result status of applying a transaction.

```typescript
class TransactionResult {
  private constructor();
  
  readonly type: "success" | "partialSuccess" | "failure";
  readonly error?: string;  // Error message if failed or partially failed
  
  toString(compact?: boolean): string;
}
```

**Properties**:
- `type`: The result status
- `error`: Error message if the transaction failed or partially failed

---

### Transient

A shielded "transient"; an output that is immediately spent within the same transaction.

```typescript
class Transient {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the transient
  readonly nullifier: string;                       // Nullifier of the transient
  readonly contractAddress: undefined | string;     // Contract address (if applicable)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): Transient;
}
```

**Properties**:
- `commitment`: The commitment of the transient
- `nullifier`: The nullifier of the transient
- `contractAddress`: The contract address creating the transient, if applicable

---

### UnprovenAuthorizedMint

A request to mint a coin, authorized by the mint's recipient, without the proof for the authorization being generated.

```typescript
class UnprovenAuthorizedMint {
  private constructor();
  
  readonly coin: CoinInfo;          // The coin to be minted
  readonly recipient: string;        // The recipient of this mint
  
  erase_proof(): ProofErasedAuthorizedMint;
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenAuthorizedMint;
}
```

---

### UnprovenInput

An Input before being proven.

```typescript
class UnprovenInput {
  private constructor();
  
  readonly nullifier: string;                      // Nullifier of the input
  readonly contractAddress: undefined | string;    // Contract address (if sender is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenInput;
  static newContractOwned(
    coin: QualifiedCoinInfo,
    contract: string,
    state: ZswapChainState
  ): UnprovenInput;
}
```

**Warning**: All "shielded" information in the input can still be extracted at this stage!

**Methods**:
- `newContractOwned()`: Creates a new input spending a coin from a smart contract. Note: inputs created this way also need contract authorization.

---

### UnprovenOffer

An Offer prior to being proven.

```typescript
class UnprovenOffer {
  constructor();
  
  readonly inputs: UnprovenInput[];         // Inputs this offer is composed of
  readonly outputs: UnprovenOutput[];       // Outputs this offer is composed of
  readonly transient: UnprovenTransient[];  // Transients this offer is composed of
  readonly deltas: Map<string, bigint>;     // Value for each token type
  
  merge(other: UnprovenOffer): UnprovenOffer;
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenOffer;
  static fromInput(input: UnprovenInput, type_: string, value: bigint): UnprovenOffer;
  static fromOutput(output: UnprovenOutput, type_: string, value: bigint): UnprovenOffer;
  static fromTransient(transient: UnprovenTransient): UnprovenOffer;
}
```

**Warning**: All "shielded" information in the offer can still be extracted at this stage!

**Static Constructors**:
- `fromInput()`: Creates singleton offer from an UnprovenInput and its value vector
- `fromOutput()`: Creates singleton offer from an UnprovenOutput and its value vector
- `fromTransient()`: Creates singleton offer from an UnprovenTransient

---

### UnprovenOutput

An Output before being proven.

```typescript
class UnprovenOutput {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the output
  readonly contractAddress: undefined | string;     // Contract address (if recipient is contract)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenOutput;
  static new(
    coin: CoinInfo,
    target_cpk: string,
    target_epk?: string
  ): UnprovenOutput;
  static newContractOwned(coin: CoinInfo, contract: string): UnprovenOutput;
}
```

**Warning**: All "shielded" information in the output can still be extracted at this stage!

**Static Constructors**:
- `new()`: Creates new output targeted to user's coin public key. Optionally includes ciphertext encrypted to user's encryption public key
- `newContractOwned()`: Creates new output targeted to smart contract. Contract must explicitly receive the coin.

---

### UnprovenTransaction

Transaction prior to being proven.

```typescript
class UnprovenTransaction {
  constructor(
    guaranteed: UnprovenOffer,
    fallible?: UnprovenOffer,
    calls?: ContractCallsPrototype
  );
  
  readonly guaranteedCoins: undefined | UnprovenOffer;      // Guaranteed offer
  readonly fallibleCoins: undefined | UnprovenOffer;        // Fallible offer
  readonly contractCalls: ContractAction[];                 // Contract interactions
  readonly mint: undefined | UnprovenAuthorizedMint;        // Mint (if applicable)
  
  // Transaction analysis
  identifiers(): string[];
  imbalances(guaranteed: boolean, fees?: bigint): Map<string, bigint>;
  
  // Transaction operations
  merge(other: UnprovenTransaction): UnprovenTransaction;
  eraseProofs(): ProofErasedTransaction;
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenTransaction;
  static fromMint(mint: UnprovenAuthorizedMint): UnprovenTransaction;
}
```

**Warning**: All "shielded" information in the transaction can still be extracted at this stage!

**Constructor**: Creates transaction from guaranteed/fallible UnprovenOffers and ContractCallsPrototype.

**Methods**:
- `identifiers()`: Returns set of identifiers for watching this transaction
- `imbalances()`: Returns surplus/deficit for given section and fees
- `merge()`: Merges with another transaction. Throws if both have contract interactions or spend same coins
- `eraseProofs()`: Converts to ProofErasedTransaction
- `fromMint()`: Creates minting claim transaction (funds must have been legitimately minted previously)

---

### UnprovenTransient

A Transient before being proven.

```typescript
class UnprovenTransient {
  private constructor();
  
  readonly commitment: string;                      // Commitment of the transient
  readonly nullifier: string;                       // Nullifier of the transient
  readonly contractAddress: undefined | string;     // Contract address (if applicable)
  
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): UnprovenTransient;
  static newFromContractOwnedOutput(
    coin: QualifiedCoinInfo,
    output: UnprovenOutput
  ): UnprovenTransient;
}
```

**Warning**: All "shielded" information in the transient can still be extracted at this stage!

**Static Constructor**:
- `newFromContractOwnedOutput()`: Creates new contract-owned transient from output and coin. QualifiedCoinInfo should have mt_index of 0.

---

### VerifierKeyInsert

An update instruction to insert a verifier key at a specific operation and version.

```typescript
class VerifierKeyInsert {
  constructor(
    operation: string | Uint8Array,
    vk: ContractOperationVersionedVerifierKey
  );
  
  readonly operation: string | Uint8Array;
  readonly vk: ContractOperationVersionedVerifierKey;
  
  toString(compact?: boolean): string;
}
```

**Usage**: Part of contract maintenance updates to add new verifier keys.

---

### VerifierKeyRemove

An update instruction to remove a verifier key of a specific operation and version.

```typescript
class VerifierKeyRemove {
  constructor(
    operation: string | Uint8Array,
    version: ContractOperationVersion
  );
  
  readonly operation: string | Uint8Array;
  readonly version: ContractOperationVersion;
  
  toString(compact?: boolean): string;
}
```

**Usage**: Part of contract maintenance updates to remove old verifier keys.

---

### VmResults

Represents the results of a VM call.

```typescript
class VmResults {
  private constructor();
  
  readonly stack: VmStack;               // VM stack at end of invocation
  readonly events: GatherResult[];       // Events emitted by VM invocation
  readonly gasCost: bigint;              // Computed gas cost
  
  toString(compact?: boolean): string;
}
```

**Properties**:
- `stack`: The VM stack state at the end of the invocation
- `events`: Events that were emitted during execution
- `gasCost`: The computed gas cost of running the invocation

---

### VmStack

Represents the state of the VM's stack at a specific point.

```typescript
class VmStack {
  constructor();
  
  get(idx: number): undefined | StateValue;
  isStrong(idx: number): undefined | boolean;
  length(): number;
  push(value: StateValue, is_strong: boolean): void;
  removeLast(): void;
  toString(compact?: boolean): string;
}
```

**Description**:
The stack is an array of StateValues, each annotated with whether it is "strong" or "weak":
- **Strong**: Permitted to be stored on-chain
- **Weak**: Not permitted to be stored on-chain

**Methods**:
- `get()`: Retrieve StateValue at index
- `isStrong()`: Check if value at index is strong (on-chain eligible)
- `length()`: Get stack size
- `push()`: Push value with strength annotation
- `removeLast()`: Remove top value from stack

---

### WellFormedStrictness

Strictness criteria for evaluating transaction well-formedness.

```typescript
class WellFormedStrictness {
  constructor();
  
  verifyNativeProofs: boolean;       // Validate Midnight-native proofs
  verifyContractProofs: boolean;     // Validate contract proofs
  enforceBalancing: boolean;         // Require non-negative balance
}
```

**Usage**: Used for disabling parts of transaction validation for testing.

**Properties**:
- `verifyNativeProofs`: Whether to validate Midnight-native (non-contract) proofs in the transaction
- `verifyContractProofs`: Whether to validate contract proofs in the transaction
- `enforceBalancing`: Whether to require the transaction to have a non-negative balance

---

### ZswapChainState

The on-chain state of Zswap.

```typescript
class ZswapChainState {
  constructor();
  
  readonly firstFree: bigint;  // First free index in coin commitment tree
  
  // State updates
  tryApply(offer: Offer, whitelist?: Set<string>): [ZswapChainState, Map<string, bigint>];
  tryApplyProofErased(offer: ProofErasedOffer, whitelist?: Set<string>): [ZswapChainState, Map<string, bigint>];
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static deserialize(raw: Uint8Array, netid: NetworkId): ZswapChainState;
  static deserializeFromLedgerState(raw: Uint8Array, netid: NetworkId): ZswapChainState;
}
```

**Description**:
Consists of:
- Merkle tree of coin commitments
- Set of nullifiers
- Index into the Merkle tree
- Set of valid past Merkle tree roots

**Methods**:
- `tryApply()`: Apply an Offer to the state, returning updated state and map of newly inserted coin commitments to their indices
- `tryApplyProofErased()`: Same as tryApply for ProofErasedOffers
- `deserializeFromLedgerState()`: Given whole ledger serialized state, deserialize only the Zswap portion

**Whitelist Parameter**: Set of contract addresses of interest. If set, only these addresses are tracked and all other information is discarded.

---

## Enumerations

### NetworkId

The network currently being targeted.

```typescript
enum NetworkId {
  Undeployed = 0,  // Local test network
  DevNet = 1,      // Developer network (not guaranteed persistent)
  TestNet = 2,     // Persistent testnet
  MainNet = 3      // Midnight mainnet
}
```

**Usage**: Used throughout the API for serialization/deserialization to specify target network.

**Networks**:
- `Undeployed` (0): A local test network
- `DevNet` (1): A developer network, not guaranteed to be persistent
- `TestNet` (2): A persistent testnet (currently Testnet_02)
- `MainNet` (3): The Midnight mainnet (future)

---

### LocalState

The local state of a user/wallet, consisting of their secret key and a set of unspent coins.

```typescript
class LocalState {
  constructor();  // Creates new state with randomly sampled secret key
  
  readonly coinPublicKey: string;                            // Wallet's coin public key
  readonly encryptionPublicKey: string;                      // Wallet's encryption public key
  readonly coins: Set<QualifiedCoinInfo>;                    // Spendable coins
  readonly firstFree: bigint;                                // First free Merkle tree index
  readonly pendingOutputs: Map<string, CoinInfo>;            // Expected outputs
  readonly pendingSpends: Map<string, QualifiedCoinInfo>;    // Expected spends
  
  // Transaction application
  apply(offer: Offer): LocalState;
  applyProofErased(offer: ProofErasedOffer): LocalState;
  applyTx(tx: Transaction, res: "success" | "partialSuccess" | "failure"): LocalState;
  applyProofErasedTx(tx: ProofErasedTransaction, res: "success" | "partialSuccess" | "failure"): LocalState;
  applySystemTx(tx: SystemTransaction): LocalState;
  
  // Failed transaction handling
  applyFailed(offer: Offer): LocalState;
  applyFailedProofErased(offer: ProofErasedOffer): LocalState;
  
  // Merkle tree updates
  applyCollapsedUpdate(update: MerkleTreeCollapsedUpdate): LocalState;
  
  // Spending coins
  spend(coin: QualifiedCoinInfo): [LocalState, UnprovenInput];
  spendFromOutput(coin: QualifiedCoinInfo, output: UnprovenOutput): [LocalState, UnprovenTransient];
  
  // Watching for coins
  watchFor(coin: CoinInfo): LocalState;
  
  // Secret key access
  yesIKnowTheSecurityImplicationsOfThis_encryptionSecretKey(): EncryptionSecretKey;
  
  // Serialization
  serialize(netid: NetworkId): Uint8Array;
  toString(compact?: boolean): string;
  
  static fromSeed(seed: Uint8Array): LocalState;  // From recovery phrase/seed
  static deserialize(raw: Uint8Array, netid: NetworkId): LocalState;
}
```

**Description**:
The local state keeps track of:
- Coins that are in-flight (expecting to spend or receive)
- A local copy of the global coin commitment Merkle tree to generate proofs

**Properties**:
- `coinPublicKey`: The coin public key of this wallet
- `encryptionPublicKey`: The encryption public key of this wallet
- `coins`: The set of spendable coins of this wallet
- `firstFree`: The first free index in the internal coin commitments Merkle tree (identifies which updates are necessary)
- `pendingOutputs`: The outputs that this wallet is expecting to receive in the future
- `pendingSpends`: The spends that this wallet is expecting to be finalized on-chain

**Key Methods**:
- `apply()`: Locally applies an offer to the current state
- `applyProofErased()`: Locally applies a proof-erased offer
- `applyTx()`: Locally applies a transaction with result status
- `applyFailed()`: Marks an offer as failed, allowing inputs to be spendable again
- `applyCollapsedUpdate()`: Fast forwards through Merkle tree indices
- `spend()`: Initiates a spend of a specific coin, returns UnprovenInput
- `spendFromOutput()`: Spends a not-yet-received output, returns UnprovenTransient
- `watchFor()`: Adds a coin to the expected-to-receive list
- `yesIKnowTheSecurityImplicationsOfThis_encryptionSecretKey()`: ⚠️ Access encryption secret key
- `fromSeed()`: Creates state from recovery seed

**Merkle Tree Update Flow**:
1. Find where you left off (`firstFree`)
2. Find where you're going (ask for remote `firstFree`)
3. Filter entries you care about
4. In order of Merkle tree indices:
   - Insert (with `apply`) offers you care about
   - Skip sections you don't care about (with `applyCollapsedUpdate`)

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

## Utility Functions

The Ledger API provides several utility functions for working with proofs, coins, and cryptographic operations.

### bigIntModFr()

Takes a bigint modulus the proof system's scalar field.

```typescript
function bigIntModFr(x: bigint): bigint
```

**Parameters**:
- `x`: bigint to reduce modulo the scalar field

**Returns**: bigint reduced modulo the proof system's scalar field

**Usage**: Ensures bigint values are valid within the proof system's field.

---

### bigIntToValue()

Internal conversion between bigints and their field-aligned binary representation.

```typescript
function bigIntToValue(x: bigint): Value
```

**Parameters**:
- `x`: bigint to convert

**Returns**: `Value` - Field-aligned binary representation

**Note**: Internal function - typically used by the ledger implementation itself.

---

### checkProofData()

Internal implementation of proof dry runs.

```typescript
function checkProofData(
  zkir: string,
  input: AlignedValue,
  output: AlignedValue,
  public_transcript: Op<AlignedValue>[],
  private_transcript_outputs: AlignedValue[]
): void
```

**Parameters**:
- `zkir`: Zero-knowledge intermediate representation
- `input`: Aligned input value
- `output`: Aligned output value
- `public_transcript`: Array of public operations
- `private_transcript_outputs`: Array of private transcript outputs

**Returns**: void

**Throws**: If the proof would not hold

**Usage**: Used internally to validate proofs before submission.

---

### coinCommitment()

Internal implementation of the coin commitment primitive.

```typescript
function coinCommitment(
  coin: AlignedValue,
  recipient: AlignedValue
): AlignedValue
```

**Parameters**:
- `coin`: Aligned coin value
- `recipient`: Aligned recipient value

**Returns**: `AlignedValue` - The coin commitment

**Note**: Internal cryptographic primitive used in coin creation.

---

### communicationCommitment()

Computes the communication commitment corresponding to an input/output pair and randomness.

```typescript
function communicationCommitment(
  input: AlignedValue,
  output: AlignedValue,
  rand: string
): CommunicationCommitment
```

**Parameters**:
- `input`: Aligned input value
- `output`: Aligned output value
- `rand`: Randomness string

**Returns**: `CommunicationCommitment`

**Usage**: Used for cross-contract communication commitments to ensure message integrity.

---

### communicationCommitmentRandomness()

Samples a new CommunicationCommitmentRand uniformly.

```typescript
function communicationCommitmentRandomness(): CommunicationCommitmentRand
```

**Returns**: `CommunicationCommitmentRand` - Uniformly sampled randomness

**Usage**: Generate fresh randomness for communication commitments.

```typescript
const rand = communicationCommitmentRandomness();
const commitment = communicationCommitment(input, output, rand);
```

---

### createCoinInfo()

Creates a new CoinInfo, sampling a uniform nonce.

```typescript
function createCoinInfo(type_: string, value: bigint): CoinInfo
```

**Parameters**:
- `type_`: Token type identifier (string)
- `value`: Coin value (bigint)

**Returns**: `CoinInfo` with randomly sampled nonce

**Usage**: Primary way to create new coin information for transactions.

```typescript
const coin = createCoinInfo('DUST', 1000n);
```

---

### decodeCoinInfo()

Decode a CoinInfo from Compact's CoinInfo TypeScript representation.

```typescript
function decodeCoinInfo(coin: {
  color: Uint8Array;
  nonce: Uint8Array;
  value: bigint;
}): CoinInfo
```

**Parameters**:
- `coin`: Object with Compact's CoinInfo structure
  - `color`: Uint8Array representing token type
  - `nonce`: Uint8Array random nonce
  - `value`: bigint coin value

**Returns**: `CoinInfo` in Ledger API format

**Usage**: Convert between Compact contract representation and Ledger API representation.

```typescript
// From Compact contract
const compactCoin = {
  color: new Uint8Array([/* ... */]),
  nonce: new Uint8Array([/* ... */]),
  value: 1000n
};

const ledgerCoin = decodeCoinInfo(compactCoin);
```

---

### decodeCoinPublicKey()

Decode a CoinPublicKey from a Uint8Array originating from Compact's CoinPublicKey type.

```typescript
function decodeCoinPublicKey(pk: Uint8Array): CoinPublicKey
```

**Parameters**:
- `pk`: Uint8Array containing the coin public key bytes

**Returns**: `CoinPublicKey` in Ledger API format

**Usage**: Convert Compact contract public keys to Ledger API format.

```typescript
// From Compact contract
const compactPubKey = new Uint8Array([/* 32 bytes */]);
const ledgerPubKey = decodeCoinPublicKey(compactPubKey);
```

---

### decodeContractAddress()

Decode a ContractAddress from a Uint8Array originating from Compact's ContractAddress type.

```typescript
function decodeContractAddress(addr: Uint8Array): ContractAddress
```

**Parameters**:
- `addr`: Uint8Array containing the contract address bytes

**Returns**: `ContractAddress` in Ledger API format

**Usage**: Convert Compact contract addresses to Ledger API format for use in transactions.

```typescript
// From Compact contract
const compactAddress = new Uint8Array([/* address bytes */]);
const ledgerAddress = decodeContractAddress(compactAddress);

// Use in transaction
const output = UnprovenOutput.newContractOwned(coin, ledgerAddress);
```

---

### decodeQualifiedCoinInfo()

Decode a QualifiedCoinInfo from Compact's QualifiedCoinInfo TypeScript representation.

```typescript
function decodeQualifiedCoinInfo(coin: {
  color: Uint8Array;
  nonce: Uint8Array;
  value: bigint;
  mt_index: bigint;
}): QualifiedCoinInfo
```

**Parameters**:
- `coin`: Object with Compact's QualifiedCoinInfo structure
  - `color`: Uint8Array representing token type
  - `nonce`: Uint8Array random nonce
  - `value`: bigint coin value
  - `mt_index`: bigint Merkle tree index

**Returns**: `QualifiedCoinInfo` in Ledger API format

**Usage**: Convert qualified coins from Compact contracts to Ledger API format.

```typescript
// From Compact contract
const compactQualifiedCoin = {
  color: new Uint8Array([/* ... */]),
  nonce: new Uint8Array([/* ... */]),
  value: 1000n,
  mt_index: 42n
};

const ledgerQualifiedCoin = decodeQualifiedCoinInfo(compactQualifiedCoin);

// Use to create input
const input = UnprovenInput.newContractOwned(
  ledgerQualifiedCoin,
  contractAddress,
  zswapState
);
```

---

### decodeTokenType()

Decode a TokenType from a Uint8Array originating from Compact's TokenType type.

```typescript
function decodeTokenType(tt: Uint8Array): TokenType
```

**Parameters**:
- `tt`: Uint8Array containing the token type bytes

**Returns**: `TokenType` (string) in Ledger API format

**Usage**: Convert token types from Compact format to Ledger API string format.

```typescript
// From Compact contract
const compactTokenType = new Uint8Array([/* token type bytes */]);
const ledgerTokenType = decodeTokenType(compactTokenType);

// Use to create coin
const coin = createCoinInfo(ledgerTokenType, 1000n);
```

---

### degradeToTransient()

Internal implementation of the degrade to transient primitive.

```typescript
function degradeToTransient(persistent: Value): Value
```

**Parameters**:
- `persistent`: Value representing persistent data

**Returns**: `Value` in transient format

**Throws**: If persistent does not encode a 32-byte bytestring

**Note**: Internal function - converts persistent (Bytes<32>) values to transient (Field) values. This is the inverse of the `upgradeFromTransient` operation in CompactStandardLibrary.

**Usage**: Used internally by the ledger for type conversions between persistent and transient contexts.

---

## Decode Functions Summary

The decode functions provide essential bridges between Compact contract representations and Ledger API representations:

| Function | Converts From | Converts To | Common Use Case |
|----------|--------------|-------------|-----------------|
| `decodeCoinInfo()` | Compact CoinInfo | Ledger CoinInfo | Creating outputs from contract coins |
| `decodeCoinPublicKey()` | Compact bytes | Ledger CoinPublicKey | User public key handling |
| `decodeContractAddress()` | Compact bytes | Ledger ContractAddress | Contract-owned outputs/inputs |
| `decodeQualifiedCoinInfo()` | Compact QualifiedCoinInfo | Ledger QualifiedCoinInfo | Spending contract coins |
| `decodeTokenType()` | Compact bytes | Ledger TokenType (string) | Token type handling |

**Best Practice**: Always use these decode functions when working with data from Compact contracts to ensure proper type compatibility with the Ledger API.

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
