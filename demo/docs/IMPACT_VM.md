# The Impact VM

**Midnight's On-Chain Virtual Machine**  
**Network**: Testnet_02  
**Status**: 🚧 Under active revision  
**Updated**: October 28, 2025

> ⚙️ **Understanding Midnight's on-chain state manipulation language**

---

## ⚠️ Important Notice

**Impact is still under active revision.**

**Expect changes**:
- Attributes may change
- Storage-related costs subject to revision
- Feature additions/modifications

**Current limitation**: Users cannot write Impact manually (may be added in future)

---

## What is Impact?

**Impact** is Midnight's **on-chain VM language**.

**Purpose**: On-chain parts of programs are written in Impact

**For developers**: You should **not need to worry** about Impact details when writing contracts

**Where you'll see it**: 
- Inspecting transactions
- Contract outputs
- Transaction transcripts

---

## Language Characteristics

### Stack-Based

**Operations work on a stack**:
```
Top of stack
  ↓
[item3]
[item2]
[item1]
  ↓
Bottom of stack
```

**Stack operations**:
- Push values onto stack
- Pop values from stack
- Manipulate stack items

---

### Non-Turing-Complete

**Why non-Turing-complete?**
- ✅ Guaranteed termination
- ✅ Predictable costs
- ✅ No infinite loops
- ✅ Bounded execution time

**Properties**:
- No operations can decrease program counter
- Every operation is bounded in time
- Linear program execution

---

### State Manipulation

**Purpose**: Manipulate contract state

**Execution context**: Stack containing three things:

```
┌─────────────────────────────────────────┐
│  1. CONTEXT Object                      │
│  • Transaction-related context          │
│  • Contract address, block time, etc.   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. EFFECTS Object                      │
│  • Actions performed during execution   │
│  • Coin claims, contract calls, etc.    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. CONTRACT STATE                      │
│  • Current ledger state                 │
│  • Maps, arrays, Merkle trees           │
└─────────────────────────────────────────┘
```

---

## Execution Model

### Gas Limits

**Attached cost**: Program execution has attached cost

**Gas bound**: May be bounded by gas limit

**Purpose**: Prevent excessive computation

---

### Execution Outcomes

**Two possibilities**:

1. **Abort**
   - Invalidates this part of transaction
   - Effects not applied
   - Fees may still be charged

2. **Success**
   - Stack must be in same shape as started
   - Effects must match declared effects
   - Contract state must be storable
   - State adopted as updated state

---

## Transcripts

### What is a Transcript?

**Execution transcript** consists of:

```
┌─────────────────────────────────────────┐
│  1. Declared Gas Bound                  │
│  • Used to derive fees for this call    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Declared Effects Object             │
│  • Binds contract semantics             │
│  • Must match actual effects            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Program to Execute                  │
│  • Sequence of Impact operations        │
└─────────────────────────────────────────┘
```

---

## State Values

The Impact stack operates on these state values:

### 1. Null

```
null
```

**Purpose**: Empty/missing value

---

### 2. Cell

```
<x: y>
```

**Description**: Field-aligned binary cell

**Contains**: Binary data with field alignment

---

### 3. Map

```
Map { k1: v1, k2: v2, ... }
```

**Description**: Map from field-aligned binary keys to state values

**Operations**: Insert, lookup, remove

---

### 4. Array

```
Array(n) [ v0, v1, ... ]
```

**Constraints**: 0 < n < 16

**Description**: Fixed-size array of state values

---

### 5. MerkleTree

```
MerkleTree(d) { k0: v1, k2: v2, ... }
```

**Constraints**: 1 <= d <= 32 (depth)

**Description**: Sparse, fixed-depth Merkle tree

**Slots**: k0, k2, ... containing leaf hashes v1, v2, ...

**Representation**: Typically hex strings

---

## Field-Aligned Binary (FAB)

### What is FAB?

**Purpose**: Store complex data structures in binary while maintaining field element encoding capability

**Use**: Basic data type in Impact

---

### Structure

**Aligned value** = Sequence of aligned atoms

**Aligned atom** = Byte string + alignment atom

---

### Alignment Types

**Three alignment atom types**:

1. **`f` - Field alignment**
   - Interpreted as little-endian field element
   - Direct field representation

2. **`c` - Compression alignment**
   - Interpreted as field element from hash
   - Hash-derived value

3. **`bn` - n-byte alignment**
   - Sequence of field elements
   - Compactly encodes n bytes
   - Depends on prime field and curve

---

## Programs

### Structure

**Program** = Sequence of operations

**Operation** = Opcode + (optional) arguments

---

### Execution Modes

**Two modes**:

1. **Evaluating Mode**
   - Results gathered
   - Normal execution

2. **Verifying Mode**
   - `popeq[c]` arguments enforced for equality
   - Validation execution

---

### Stack Effects

**Notation**: `-{a, b} +{c, d}`

**Meaning**:
- Consumes: `a`, `b` (top of stack, a above b)
- Produces: `c`, `d` (d above c)

**Immutability**: Values cannot be changed, only replaced with modified versions

---

### Value Markers

**Stack value markers**:

