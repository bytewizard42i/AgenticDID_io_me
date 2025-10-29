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

### dummyContractAddress()

A sample contract address, guaranteed to be the same for a given network ID.

```typescript
function dummyContractAddress(): string
```

**Returns**: string - A consistent dummy contract address

**Usage**: For use in testing scenarios where you need a valid contract address format but don't have an actual deployed contract.

```typescript
import { dummyContractAddress, setNetworkId, NetworkId } from '@midnight-ntwrk/ledger';

setNetworkId(NetworkId.TestNet);
const testAddress = dummyContractAddress();

// Use in tests
const output = UnprovenOutput.newContractOwned(coin, testAddress);
```

---

### ecAdd()

Internal implementation of the elliptic curve addition primitive.

```typescript
function ecAdd(a: Value, b: Value): Value
```

**Parameters**:
- `a`: Value encoding an elliptic curve point
- `b`: Value encoding an elliptic curve point

**Returns**: `Value` - The sum of the two curve points

**Throws**: If either input does not encode an elliptic curve point

**Note**: Internal function - performs elliptic curve point addition. See CompactStandardLibrary's `ecAdd()` for the public API.

---

### ecMul()

Internal implementation of the elliptic curve multiplication primitive.

```typescript
function ecMul(a: Value, b: Value): Value
```

**Parameters**:
- `a`: Value encoding an elliptic curve point
- `b`: Value encoding a field element (scalar)

**Returns**: `Value` - The scalar multiplication result

**Throws**: If a does not encode an elliptic curve point or b does not encode a field element

**Note**: Internal function - performs elliptic curve scalar multiplication. See CompactStandardLibrary's `ecMul()` for the public API.

---

### ecMulGenerator()

Internal implementation of the elliptic curve generator multiplication primitive.

```typescript
function ecMulGenerator(val: Value): Value
```

**Parameters**:
- `val`: Value encoding a field element (scalar)

**Returns**: `Value` - Generator multiplied by the scalar

**Throws**: If val does not encode a field element

**Note**: Internal function - multiplies the curve generator by a scalar. See CompactStandardLibrary's `ecMulGenerator()` for the public API.

---

### encodeCoinInfo()

Encode a CoinInfo into Compact's CoinInfo TypeScript representation.

```typescript
function encodeCoinInfo(coin: CoinInfo): {
  color: Uint8Array;
  nonce: Uint8Array;
  value: bigint;
}
```

**Parameters**:
- `coin`: CoinInfo in Ledger API format

**Returns**: Object with Compact's CoinInfo structure
- `color`: Uint8Array representing token type
- `nonce`: Uint8Array random nonce
- `value`: bigint coin value

**Usage**: Convert from Ledger API format to Compact contract format. The inverse of `decodeCoinInfo()`.

```typescript
// Ledger API coin
const ledgerCoin: CoinInfo = createCoinInfo('DUST', 1000n);

// Convert for Compact contract
const compactCoin = encodeCoinInfo(ledgerCoin);

// Now usable in Compact contract calls
await contract.someCircuit(compactCoin);
```

---

### encodeCoinPublicKey()

Encode a CoinPublicKey into a Uint8Array for use in Compact's CoinPublicKey type.

```typescript
function encodeCoinPublicKey(pk: string): Uint8Array
```

**Parameters**:
- `pk`: CoinPublicKey as string (Ledger API format)

**Returns**: Uint8Array suitable for Compact's CoinPublicKey type

**Usage**: Convert public keys from Ledger API format to Compact contract format. The inverse of `decodeCoinPublicKey()`.

```typescript
// From LocalState
const localState = new LocalState();
const ledgerPubKey = localState.coinPublicKey;

// Convert for Compact contract
const compactPubKey = encodeCoinPublicKey(ledgerPubKey);

// Use in contract call
await contract.registerUser(compactPubKey);
```

---

### encodeContractAddress()

Encode a ContractAddress into a Uint8Array for use in Compact's ContractAddress type.

```typescript
function encodeContractAddress(addr: string): Uint8Array
```

**Parameters**:
- `addr`: ContractAddress as string (Ledger API format)

**Returns**: Uint8Array suitable for Compact's ContractAddress type

**Usage**: Convert contract addresses from Ledger API format to Compact contract format. The inverse of `decodeContractAddress()`.

```typescript
// Ledger API address
const contractAddr = '0x123...';

// Convert for Compact contract
const compactAddr = encodeContractAddress(contractAddr);

// Use in contract call
await contract.setTargetContract(compactAddr);
```

---

### encodeQualifiedCoinInfo()

Encode a QualifiedCoinInfo into Compact's QualifiedCoinInfo TypeScript representation.

```typescript
function encodeQualifiedCoinInfo(coin: QualifiedCoinInfo): {
  color: Uint8Array;
  nonce: Uint8Array;
  value: bigint;
  mt_index: bigint;
}
```

**Parameters**:
- `coin`: QualifiedCoinInfo in Ledger API format

**Returns**: Object with Compact's QualifiedCoinInfo structure
- `color`: Uint8Array representing token type
- `nonce`: Uint8Array random nonce
- `value`: bigint coin value
- `mt_index`: bigint Merkle tree index

**Usage**: Convert from Ledger API format to Compact contract format. The inverse of `decodeQualifiedCoinInfo()`.

```typescript
// From LocalState coin tracking
const ledgerQualifiedCoin = localState.unspentCoins[0];

// Convert for Compact contract
const compactQualifiedCoin = encodeQualifiedCoinInfo(ledgerQualifiedCoin);

// Use in contract call
await contract.spendCoin(compactQualifiedCoin);
```

---

### encodeTokenType()

Encode a TokenType into a Uint8Array for use in Compact's TokenType type.

```typescript
function encodeTokenType(tt: string): Uint8Array
```

**Parameters**:
- `tt`: TokenType as string (Ledger API format)

**Returns**: Uint8Array suitable for Compact's TokenType type

**Usage**: Convert token types from Ledger API string format to Compact contract format. Completes the encode/decode pair with `decodeTokenType()`.

```typescript
// Ledger API token type
const ledgerTokenType = 'DUST';

// Convert for Compact contract
const compactTokenType = encodeTokenType(ledgerTokenType);

// Use in contract call
await contract.processToken(compactTokenType);

// Or use native token
const nativeType = nativeToken();
const compactNative = encodeTokenType(nativeType);
```

---

### hashToCurve()

Internal implementation of the hash to curve primitive.

```typescript
function hashToCurve(align: Alignment, val: Value): Value
```

**Parameters**:
- `align`: Alignment specification
- `val`: Value to hash to curve

**Returns**: `Value` - Elliptic curve point

**Throws**: If val does not have alignment align

**Note**: Internal function - hashes arbitrary values to elliptic curve points. See CompactStandardLibrary's `hashToCurve()` for the public API.

---

### leafHash()

Internal implementation of the Merkle tree leaf hash primitive.

```typescript
function leafHash(value: AlignedValue): AlignedValue
```

**Parameters**:
- `value`: AlignedValue to hash as Merkle tree leaf

**Returns**: `AlignedValue` - The leaf hash

**Note**: Internal function - computes Merkle tree leaf hashes. Used by MerkleTree and HistoricMerkleTree internally.

---

### maxAlignedSize()

Internal implementation of the max aligned size primitive.

```typescript
function maxAlignedSize(alignment: Alignment): bigint
```

**Parameters**:
- `alignment`: Alignment specification

**Returns**: bigint - Maximum size for the given alignment

**Note**: Internal function - computes the maximum aligned size for a given alignment specification. Used for internal memory management and validation.

---

### maxField()

Returns the maximum representable value in the proof system's scalar field.

```typescript
function maxField(): bigint
```

**Returns**: bigint - Maximum field value (1 less than the prime modulus)

**Usage**: Useful for validation and range checks when working with field elements.

```typescript
const max = maxField();

// Validate field element
if (value > max) {
  throw new Error('Value exceeds field maximum');
}

// Or use with bigIntModFr() to ensure validity
const validValue = bigIntModFr(rawValue);
```

---

### nativeToken()

Returns the base/system token type.

```typescript
function nativeToken(): TokenType
```

**Returns**: `TokenType` (string) - The native/base token type identifier

**Usage**: Get the identifier for Midnight's native token (analogous to ETH on Ethereum or DUST on Midnight).

```typescript
import { nativeToken, createCoinInfo } from '@midnight-ntwrk/ledger';

// Create coin with native token
const nativeType = nativeToken();
const coin = createCoinInfo(nativeType, 1000n);

// Use in transactions
const output = UnprovenOutput.new(coin, recipientPubKey);
```

**Important**: Always use `nativeToken()` rather than hardcoding token type strings for native tokens to ensure compatibility across different network configurations.

---

### partitionTranscripts()

Finalizes a set of programs against their initial contexts, resulting in guaranteed and fallible Transcripts.

```typescript
function partitionTranscripts(
  calls: PreTranscript[],
  params: LedgerParameters
): [Transcript<AlignedValue> | undefined, Transcript<AlignedValue> | undefined][]
```

**Parameters**:
- `calls`: Array of PreTranscript (pre-finalized programs)
- `params`: LedgerParameters for the current ledger state

**Returns**: Array of tuples containing:
- First element: Guaranteed transcript (or undefined)
- Second element: Fallible transcript (or undefined)

**Usage**: Advanced function for finalizing contract calls with optimal allocation and heuristic gas fee coverage. Used internally by the transaction building process.

**Note**: This function optimally partitions contract operations into guaranteed (always executed) and fallible (may fail) sections, which is critical for proper transaction construction.

---

### persistentCommit()

Internal implementation of the persistent commitment primitive.

```typescript
function persistentCommit(
  align: Alignment,
  val: Value,
  opening: Value
): Value
```

**Parameters**:
- `align`: Alignment specification
- `val`: Value to commit to
- `opening`: Opening/randomness value (must encode a 32-byte bytestring)

**Returns**: `Value` - The commitment

**Throws**: If val does not have alignment align, opening does not encode a 32-byte bytestring, or any component has a compress alignment

**Note**: Internal function - creates persistent commitments. See CompactStandardLibrary's `persistentCommit()` for the public API. Persistent commitments are used for commit-reveal schemes on the ledger.

---

### persistentHash()

Internal implementation of the persistent hash primitive.

```typescript
function persistentHash(
  align: Alignment,
  val: Value
): Value
```

**Parameters**:
- `align`: Alignment specification
- `val`: Value to hash

**Returns**: `Value` - The hash (Bytes<32> representation)

**Throws**: If val does not have alignment align, or any component has a compress alignment

**Note**: Internal function - computes persistent hashes for ledger storage. See CompactStandardLibrary's `persistentHash()` for the public API. Used extensively in your fixed contracts for cryptographic security.

**Important**: Persistent hashes are **automatically disclosed** - no `disclose()` wrapper needed! This is because hash preimage resistance provides privacy protection.

---

### runProgram()

Runs a VM program against an initial stack, with an optional gas limit.

```typescript
function runProgram(
  initial: VmStack,
  ops: Op<null>[],
  cost_model: CostModel,
  gas_limit?: bigint
): VmResults
```

**Parameters**:
- `initial`: VmStack representing the starting stack state
- `ops`: Array of operations to execute
- `cost_model`: CostModel for gas calculation
- `gas_limit`: Optional gas limit (bigint)

**Returns**: `VmResults` containing:
- Final stack state
- Events emitted
- Gas cost consumed

**Usage**: Advanced function for executing VM programs. Used internally for contract execution and testing.

```typescript
// Example: Running a program with gas limit
const initialStack = new VmStack();
initialStack.push(someValue, true);

const result = runProgram(
  initialStack,
  operations,
  costModel,
  1000000n  // Gas limit
);

console.log(`Gas used: ${result.gasCost}`);
console.log(`Final stack size: ${result.stack.length()}`);
```

**Note**: This is a low-level function typically used for contract testing and internal ledger operations.

---

### sampleCoinPublicKey()

Samples a dummy user coin public key for use in testing.

```typescript
function sampleCoinPublicKey(): CoinPublicKey
```

**Returns**: `CoinPublicKey` - A randomly sampled coin public key

**Usage**: Generate test public keys without needing a real LocalState.

```typescript
import { sampleCoinPublicKey, UnprovenOutput, createCoinInfo } from '@midnight-ntwrk/ledger';

// Create test output
const testRecipient = sampleCoinPublicKey();
const coin = createCoinInfo('DUST', 1000n);
const output = UnprovenOutput.new(coin, testRecipient);

// Use in unit tests
describe('Transaction Tests', () => {
  it('should create valid output', () => {
    const recipient = sampleCoinPublicKey();
    expect(recipient).toBeDefined();
  });
});
```

**Best Practice**: Use this instead of hardcoded public keys in tests to avoid test brittleness and ensure randomness.

---

### sampleContractAddress()

Samples a uniform contract address for use in testing.

```typescript
function sampleContractAddress(): ContractAddress
```

**Returns**: `ContractAddress` - A uniformly sampled contract address

**Usage**: Generate random contract addresses for testing. Different from `dummyContractAddress()` which returns a consistent address for a given network.

```typescript
import { sampleContractAddress, UnprovenOutput, createCoinInfo } from '@midnight-ntwrk/ledger';

// Create contract-owned output with random address
const randomContract = sampleContractAddress();
const coin = createCoinInfo('DUST', 1000n);
const output = UnprovenOutput.newContractOwned(coin, randomContract);

// Test multiple contracts
const contracts = [
  sampleContractAddress(),
  sampleContractAddress(),
  sampleContractAddress()
];
```