- `'a` - Weak value (in-memory only, not written to disk)
- `"a` - May be weak value (input)
- `†a` - Weak if input was weak (conditional)

---

## Operation Reference

### Basic Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **noop** | 00 | -{} +{} | Do nothing (with cost n) |
| **pop** | 0b | -{'a} +{} | Remove a from stack |
| **push** | 10 | -{} +{'a} | Push value a onto stack |
| **pushs** | 11 | -{} +{a} | Push strong value a |

---

### Comparison Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **lt** | 01 | -{'a, 'b} +{c} | [c] := [a] < [b] |
| **eq** | 02 | -{'a, 'b} +{c} | [c] := [a] == [b] |

---

### Type Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **type** | 03 | -{'a} +{b} | [b] := typeof(a) |
| **size** | 04 | -{'a} +{b} | [b] := size(a) |
| **new** | 05 | -{'a} +{b} | [b] := new [a] |

---

### Logical Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **and** | 06 | -{'a, 'b} +{c} | [c] := [a] & [b] |
| **or** | 07 | -{'a, 'b} +{c} | [c] := [a] \| [b] |
| **neg** | 08 | -{'a} +{b} | [b] := ![a] |

---

### Arithmetic Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **add** | 14 | -{'a, 'b} +{c} | [c] := [a] + [b] |
| **sub** | 15 | -{'a, 'b} +{c} | [c] := [b] - [a] |
| **addi** | 0e | -{'a} +{b} | [b] := [a] + c (immediate) |
| **subi** | 0f | -{'a} +{b} | [b] := [a] - c (immediate) |

---

### String Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **concat** | 16 | -{'a, 'b} +{c} | [c] := [b] ++ [a] |
| **concatc** | 17 | -{'a, 'b} +{c} | Concat (cached only) |

---

### Collection Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **member** | 18 | -{'a, 'b} +{c} | [c] := has_key(b, a) |
| **rem** | 19 | -{a, "b} +{"c} | c := rem(b, a, false) |
| **remc** | 1a | -{a, "b} +{"c} | c := rem(b, a, true) |

---

### Stack Manipulation

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **dup** | 3n | -{x*, "a} +{"a, x*, "a} | Duplicate a (n items between) |
| **swap** | 4n | -{"a, x*, †b} +{†b, x*, "a} | Swap items (n items between) |

---

### Indexing Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **idx** | 5n | -{k*, "a} +{"b} | Index with path |
| **idxc** | 6n | -{k*, "a} +{"b} | Index (cached) |
| **idxp** | 7n | -{k*, "a} +{"b, pth*} | Index + return path |
| **idxpc** | 8n | -{k*, "a} +{"b, pth*} | Index + path (cached) |

---

### Insertion Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **ins** | 9n | -{"a, pth*} +{†b} | Insert value |
| **insc** | an | -{"a, pth*} +{†b} | Insert (cached) |

---

### Control Flow

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **branch** | 12 | -{'a} +{} | Skip n ops if a non-empty |
| **jmp** | 13 | -{} +{} | Skip n operations |
| **ckpt** | ff | -{} +{} | Checkpoint (atomic boundary) |

---

### Special Operations

| Name | Opcode | Stack | Description |
|------|--------|-------|-------------|
| **log** | 09 | -{'a} +{} | Output a as event |
| **root** | 0a | -{'a} +{b} | [b] := root(a) |
| **popeq** | 0c | -{'a} +{} | Pop & verify equal (verify mode) |
| **popeqc** | 0d | -{'a} +{} | Pop & verify equal (cached) |

---

## Helper Functions

### typeof(a)

Returns type tag:
- `<a: b>`: 0
- `null`: 1
- `Map { ... }`: 2
- `Array(n) { ... }`: 3 + n × 32
- `MerkleTree(n) { ... }`: 4 + n × 32

---

### size(a)

Returns:
- Map: Number of non-null entries
- Array(n): n
- MerkleTree(n): n

---

### new ty

Creates new instance:
- Cell: Empty value
- null: null
- Map: Empty map
- Array(n): Array of n nulls
- MerkleTree(n): Blank Merkle tree

---

### has_key(a, b)

Returns true if b is key to non-null value in Map a

---

### get/rem/ins

**get(a, b, cached)**: Retrieve sub-item
**rem(a, b, cached)**: Remove sub-item
**ins(a, b, cached, c)**: Insert sub-item

**cached parameter**: If true and data not in memory, operation fails

---

## Context and Effects

### Context Object

**Array with entries** (in order):

```
Context = Array(_) [
  0: Contract address (Cell, 256-bit)
  1: Coin allocations (Map: CoinCommitment → Merkle tree index)
  2: Block time (Cell, 64-bit, seconds since Unix epoch)
  3: Block time tolerance (Cell, 32-bit, max divergence)
  4: Block hash (Cell, 256-bit)
]
```

⚠️ **Currently**: Only first two correctly initialized!

**May be extended** in future minor versions

---

### Effects Object

**Array with entries** (in order):

```
Effects = Array(_) [
  0: Claimed nullifiers (Map: Nullifier → null)
  1: Received coins (Map: CoinCommitment → null)
  2: Spent coins (Map: CoinCommitment → null)
  3: Contract calls (Map: (Address, Bytes(32), Field) → null)
  4: Minted coins (Map: Bytes(32) → u64)
]
```

**Initialized to**: `[{}, {}, {}, {}, {}]`

**May be extended** in future minor versions

---

### Weak Values

**Both context and effects** are flagged as **weak**

**Purpose**: Prevent cheap copying into contract state

**Rule**: If final state is tainted (weak), transaction fails

**Prevents**: Copying context/effects into contract state with just two opcodes

---

## Transaction Semantics

### Ledger State

**Midnight's ledger** consists of:

1. **Zswap's state**
   - Merkle tree of coin commitments
   - Index to first free slot
   - Set of nullifiers
   - Set of valid past Merkle tree roots

2. **Contract states**
   - Map from contract addresses to states

---

### Contract State

**A contract state** consists of:

1. **Impact state value**
   - Current ledger data

2. **Map of entry points**
   - Entry point name → Operation
   - Corresponds to exported circuits

3. **Contract operation**
   - SNARK verifier key
   - Used to validate contract calls

---

## Transaction Execution Phases

### Three Phases

```
1. WELL-FORMEDNESS CHECK
   ↓
2. GUARANTEED PHASE
   ↓
3. FALLIBLE PHASE
```

---

### Phase 1: Well-Formedness Check

**Run without state**

**Checks**:
- ✅ Transaction in canonical format
- ✅ All ZK proofs in Zswap offers verify
- ✅ Schnorr proof in contract section verifies
- ✅ Guaranteed offer balanced (after fee deduction + mints)
- ✅ Fallible offer balanced (after mints)
- ✅ Contract-owned inputs/outputs claimed correctly
- ✅ Outputs claimed correctly
- ✅ Contract calls claimed correctly
- ✅ Fallible section starts with ckpt if both guaranteed and fallible

**Failure**: Transaction rejected before inclusion

---

### Phase 2: Guaranteed Phase

**Additional work**:
- Load contract operations
- Verify ZK proofs against verifier keys
- Apply fallible Zswap section (to ensure it can't invalidate fallible phase)

**Then**:
- Apply Zswap offer
- Insert commitments into Merkle tree
- Add nullifiers to set (abort if duplicate)
- Check Merkle roots are valid past roots
- Update past roots set
- Execute each contract call's guaranteed transcript

**Failure**: Transaction not included in ledger

---

### Phase 3: Fallible Phase

**Similar to guaranteed**, but:
- Only fallible transcripts executed
- Failure doesn't prevent guaranteed effects
- Transaction recorded as partial success

**Fees**: Collected in guaranteed phase, forfeited if fallible fails

---

### Contract Call Execution

**For each contract call**:

1. Load contract's current state
2. Set up context from transaction
3. Execute Impact program:
   - Against context
   - Empty effects set
   - Transcript program
   - Declared gas limit
   - In verification mode
4. Test resulting effects equal declared effects
5. Store resulting state (if "strong")

---

## Cost Model

**Each operation has a cost**

**Cost scaling**: TBD (to be determined)

**Gas limit**: Bounds total cost

**Fee derivation**: From declared gas bound

---

## Security Properties

### Non-Turing-Complete

**Guarantees**:
- ✅ All programs terminate
- ✅ Predictable costs
- ✅ No infinite loops
- ✅ Bounded execution time

---

### Weak Values

**Protection**: Prevents cheap state copying

**Enforcement**: Transaction fails if final state is weak

---

### Stack Shape

**Requirement**: Stack must end in same shape as started

**Purpose**: Ensures consistent execution model

---

## Practical Implications

### For Contract Authors

**You don't write Impact directly**
- Minokawa compiles to Impact
- Compiler handles details
- You write high-level code

**When you see Impact**:
- Transaction inspection
- Debugging
- Understanding costs

---

### For Transaction Analysis

**Impact transcripts show**:
- Exact operations performed
- Gas costs
- State changes
- Effects declared

---

## Future Development

### Potential Features

🚧 **Manual Impact writing**
- May be added in future
- Advanced use cases
- Fine-grained control

🚧 **Cost optimization**
- Storage costs subject to revision
- Operation costs may change
- Performance improvements

🚧 **Extended context/effects**
- May add new fields
- Minor version increments
- Backward compatible

---

## Summary

### Impact is:

✅ **Stack-based** - Operations on stack  
✅ **Non-Turing-complete** - Guaranteed termination  
✅ **State manipulation** - Contract state updates  
✅ **Gas-bounded** - Predictable costs  
✅ **Compiled from Minokawa** - Not hand-written  

### Key Components:

**State values**: null, Cell, Map, Array, MerkleTree  
**Operations**: 40+ opcodes for manipulation  
**Execution**: Context + Effects + State  
**Phases**: Well-formedness → Guaranteed → Fallible  

---

## Related Documentation

- **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction phases
- **[SMART_CONTRACTS_ON_MIDNIGHT.md](SMART_CONTRACTS_ON_MIDNIGHT.md)** - How contracts work
- **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - High-level language

---

**Status**: ✅ Complete Impact VM Reference  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025