**Comparison**:
- `dummyContractAddress()`: Same address every time (for a given network) - good for consistent tests
- `sampleContractAddress()`: Different address each time - good for randomized tests

---

### sampleSigningKey()

Randomly samples a SigningKey.

```typescript
function sampleSigningKey(): SigningKey
```

**Returns**: `SigningKey` - A randomly sampled signing key

**Usage**: Generate test signing keys for transaction authorization and testing.

```typescript
import { sampleSigningKey } from '@midnight-ntwrk/ledger';

// Create test signing key
const signingKey = sampleSigningKey();

// Use in transaction signing tests
describe('Transaction Signing', () => {
  it('should sign transaction', () => {
    const key = sampleSigningKey();
    const signature = signTransaction(transaction, key);
    expect(signature).toBeDefined();
  });
});

// Test multiple signers
const signers = Array.from({ length: 3 }, () => sampleSigningKey());
```

**Security Note**: These are randomly generated keys for **testing only**. Never use sampled keys in production - use proper key derivation from secure sources.

---

### sampleTokenType()

Samples a uniform token type for use in testing.

```typescript
function sampleTokenType(): TokenType
```

**Returns**: `TokenType` (string) - A uniformly sampled token type

**Usage**: Generate random token types for testing multi-token scenarios.

```typescript
import { sampleTokenType, createCoinInfo } from '@midnight-ntwrk/ledger';

// Create coin with random token type
const tokenType = sampleTokenType();
const coin = createCoinInfo(tokenType, 1000n);

// Test multi-token transfers
const tokens = [
  sampleTokenType(),
  sampleTokenType(),
  nativeToken()
];

describe('Multi-token Tests', () => {
  it('should handle different token types', () => {
    const type1 = sampleTokenType();
    const type2 = sampleTokenType();
    
    expect(type1).not.toBe(type2);  // Should be different
  });
});
```

---

### signData()

Signs arbitrary data with the given signing key.

```typescript
function signData(key: string, data: Uint8Array): Signature
```

**Parameters**:
- `key`: Signing key (string)
- `data`: Arbitrary data to sign (Uint8Array)

**Returns**: `Signature` - The signature over the data

**⚠️ WARNING**: Do not expose access to this function for valuable keys for data that is not strictly controlled!

**Usage**: Sign arbitrary data for verification purposes.

```typescript
import { signData, sampleSigningKey } from '@midnight-ntwrk/ledger';

// Create signature
const signingKey = sampleSigningKey();
const data = new Uint8Array([1, 2, 3, 4]);
const signature = signData(signingKey, data);

// Use in authentication
const message = encoder.encode('verify me');
const sig = signData(userKey, message);
```

**Security Critical**:
- Only sign data you fully control and understand
- Never expose this to untrusted input
- Prefer higher-level transaction signing when possible
- Use `signatureVerifyingKey()` to get the public verifying key

---

### signatureVerifyingKey()

Returns the verifying key for a given signing key.

```typescript
function signatureVerifyingKey(sk: string): SignatureVerifyingKey
```

**Parameters**:
- `sk`: Signing key (string)

**Returns**: `SignatureVerifyingKey` - The corresponding public verifying key

**Usage**: Derive the public key from a signing key for signature verification.

```typescript
import { sampleSigningKey, signatureVerifyingKey, signData } from '@midnight-ntwrk/ledger';

// Generate keypair
const signingKey = sampleSigningKey();
const verifyingKey = signatureVerifyingKey(signingKey);

// Sign and verify workflow
const data = new Uint8Array([1, 2, 3]);
const signature = signData(signingKey, data);

// Share verifyingKey publicly for verification
console.log(`Public key: ${verifyingKey}`);

// Verify signature (with verification function)
const isValid = verifySignature(verifyingKey, data, signature);
```

**Pattern**: Always derive the verifying key from the signing key, never hardcode or store it separately.

---

### tokenType()

Derives the TokenType associated with a particular DomainSeparator and contract.

```typescript
function tokenType(
  domain_sep: Uint8Array,
  contract: string
): TokenType
```

**Parameters**:
- `domain_sep`: Domain separator (Uint8Array)
- `contract`: Contract address (string)

**Returns**: `TokenType` (string) - The derived token type

**Usage**: Derive deterministic token types for contract-specific tokens.

```typescript
import { tokenType } from '@midnight-ntwrk/ledger';

// Derive contract-specific token type
const domainSep = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
const contractAddr = '0x123...';
const derivedTokenType = tokenType(domainSep, contractAddr);

// Create coin with derived type
const coin = createCoinInfo(derivedTokenType, 1000n);

// Each contract + domain_sep combination creates unique token type
const token1 = tokenType(domainSep, contractA);
const token2 = tokenType(domainSep, contractB);
// token1 !== token2 (different contracts)
```

**Use Cases**:
- Contract-specific tokens (each contract has its own token space)
- Domain-separated token types (avoid collisions)
- Deterministic token derivation (same inputs = same token type)

---

### transientCommit()

Internal implementation of the transient commitment primitive.

```typescript
function transientCommit(
  align: Alignment,
  val: Value,
  opening: Value
): Value
```

**Parameters**:
- `align`: Alignment specification
- `val`: Value to commit to
- `opening`: Opening/randomness value (must encode a field element)

**Returns**: `Value` - The commitment (Field representation)

**Throws**: If val does not have alignment align, or opening does not encode a field element

**Note**: Internal function - creates transient commitments for non-ledger data. See CompactStandardLibrary's `transientCommit()` for the public API. Transient commitments use Field elements (vs Bytes<32> for persistent).

**Comparison**:
- `transientCommit()`: Field-based, for non-ledger/circuit-local data
- `persistentCommit()`: Bytes<32>-based, for ledger storage

---

### transientHash()

Internal implementation of the transient hash primitive.

```typescript
function transientHash(
  align: Alignment,
  val: Value
): Value
```

**Parameters**:
- `align`: Alignment specification
- `val`: Value to hash

**Returns**: `Value` - The hash (Field representation)

**Throws**: If val does not have alignment align

**Note**: Internal function - computes transient hashes for non-ledger data. See CompactStandardLibrary's `transientHash()` for the public API.

**Important**: Like `persistentHash()`, transient hashes are **automatically disclosed** - no `disclose()` wrapper needed!

**Comparison**:
- `transientHash()`: Returns Field, for non-ledger/circuit-local data
- `persistentHash()`: Returns Bytes<32>, for ledger storage

---

### upgradeFromTransient()

Internal implementation of the upgrade from transient primitive.

```typescript
function upgradeFromTransient(transient: Value): Value
```

**Parameters**:
- `transient`: Value encoding a field element (transient data)

**Returns**: `Value` - The upgraded persistent representation (Bytes<32>)

**Throws**: If transient does not encode a field element

**Note**: Internal function - converts transient (Field) values to persistent (Bytes<32>) values. This is the inverse of `degradeToTransient()`. See CompactStandardLibrary's `upgradeFromTransient()` for the public API.

**Usage**: Used internally by the ledger for type conversions between transient and persistent contexts.

**Conversion Pair**:
- `degradeToTransient()`: Bytes<32> → Field (persistent to transient)
- `upgradeFromTransient()`: Field → Bytes<32> (transient to persistent)

---

### valueToBigInt()

Internal conversion between field-aligned binary values and bigints within the scalar field.

```typescript
function valueToBigInt(x: Value): bigint
```

**Parameters**:
- `x`: Value to convert

**Returns**: bigint within the scalar field

**Throws**: If the value does not encode a field element

**Note**: Internal function - converts Values to bigints. The inverse of `bigIntToValue()`.

**Conversion Pair**:
- `bigIntToValue()`: bigint → Value
- `valueToBigInt()`: Value → bigint

---

### verifySignature()

Verifies if a signature is correct.

```typescript
function verifySignature(
  vk: string,
  data: Uint8Array,
  signature: string
): boolean
```

**Parameters**:
- `vk`: Signature verifying key (public key, string)
- `data`: Data that was signed (Uint8Array)
- `signature`: Signature to verify (string)

**Returns**: boolean - `true` if signature is valid, `false` otherwise

**Usage**: Verify signatures created with `signData()`.

```typescript
import { 
  sampleSigningKey, 
  signatureVerifyingKey, 
  signData, 
  verifySignature 
} from '@midnight-ntwrk/ledger';

// Complete sign and verify workflow
const signingKey = sampleSigningKey();
const verifyingKey = signatureVerifyingKey(signingKey);

const data = new Uint8Array([1, 2, 3, 4]);
const signature = signData(signingKey, data);

// Verify signature
const isValid = verifySignature(verifyingKey, data, signature);
console.log(`Signature valid: ${isValid}`);  // true

// Wrong data fails verification
const wrongData = new Uint8Array([5, 6, 7, 8]);
const isInvalid = verifySignature(verifyingKey, wrongData, signature);
console.log(`Wrong data valid: ${isInvalid}`);  // false
```

**Complete Signing Pattern**:
```typescript
// 1. Generate or load signing key
const signingKey = sampleSigningKey();  // Testing only!

// 2. Derive public verifying key
const verifyingKey = signatureVerifyingKey(signingKey);

// 3. Sign data
const message = encoder.encode('Important message');
const signature = signData(signingKey, message);

// 4. Share signature + verifying key (not signing key!)
// Send to other party: { verifyingKey, message, signature }

// 5. Verify signature
const isAuthentic = verifySignature(verifyingKey, message, signature);
```

**Security Notes**:
- Never share the signing key - only the verifying key
- Always verify signatures before trusting data
- Use proper key derivation in production (not `sampleSigningKey()`)

---

## Testing Utilities Summary

The Ledger API provides comprehensive testing utilities to facilitate unit and integration testing:

### Sampling Functions

| Function | Returns | Use Case | Randomness |
|----------|---------|----------|------------|
| `dummyContractAddress()` | ContractAddress | Consistent test address | Deterministic (per network) |
| `sampleContractAddress()` | ContractAddress | Random contract addresses | Uniform random |
| `sampleCoinPublicKey()` | CoinPublicKey | Random user public keys | Uniform random |
| `sampleSigningKey()` | SigningKey | Random signing keys | Uniform random |
| `sampleTokenType()` | TokenType | Random token types | Uniform random |

### Testing Best Practices

1. **Use sampling functions** instead of hardcoded values
2. **Deterministic tests**: Use `dummyContractAddress()` for reproducible results
3. **Randomized tests**: Use `sample*()` functions for property-based testing
4. **Never in production**: Sampling functions are for testing only

### Example Test Suite

```typescript
import {
  sampleCoinPublicKey,
  sampleContractAddress,
  sampleSigningKey,
  createCoinInfo,
  UnprovenOutput,
  UnprovenTransaction
} from '@midnight-ntwrk/ledger';

describe('Transaction Building', () => {
  it('should create user-to-user transfer', () => {
    const sender = sampleCoinPublicKey();
    const recipient = sampleCoinPublicKey();
    const coin = createCoinInfo('DUST', 1000n);
    
    const output = UnprovenOutput.new(coin, recipient);
    expect(output).toBeDefined();
  });
  
  it('should create contract interaction', () => {
    const contract = sampleContractAddress();
    const coin = createCoinInfo('DUST', 500n);
    
    const output = UnprovenOutput.newContractOwned(coin, contract);
    expect(output.contractAddress).toBe(contract);
  });
  
  it('should handle multiple signers', () => {
    const signers = [
      sampleSigningKey(),
      sampleSigningKey(),
      sampleSigningKey()
    ];
    
    expect(signers).toHaveLength(3);
    // Each should be unique
    const unique = new Set(signers);
    expect(unique.size).toBe(3);
  });
});
```

---

## Encode/Decode Functions Summary

The encode and decode functions provide essential bidirectional bridges between Compact contract representations and Ledger API representations:

### Complete Conversion Table

| Type | Decode (Compact → Ledger) | Encode (Ledger → Compact) | Use Case |
|------|---------------------------|---------------------------|----------|
| **CoinInfo** | `decodeCoinInfo()` | `encodeCoinInfo()` | Basic coin data exchange |
| **QualifiedCoinInfo** | `decodeQualifiedCoinInfo()` | `encodeQualifiedCoinInfo()` | Spending contract coins with Merkle index |
| **CoinPublicKey** | `decodeCoinPublicKey()` | `encodeCoinPublicKey()` | User identity in shielded transactions |
| **ContractAddress** | `decodeContractAddress()` | `encodeContractAddress()` | Contract-to-contract interactions |
| **TokenType** | `decodeTokenType()` | `encodeTokenType()` | Token type conversion (use with `nativeToken()`) |

### When to Use Each Direction

**Decode (Compact → Ledger)**: Use when receiving data FROM a Compact contract
```typescript
// Contract returns coin data
const compactCoin = await contract.getCoin();
const ledgerCoin = decodeCoinInfo(compactCoin);

// Use in Ledger API
const output = UnprovenOutput.new(ledgerCoin, recipientPubKey);
```

**Encode (Ledger → Compact)**: Use when passing data TO a Compact contract
```typescript
// Create coin in Ledger API
const ledgerCoin = createCoinInfo('DUST', 1000n);

// Pass to contract
const compactCoin = encodeCoinInfo(ledgerCoin);
await contract.processCoin(compactCoin);
```

### Best Practices

1. **Always convert at boundaries**: Never mix Compact and Ledger representations
2. **Use TypeScript types**: Let the compiler catch conversion errors
3. **Consistent direction**: Decode for reads, encode for writes
4. **Testing**: Use `dummyContractAddress()` for consistent test data

**Memory Aid**: 
- **decode** = Compact **OUT** → Ledger API (data coming out of contract)
- **encode** = Ledger API **IN** → Compact (data going into contract)

---

## Type Aliases

The Ledger API defines several important type aliases for working with aligned values, alignments, and blockchain context.

### AlignedValue

An onchain data value, in field-aligned binary format, annotated with its alignment.

```typescript
type AlignedValue = {
  alignment: Alignment;
  value: Value;
};
```

**Properties**:
- `alignment`: Alignment specification for the value
- `value`: The actual value in field-aligned binary format

**Usage**: Used throughout the API for type-safe handling of on-chain data with known alignment.

---

### Alignment

The alignment of an onchain field-aligned binary data value.

```typescript
type Alignment = AlignmentSegment[];
```

**Description**: An array of alignment segments that describe the structure and alignment requirements of on-chain data.

**Usage**: Specifies how data should be aligned when stored on-chain or processed by the VM.

---

### AlignmentAtom

An atom in a larger Alignment.

```typescript
type AlignmentAtom = 
  | { tag: "compress"; }
  | { tag: "field"; }
  | { tag: "bytes"; length: number; };
```

**Variants**:
- `{ tag: "compress" }` - Compressed alignment
- `{ tag: "field" }` - Field element alignment
- `{ tag: "bytes"; length: number }` - Byte array alignment with specified length

**Description**: The atomic unit of alignment specification. Multiple atoms can be combined into alignment segments.

---

### AlignmentSegment

A segment in a larger Alignment.

```typescript
type AlignmentSegment = 
  | { tag: "option"; value: Alignment[]; }
  | { tag: "atom"; value: AlignmentAtom; };
```

**Variants**:
- `{ tag: "option"; value: Alignment[] }` - Optional alignment (for Maybe types)
- `{ tag: "atom"; value: AlignmentAtom }` - Atomic alignment segment

**Description**: Segments combine to form complete alignment specifications for complex data structures.

---

### BlockContext

The context information about a block available inside the VM.

```typescript
type BlockContext = {
  blockHash: string;
  secondsSinceEpoch: bigint;
  secondsSinceEpochErr: number;
};
```

**Properties**:
- `blockHash`: The hash of the block prior to this transaction (hex-encoded string)
- `secondsSinceEpoch`: The seconds since the UNIX epoch that have elapsed
- `secondsSinceEpochErr`: The maximum error on secondsSinceEpoch (positive seconds value)

**Usage**: Provides blockchain context information during VM execution, useful for time-based conditions and block identification.

```typescript
// Example usage in contract execution
const context = getBlockContext();
console.log(`Block hash: ${context.blockHash}`);
console.log(`Timestamp: ${context.secondsSinceEpoch}`);
console.log(`Time accuracy: ±${context.secondsSinceEpochErr}s`);
```

---

### CoinCommitment

A Zswap coin commitment, as a hex-encoded 256-bit bitstring.

```typescript
type CoinCommitment = string;
```

**Description**: Represents a cryptographic commitment to a coin in the Zswap shielded pool. The commitment hides the coin details while allowing verification.

**Format**: Hex-encoded string representing a 256-bit value

**Usage**: Used in shielded transactions to commit to coins without revealing their details.

```typescript
// Coin commitments appear in outputs
const output = UnprovenOutput.new(coin, recipientPubKey);
console.log(`Commitment: ${output.commitment}`);
```

**Security**: The commitment cryptographically binds to the coin details without revealing them, providing privacy while ensuring integrity.

---

### CoinInfo

Information required to create a new coin, alongside details about the recipient.

```typescript
type CoinInfo = {
  nonce: Nonce;
  type: TokenType;
  value: bigint;
};
```

**Properties**:
- `nonce`: The coin's randomness (Nonce), preventing it from colliding with other coins
- `type`: The coin's type (TokenType), identifying the currency it represents
- `value`: The coin's value in atomic units (bigint), bounded to be a non-negative 64-bit integer

**Usage**: Used throughout the API for creating and managing coins.

```typescript
import { createCoinInfo, nativeToken } from '@midnight-ntwrk/ledger';

// Create coin with native token
const coin: CoinInfo = createCoinInfo(nativeToken(), 1000n);

// Access coin properties
console.log(`Type: ${coin.type}`);
console.log(`Value: ${coin.value}`);
console.log(`Nonce: ${coin.nonce}`);
```

**Important**: The `value` must be a non-negative 64-bit integer. The `nonce` ensures each coin is unique even with identical type and value.

---

### CoinPublicKey

A user public key capable of receiving Zswap coins.

```typescript
type CoinPublicKey = string;
```

**Format**: Hex-encoded 35-byte string

**Description**: Represents a user's public key for receiving shielded coins in the Zswap protocol.

**Usage**: Used when creating outputs targeted to users.

```typescript
import { sampleCoinPublicKey, UnprovenOutput, createCoinInfo } from '@midnight-ntwrk/ledger';

// Get user's public key
const recipientPubKey: CoinPublicKey = sampleCoinPublicKey();

// Create output for user
const coin = createCoinInfo('DUST', 1000n);
const output = UnprovenOutput.new(coin, recipientPubKey);
```

**Security**: Public keys can be safely shared. They allow others to send you coins without revealing your identity.

---

### CommunicationCommitment

A hex-encoded commitment of data shared between two contracts in a call.

```typescript
type CommunicationCommitment = string;
```

**Description**: Used for cross-contract communication to ensure data integrity. The commitment binds to the data without revealing it until the appropriate time.

**Usage**: Created with `communicationCommitment()` function.

```typescript
import { communicationCommitment, communicationCommitmentRandomness } from '@midnight-ntwrk/ledger';

// Create commitment for cross-contract call
const rand = communicationCommitmentRandomness();
const commitment: CommunicationCommitment = communicationCommitment(
  input,
  output,
  rand
);
```

**Purpose**: Enables contracts to verifiably share data while maintaining privacy and integrity guarantees.

---

### CommunicationCommitmentRand

The hex-encoded randomness to CommunicationCommitment.

```typescript
type CommunicationCommitmentRand = string;
```

**Description**: The randomness value used when creating a CommunicationCommitment. Must be kept secret until the commitment is revealed.

**Usage**: Generated with `communicationCommitmentRandomness()` function.

```typescript
import { communicationCommitmentRandomness } from '@midnight-ntwrk/ledger';

// Sample fresh randomness
const rand: CommunicationCommitmentRand = communicationCommitmentRandomness();

// Use in commitment
const commitment = communicationCommitment(input, output, rand);

// Later, reveal the randomness to open the commitment
```

**Security**: The randomness must be uniformly sampled and kept secret. Revealing it prematurely compromises the commitment scheme.

---

### ContractAction

An interaction with a contract.

```typescript
type ContractAction = ContractCall | ContractDeploy | MaintenanceUpdate;
```

**Description**: Union type representing the three types of contract interactions possible in a transaction.

**Variants**:
- `ContractCall` - Call an existing contract's circuit
- `ContractDeploy` - Deploy a new contract
- `MaintenanceUpdate` - Update a contract's verifier keys or authority

**Usage**: Used in transactions to specify contract interactions.

```typescript
// Contract actions appear in transactions
const tx: UnprovenTransaction = /* ... */;
const actions: ContractAction[] = tx.contractCalls;
```

---

### ContractAddress

A contract address.

```typescript
type ContractAddress = string;
```

**Format**: Hex-encoded 35-byte string

**Description**: Uniquely identifies a deployed contract on the Midnight network.

**Usage**: Used throughout the API for contract identification and targeting.

```typescript
import { sampleContractAddress, dummyContractAddress } from '@midnight-ntwrk/ledger';

// Random contract address (testing)
const randomAddr: ContractAddress = sampleContractAddress();

// Deterministic dummy address (testing)
const dummyAddr: ContractAddress = dummyContractAddress();

// Use in contract-owned output
const output = UnprovenOutput.newContractOwned(coin, randomAddr);
```

---

### DomainSeperator

A token domain separator, the pre-stage of TokenType.

```typescript
type DomainSeperator = Uint8Array;
```

**Format**: 32-byte bytearray

**Description**: Used with contract addresses to derive token types. Provides namespace separation for contract-specific tokens.

**Usage**: Combined with contract address to create deterministic token types.

```typescript
import { tokenType } from '@midnight-ntwrk/ledger';

// Create domain separator
const domainSep: DomainSeperator = new Uint8Array([
  0x01, 0x02, 0x03, 0x04, /* ... 32 bytes total */
]);

// Derive token type from domain separator + contract
const myTokenType = tokenType(domainSep, contractAddress);
```

**Purpose**: Ensures token types are unique per contract and domain, preventing accidental collisions.

---

### Effects

The contract-external effects of a transcript.

```typescript
type Effects = {
  claimedContractCalls: [bigint, ContractAddress, string, Fr][];
  claimedNullifiers: Nullifier[];
  claimedReceives: CoinCommitment[];
  claimedSpends: CoinCommitment[];
  mints: Map<string, bigint>;
};
```

**Properties**:
- `claimedContractCalls`: Array of contract calls, each tuple containing:
  - Sequence number of the call (bigint)
  - Contract being called (ContractAddress)
  - Entry point being called (string)
  - Communications commitment (Fr)
- `claimedNullifiers`: Nullifiers (spends) required by this contract call
- `claimedReceives`: Coin commitments (outputs) required as coins received
- `claimedSpends`: Coin commitments (outputs) required as coins sent
- `mints`: Tokens minted, map from hex-encoded 256-bit domain separators to non-negative 64-bit integers

**Description**: Represents the external effects of contract execution - what the contract claims to do in terms of contract calls, coin movements, and token minting.

**Usage**: Used internally to track and verify contract execution effects.

---

### EncPublicKey

An encryption public key, used to inform users of new coins sent to them.

```typescript
type EncPublicKey = string;
```

**Description**: Public key used for encrypting coin information so recipients can decrypt and learn about coins sent to them.

**Usage**: Part of the user's key material, paired with CoinPublicKey.

```typescript
// From LocalState
const localState = new LocalState();
const encPubKey: EncPublicKey = localState.encryptionPublicKey;
const coinPubKey: CoinPublicKey = localState.coinPublicKey;

// Create output with optional encryption
const output = UnprovenOutput.new(
  coin,
  coinPubKey,
  encPubKey  // Optional: allows recipient to learn about the coin
);
```

**Privacy**: The encryption ensures only the intended recipient can learn about the coin details.

---

### EncodedStateValue

An alternative encoding of StateValue for use in Op for technical reasons.

```typescript
type EncodedStateValue = 
  | { tag: "null"; }
  | { tag: "cell"; content: EncodedStateValue; }
  | { tag: "map"; content: Map<AlignedValue, EncodedStateValue>; }
  | { tag: "array"; content: EncodedStateValue[]; }
  | { tag: "boundedMerkleTree"; content: [number, Map<bigint, [Uint8Array, undefined]>]; };
```

**Variants**:
- `{ tag: "null" }` - Null/empty value
- `{ tag: "cell"; content: EncodedStateValue }` - Cell containing a value
- `{ tag: "map"; content: Map<AlignedValue, EncodedStateValue> }` - Map of aligned values
- `{ tag: "array"; content: EncodedStateValue[] }` - Array of values
- `{ tag: "boundedMerkleTree"; content: [number, Map<bigint, [Uint8Array, undefined]>] }` - Bounded Merkle tree

**Description**: Alternative encoding used in VM operations for technical reasons. Mirrors the StateValue structure but optimized for operation serialization.

**Note**: Internal type - typically you'll work with StateValue directly unless implementing low-level VM operations.

---

### Fr

An internal encoding of a value of the proof system's scalar field.

```typescript
type Fr = Uint8Array;
```

**Description**: Represents a field element in the proof system's scalar field. Used internally for cryptographic operations.

**Usage**: Internal type used by the proof system. Most developers will work with higher-level abstractions.

**Related**: Used in Effects for communications commitments and in various internal cryptographic operations.

---

### GatherResult

An individual result of observing the results of a non-verifying VM program execution.

```typescript
type GatherResult = 
  | { tag: "read"; content: AlignedValue; }
  | { tag: "log"; content: EncodedStateValue; };
```

**Variants**:
- `{ tag: "read"; content: AlignedValue }` - Read operation result with aligned value
- `{ tag: "log"; content: EncodedStateValue }` - Log operation result with encoded state

**Description**: Represents individual observations from VM program execution. Used to gather results during non-verifying execution (e.g., testing or dry runs).

**Usage**: Appears in VmResults as an array of gathered events.

```typescript
// From VM execution
const results: VmResults = runProgram(initialStack, ops, costModel);
const events: GatherResult[] = results.events;

// Process gathered results
events.forEach(event => {
  if (event.tag === "read") {
    console.log(`Read: ${event.content.value}`);
  } else if (event.tag === "log") {
    console.log(`Log: ${JSON.stringify(event.content)}`);
  }
});
```

**Related**: Used by `VmResults.events` property.

---

### Key

A key used to index into an array or map in the onchain VM.

```typescript
type Key = 
  | { tag: "value"; value: AlignedValue; }
  | { tag: "stack"; };
```

**Variants**:
- `{ tag: "value"; value: AlignedValue }` - Explicit value key for indexing
- `{ tag: "stack" }` - Use top of stack as key

**Description**: Represents how to index into VM data structures during operation execution.

**Usage**: Used internally by VM operations to specify indexing behavior.

---

### Nonce

A Zswap nonce.

```typescript
type Nonce = string;
```

**Format**: Hex-encoded 256-bit string

**Description**: Random value used in coin creation to ensure uniqueness. Prevents coin collisions even with identical type and value.

**Usage**: Part of CoinInfo structure, automatically generated by `createCoinInfo()`.

```typescript
import { createCoinInfo } from '@midnight-ntwrk/ledger';

// Nonce is automatically sampled
const coin = createCoinInfo('DUST', 1000n);
console.log(`Nonce: ${coin.nonce}`);  // Hex-encoded 256-bit string

// Each call generates different nonce
const coin1 = createCoinInfo('DUST', 1000n);
const coin2 = createCoinInfo('DUST', 1000n);
// coin1.nonce !== coin2.nonce (with overwhelming probability)
```

**Security**: The nonce must be uniformly random to ensure coin uniqueness and prevent tracking of coin relationships.

**Related**: Used in CoinInfo, prevents coin collisions in the Zswap shielded pool.

---

### Nullifier

A Zswap nullifier.

```typescript
type Nullifier = string;
```

**Format**: Hex-encoded 256-bit bitstring

**Description**: A unique value derived from a coin that marks it as spent. Published when a coin is spent to prevent double-spending.

**Usage**: Used internally by the Zswap protocol for spend tracking.

```typescript
// Nullifiers appear in inputs
const input = UnprovenInput.newContractOwned(qualifiedCoin, contract, state);
console.log(`Nullifier: ${input.nullifier}`);

// Also tracked in transaction effects
const effects: Effects = /* ... */;
const spentCoins: Nullifier[] = effects.claimedNullifiers;
```

**Privacy**: The nullifier reveals that *some* coin was spent but doesn't reveal which specific coin (amount, type, or owner).

**Security**: Once a nullifier is published, it prevents the same coin from being spent again (double-spending protection).

**Related**: 
- Used in Input and UnprovenInput classes
- Tracked in Effects.claimedNullifiers
- Core to Zswap's double-spend prevention mechanism

---

### Op

An individual operation in the onchain VM.

```typescript
type Op<R> = 
  // Control flow
  | { noop: { n: number; }; }
  | { branch: { skip: number; }; }
  | { jmp: { skip: number; }; }
  | "ckpt"
  
  // Stack operations
  | "pop"
  | { popeq: { cached: boolean; result: R; }; }
  | { push: { storage: boolean; value: EncodedStateValue; }; }
  | { dup: { n: number; }; }
  | { swap: { n: number; }; }
  
  // Arithmetic
  | "add"
  | "sub"
  | { addi: { immediate: number; }; }
  | { subi: { immediate: number; }; }
  
  // Comparison
  | "lt"
  | "eq"
  
  // Logical
  | "and"
  | "or"
  | "neg"
  
  // Data operations
  | "type"
  | "size"
  | "new"
  | { concat: { cached: boolean; n: number; }; }
  | { idx: { cached: boolean; path: Key[]; pushPath: boolean; }; }
  | { ins: { cached: boolean; n: number; }; }
  | { rem: { cached: boolean; }; }
  | "member"
  
  // Tree operations
  | "root"
  
  // Debugging
  | "log";
```

**Type Parameter**:
- `R`: `null` (for gathering mode) or `AlignedValue` (for verifying mode)

**Operation Categories**:

**Control Flow**:
- `noop` - No operation, skip n instructions
- `branch` - Conditional branch, skip n instructions if top of stack is false
- `jmp` - Unconditional jump, skip n instructions
- `ckpt` - Checkpoint, marks an atomic execution unit

**Stack Management**:
- `pop` - Remove top of stack
- `popeq` - Pop and check equality with result
- `push` - Push encoded state value onto stack
- `dup` - Duplicate stack element at position n
- `swap` - Swap top of stack with element at position n

**Arithmetic Operations**:
- `add` - Add top two stack elements
- `sub` - Subtract top stack element from second
- `addi` - Add immediate value to top of stack
- `subi` - Subtract immediate value from top of stack

**Comparison Operations**:
- `lt` - Less than comparison
- `eq` - Equality comparison

**Logical Operations**:
- `and` - Logical AND
- `or` - Logical OR
- `neg` - Logical negation

**Data Operations**:
- `type` - Get type of value
- `size` - Get size of value
- `new` - Create new value
- `concat` - Concatenate n values from stack
- `idx` - Index into data structure following path
- `ins` - Insert n values
- `rem` - Remove value
- `member` - Check membership

**Tree Operations**:
- `root` - Get Merkle tree root

**Debugging**:
- `log` - Log current stack state

**Usage**: Used in `runProgram()` to execute VM programs.

```typescript
// Example: Simple VM program
const ops: Op<null>[] = [
  { push: { storage: false, value: { tag: "null" } } },
  { addi: { immediate: 42 } },
  "log",
  "pop"
];

const result = runProgram(initialStack, ops, costModel);
```

**Note**: Low-level type used for VM implementation. Most developers work with higher-level contract abstractions.

**Related**: 
- Used by `runProgram()` function
- Results captured in `GatherResult[]` via `VmResults.events`
- `cached` flags optimize repeated operations

---

### QualifiedCoinInfo

Information required to spend an existing coin, alongside authorization of the owner.

```typescript
type QualifiedCoinInfo = {
  nonce: Nonce;
  type: TokenType;
  value: bigint;
  mt_index: bigint;
};
```

**Properties**:
- `nonce`: The coin's randomness (Nonce), preventing it from colliding with other coins
- `type`: The coin's type (TokenType), identifying the currency it represents
- `value`: The coin's value in atomic units (bigint), bounded to be a non-negative 64-bit integer
- `mt_index`: The coin's location in the chain's Merkle tree of coin commitments (bigint), bounded to be a non-negative 64-bit integer

**Description**: Extends CoinInfo with the Merkle tree index, which is required to spend an existing coin. The index proves the coin exists in the global Merkle tree of commitments.

**Comparison with CoinInfo**:
- `CoinInfo` - For creating **new** coins
- `QualifiedCoinInfo` - For spending **existing** coins (includes `mt_index`)

**Usage**: Used when creating inputs from existing coins.

```typescript
import { 
  UnprovenInput, 
  decodeQualifiedCoinInfo, 
  encodeQualifiedCoinInfo 
} from '@midnight-ntwrk/ledger';

// From LocalState tracking
const qualifiedCoin: QualifiedCoinInfo = localState.unspentCoins[0];

// Create input to spend the coin
const input = UnprovenInput.newContractOwned(
  qualifiedCoin,
  contractAddress,
  zswapState
);

// Convert between formats
const compactCoin = encodeQualifiedCoinInfo(qualifiedCoin);
const ledgerCoin = decodeQualifiedCoinInfo(compactCoin);
```

**Important**: The `mt_index` is the coin's position in the global Merkle tree and is crucial for generating the Merkle proof that the coin exists.

**Related**:
- Used by `UnprovenInput.newContractOwned()`
- Tracked in `LocalState.unspentCoins`
- Encode/decode functions: `encodeQualifiedCoinInfo()` / `decodeQualifiedCoinInfo()`

---

### Signature

A hex-encoded BIP-340 signature, with a 3-byte version prefix.

```typescript
type Signature = string;
```

**Format**: Hex-encoded BIP-340 signature with 3-byte version prefix

**Description**: Represents a cryptographic signature used for transaction authorization and data verification.

**Usage**: Created with `signData()` and verified with `verifySignature()`.

```typescript
import { 
  sampleSigningKey, 
  signData, 
  signatureVerifyingKey, 
  verifySignature 
} from '@midnight-ntwrk/ledger';

// Sign data
const signingKey = sampleSigningKey();
const data = new Uint8Array([1, 2, 3, 4]);
const signature: Signature = signData(signingKey, data);

// Verify signature
const verifyingKey = signatureVerifyingKey(signingKey);
const isValid = verifySignature(verifyingKey, data, signature);
console.log(`Valid: ${isValid}`);  // true
```

**BIP-340**: Bitcoin Improvement Proposal 340 defines Schnorr signatures for Bitcoin. Midnight uses the same signature scheme for compatibility and proven security.

**Version Prefix**: The 3-byte prefix allows for future signature algorithm upgrades while maintaining backward compatibility.

**Security**: 
- Never reuse signatures across different contexts
- Always verify signatures before trusting signed data
- Keep signing keys secure and never share them

**Related**:
- Created by `signData()` function
- Verified by `verifySignature()` function
- Public key derived with `signatureVerifyingKey()`

---

### SignatureVerifyingKey

A hex-encoded BIP-340 verifying key, with a 3-byte version prefix.

```typescript
type SignatureVerifyingKey = string;
```

**Format**: Hex-encoded BIP-340 public key with 3-byte version prefix

**Description**: The public key corresponding to a SigningKey. Used to verify signatures without revealing the private signing key.

**Usage**: Derived from a signing key using `signatureVerifyingKey()`.

```typescript
import { sampleSigningKey, signatureVerifyingKey } from '@midnight-ntwrk/ledger';

// Generate keypair
const signingKey: SigningKey = sampleSigningKey();
const verifyingKey: SignatureVerifyingKey = signatureVerifyingKey(signingKey);

// Share verifying key publicly (safe!)
console.log(`Public key: ${verifyingKey}`);
```

**Security**: Safe to share publicly. Allows others to verify your signatures without compromising your signing key.

**Related**: Used by `verifySignature()` function

---

### SigningKey

A hex-encoded BIP-340 signing key, with a 3-byte version prefix.

```typescript
type SigningKey = string;
```

**Format**: Hex-encoded BIP-340 private key with 3-byte version prefix

**Description**: The private key used to create signatures. Must be kept secret.

**Usage**: Used with `signData()` to create signatures.

```typescript
import { sampleSigningKey, signData } from '@midnight-ntwrk/ledger';

// Generate or load signing key
const signingKey: SigningKey = sampleSigningKey();

// Sign data
const data = new Uint8Array([1, 2, 3, 4]);
const signature = signData(signingKey, data);
```

**⚠️ CRITICAL SECURITY**:
- **NEVER** share or expose signing keys
- **NEVER** hardcode in source code
- Store securely (encrypted storage, hardware wallets)
- Use `sampleSigningKey()` for testing ONLY

**Related**: Paired with SignatureVerifyingKey via `signatureVerifyingKey()`

---

### SingleUpdate

A single update instruction in a MaintenanceUpdate.

```typescript
type SingleUpdate = ReplaceAuthority | VerifierKeyRemove | VerifierKeyInsert;
```

**Variants**:
- `ReplaceAuthority` - Replace the contract's maintenance authority
- `VerifierKeyRemove` - Remove a verifier key for a specific operation/version
- `VerifierKeyInsert` - Insert a verifier key for a specific operation/version

**Description**: Union type representing the three types of contract maintenance operations.

**Usage**: Used in MaintenanceUpdate to specify contract upgrades.

**Related**: See MaintenanceUpdate, ReplaceAuthority, VerifierKeyInsert, VerifierKeyRemove classes

---

### TokenType

A token type (or color).

```typescript
type TokenType = string;
```

**Format**: Hex-encoded 35-byte string

**Description**: Uniquely identifies a token/currency type in the Zswap shielded pool. Often called "color" in the codebase.

**Usage**: Used throughout coin and transaction operations.

```typescript
import { nativeToken, tokenType, sampleTokenType } from '@midnight-ntwrk/ledger';

// Get native token type
const native: TokenType = nativeToken();

// Derive contract-specific token
const domainSep = new Uint8Array(32);
const contractToken: TokenType = tokenType(domainSep, contractAddress);

// Sample random token (testing)
const testToken: TokenType = sampleTokenType();
```

**Related**:
- Get native: `nativeToken()`
- Derive: `tokenType(domainSep, contract)`
- Sample: `sampleTokenType()`
- Used in: CoinInfo, QualifiedCoinInfo

---

### TransactionHash

The hash of a transaction.

```typescript
type TransactionHash = string;
```

**Format**: Hex-encoded 256-bit bytestring

**Description**: Cryptographic hash uniquely identifying a transaction.

**Usage**: Used to reference and track transactions.

---

### TransactionId

A transaction identifier, used to index merged transactions.

```typescript
type TransactionId = string;
```

**Description**: Identifier for indexing transactions, especially in merged transaction scenarios.

**Usage**: Used internally for transaction tracking and retrieval.

---

### Transcript

A transcript of operations, to be recorded in a transaction.

```typescript
type Transcript<R> = {
  effects: Effects;
  gas: bigint;
  program: Op<R>[];
};
```

**Type Parameter**:
- `R`: `null` (gathering mode) or `AlignedValue` (verifying mode)

**Properties**:
- `effects`: The effects of the transcript (checked before execution, must match those constructed by program)
- `gas`: The execution budget for this transcript (program must not exceed)
- `program`: The sequence of operations that this transcript captured

**Description**: Represents a complete record of VM operations with their effects and gas cost. Used to package contract execution for inclusion in transactions.

**Usage**: Created by `partitionTranscripts()` and included in transactions.

**Related**: 
- Created by `partitionTranscripts()` function
- Contains `Op<R>[]` operations
- Includes `Effects` for verification

---

### Value

An onchain data value, in field-aligned binary format.

```typescript
type Value = Uint8Array[];
```

**Description**: Represents raw on-chain data as an array of byte arrays. The fundamental data representation in the VM.

**Usage**: Used throughout VM operations and state management.

**Related**: 
- Paired with Alignment in `AlignedValue`
- Converted to/from bigint with `bigIntToValue()` / `valueToBigInt()`
- Used in Fr (field element representation)

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
