# Minokawa Language Reference

**Official Documentation - Comprehensive Guide**  
**Language**: Minokawa (formerly Compact)  
**Current Version**: 0.18.0 (Compiler 0.26.0)  
**Source**: Midnight Network Official Documentation  
**Last Updated**: October 28, 2025

> 📚 **Complete language reference** - From official Midnight documentation

---

## Table of Contents

1. [Writing a Contract](#writing-a-contract)
2. [Compact Types](#compact-types)
3. [Circuits](#circuits)
4. [Statements](#statements)
5. [Expressions](#expressions)
6. [Ledger System](#ledger-system)
7. [Witnesses](#witnesses)
8. [Modules & Imports](#modules--imports)
9. [TypeScript Target](#typescript-target)

---

## Writing a Contract

Midnight smart contracts are written in **Minokawa** (formerly Compact). The compiler outputs zero-knowledge circuits that prove the correctness of ledger interactions.

### Basic Contract Structure

```compact
pragma language_version 0.16;  // Version 0.18 for latest

import CompactStandardLibrary;

// Custom types
enum State {
  UNSET,
  SET
}

// Ledger state (on-chain)
export ledger authority: Bytes<32>;
export ledger value: Uint<64>;
export ledger state: State;
export ledger round: Counter;

// Constructor (initialization)
constructor(sk: Bytes<32>, v: Uint<64>) {
  authority = disclose(publicKey(round, sk));
  value = disclose(v);
  state = State.SET;
}

// Helper circuits
circuit publicKey(round: Field, sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>(
    [pad(32, "midnight:examples:lock:pk"), round as Bytes<32>, sk]
  );
}

// Entry points (exported circuits)
export circuit get(): Uint<64> {
  assert(state == State.SET, "Attempted to get uninitialized value");
  return value;
}

// Witnesses (private state access)
witness secretKey(): Bytes<32>;

export circuit set(v: Uint<64>): [] {
  assert(state == State.UNSET, "Attempted to set initialized value");
  const sk = secretKey();
  const pk = publicKey(round, sk);
  authority = disclose(pk);
  value = disclose(v);
  state = State.SET;
}

export circuit clear(): [] {
  assert(state == State.SET, "Attempted to clear uninitialized value");
  const sk = secretKey();
  const pk = publicKey(round, sk);
  assert(authority == pk, "Attempted to clear without authorization");
  state = State.UNSET;
  round.increment(1);
}
```

### Three-Part Structure

1. **Ledger (Public)**: Replicated state on public blockchain
2. **Zero-Knowledge Circuit**: Proves correctness confidentially
3. **Local (Private)**: Off-chain, arbitrary code via witnesses

---

## Compact Types

Minokawa is **strongly statically typed** - every expression has a static type.

### Primitive Types

| Type | Description | Example |
|------|-------------|---------|
| `Boolean` | Boolean values | `true`, `false` |
| `Uint<m..n>` | Bounded unsigned integer (0 to n) | `Uint<0..255>` |
| `Uint<n>` | Sized unsigned integer (n bits) | `Uint<32>` |
| `Field` | Prime field element (ZK proving system) | `123 as Field` |
| `[T, ...]` | Tuple (heterogeneous) | `[true, 42, "test"]` |
| `Vector<n, T>` | Vector (homogeneous tuple) | `Vector<5, Field>` |
| `Bytes<n>` | Byte array of length n | `Bytes<32>` |
| `Opaque<s>` | Opaque values (tag s) | `Opaque<"string">` |

### User-Defined Types

#### Structures
```compact
struct Thing {
  triple: Vector<3, Field>,
  flag: Boolean,
}

struct NumberAnd<T> {
  num: Uint<32>;
  item: T
}

// Creating instances
const t1 = Thing {[0, 1, 2], true};
const t2 = NumberAnd<Uint<8>> { item: 255, num: 0 };
```

#### Enumerations
```compact
enum Fruit { apple, pear, plum }

// Usage
const f = Fruit.apple;
```

#### Generic Structures
```compact
struct Pair<T, U> {
  first: T;
  second: U;
}

const p = Pair<Field, Boolean> { first: 42, second: true };
```

### Subtyping

- `Uint<0..n>` is subtype of `Uint<0..m>` if n ≤ m
- `Uint<0..n>` is subtype of `Field`
- `[T, ...]` is subtype of `[S, ...]` if each T is subtype of S
- Can implicitly use subtype where supertype expected

### Default Values

Every type has a default value:
```compact
default<Boolean>        // false
default<Uint<32>>       // 0
default<Field>          // 0
default<Bytes<32>>      // 32 zero bytes
default<[T1, T2]>       // tuple of defaults
default<MyStruct>       // struct with default fields
```

---

## Circuits

**Circuits** are the basic operational element - like functions but compiled to zero-knowledge circuits.

### Circuit Declaration
```compact
circuit c(a: A, b: B): R {
  // Fixed computational bounds at compile time
  return result;
}

// Generic circuit
circuit id<T>(value: T): T {
  return value;
}
```

### Pure vs Impure Circuits

**Pure Circuit**: Computes outputs from inputs only (no ledger/witness access)
```compact
export pure circuit add(x: Field, y: Field): Field {
  return x + y;
}
```

**Impure Circuit**: Accesses ledger or witnesses
```compact
export circuit store(value: Field): [] {
  ledgerField = value;  // Ledger access = impure
}
```

### Anonymous Circuits
```compact
const doubled = map((x) => x * 2, numbers);

const sum = fold((acc, x) => acc + x, 0, numbers);
```

---

## Statements

### For Loop
```compact
// Iterate over vector
for (const i of vector) {
  // statement
}

// Iterate over range
for (const i of 0..10) {
  // statement
}
```

### If Statement
```compact
if (condition) {
  // statement
}

if (condition) {
  // statement  
} else {
  // statement
}
```

### Return Statement
```compact
return;           // For return type []
return expr;      // For other return types
```

### Assert Statement
```compact
assert(condition, "Error message");
```

**Checked at runtime AND constrained in-circuit!**

### Const Binding
```compact
const x = expr;
const x: Type = expr;
const x = expr1, y = expr2;

// Shadowing allowed in nested blocks
{
  const answer = 42;
  {
    const answer = 12;  // Shadows outer
  }
}
```

---

## Expressions

### Literals

**Boolean**: `true`, `false`

**Numeric**: `0`, `123`, `4294967295`
- Type: `Uint<0..n>` where n is the literal value

**String**: `"hello"`, `'world'`, `"escaped\ntext"`
- Type: `Bytes<n>` where n is UTF-8 encoded length

**Padded String**: `pad(32, "short")`
- Type: `Bytes<32>` - pads with zeros

**Hex/Octal/Binary** (v0.18+):
```compact
0xFF        // 255 (hex)
0o77        // 63 (octal)
0b1010      // 10 (binary)
```

### Tuple Creation
```compact
const t = [1, 2, 3];
const mixed = [true, 42, "text"];
const empty = [];
```

### Structure Creation
```compact
struct S { a: Uint<32>, b: Boolean }

// Positional
const s1 = S { 42, true };

// Named
const s2 = S { b: false, a: 10 };

// Spread
const s3 = S { ...s1, b: false };
```

### Type Casts
```compact
value as TargetType

// Examples
42 as Field
fieldValue as Uint<32>
bytes32 as Vector<32, Uint<8>>
```

### Arithmetic
```compact
a + b   // Add
a - b   // Subtract  
a * b   // Multiply
```

**Type Rules**:
- If either is `Field`, result is `Field`
- `Uint<0..m> + Uint<0..n>` → `Uint<0..m+n>`
- `Uint<0..m> - Uint<0..n>` → `Uint<0..m>` (runtime check)
- `Uint<0..m> * Uint<0..n>` → `Uint<0..m*n>`

### Comparisons
```compact
a == b   // Equal
a != b   // Not equal
a < b    // Less than (Uint only)
a > b    // Greater than (Uint only)
a <= b   // Less than or equal (Uint only)
a >= b   // Greater than or equal (Uint only)
```

### Logical Operators (Short-Circuit)
```compact
a || b   // Or
a && b   // And
!a       // Not
```

### Conditional
```compact
condition ? trueExpr : falseExpr
```

### Map and Fold
```compact
// Map over vector
const doubled = map((x) => x * 2, numbers);

// Fold (reduce) over vector
const sum = fold((acc, x) => acc + x, 0, numbers);
```

### Tuple/Vector Access
```compact
const first = tuple[0];
const second = tuple[1];
```

### Struct Member Access
```compact
const x = myStruct.fieldName;
```

---

## Ledger System

The ledger stores **public state** on-chain.

### Ledger Declarations
```compact
ledger value: Field;
export ledger publicData: Uint<64>;
sealed ledger constant: Field;
```

**Modifiers**:
- `export`: Visible outside contract
- `sealed`: Can only be set in constructor

### Ledger State Types

| Type | Description |
|------|-------------|
| `T` | Any Compact type (becomes `Cell<T>`) |
| `Counter` | Incrementable counter |
| `Set<T>` | Set of values |
| `Map<K, V>` | Key-value mapping |
| `List<T>` | Ordered list |
| `MerkleTree<n, T>` | Merkle tree (n = depth 1-32) |
| `HistoricMerkleTree<n, T>` | Historic Merkle tree |

### Cell Operations
```compact
ledger myValue: Field;

// Read (syntactic sugar)
const v = myValue;           // Same as myValue.read()

// Write (syntactic sugar)
myValue = 42;                // Same as myValue.write(42)

// Explicit operations
myValue.reset_to_default();
```

### Counter Operations
```compact
ledger counter: Counter;

// Read
const c = counter;           // Same as counter.read()

// Increment/Decrement
counter += 5;                // Same as counter.increment(5)
counter -= 2;                // Same as counter.decrement(2)
```

### Map Operations
```compact
ledger myMap: Map<Bytes<32>, Field>;

// Check membership
if (myMap.member(disclose(key))) {
  // key exists
}

// Lookup value
const value = myMap.lookup(disclose(key));

// Insert/update
myMap.insert(disclose(key), value);
```

### Nested Maps
```compact
ledger nested: Map<Boolean, Map<Field, Counter>>;

// Initialize outer
nested.insert(true, default<Map<Field, Counter>>);

// Initialize inner
nested.lookup(true).insert(42, default<Counter>);

// Use nested
nested.lookup(true).lookup(42).increment(1);
const val = nested.lookup(true).lookup(42);
```

---

## Witnesses

**Witnesses** access private/local state - implemented in TypeScript/JavaScript.

### Declaration
```compact
witness secretKey(): Bytes<32>;
witness getUserData(id: Field): MyStruct;
```

### Usage
```compact
export circuit doSomething(): [] {
  const sk = secretKey();     // Calls witness
  const pk = hash(sk);        // Use witness result
  assert(pk == authority, "Unauthorized");
}
```

### ⚠️ Security Warning

**Never trust witness results!** Any DApp can provide any implementation.

Witnesses provide **confidential** data, but circuits must **verify** it:
```compact
witness secretValue(): Field;

export circuit useSecret(): [] {
  const secret = secretValue();           // Confidential
  const hash = persistentHash(secret);    // Computed in-circuit
  assert(hash == storedHash, "Invalid");  // Verified!
}
```

---

## Modules & Imports

### Defining Modules
```compact
module Utilities {
  export circuit helper(x: Field): Field {
    return x * 2;
  }
  
  circuit internal(x: Field): Field {
    return x + 1;  // Not exported
  }
}
```

### Importing Modules
```compact
import Utilities;
// helper is now in scope

import Utilities prefix Utils_;
// Utils_helper is now in scope
```

### Generic Modules
```compact
module Identity<T> {
  export circuit id(x: T): T {
    return x;
  }
}

import Identity<Field>;
// id is now in scope with Field as T
```

### Include Files
```compact
include "path/to/file";
// Includes file.compact verbatim
```

### Standard Library
```compact
import CompactStandardLibrary;
```

**Provides**:
- Hash functions: `transientHash`, `persistentHash`
- Commitment schemes: `transientCommit`, `persistentCommit`
- Ledger ADTs: `Counter`, `Map`, `List`, `MerkleTree`
- Utilities: `pad`, etc.

---

## Privacy & Confidentiality

### What's Confidential?

✅ **Confidential** (kept private):
- Data NOT in ledger fields
- Data NOT in circuit arguments/returns
- Witness outputs

✅ **Enforced** (proven correct):
- All computation NOT in witnesses

### Example: Secret Keys
```compact
witness secretKey(): Bytes<32>;

circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash(sk);  // Hash is public, sk is private!
}

export circuit authenticate(): [] {
  const sk = secretKey();           // Private!
  const pk = publicKey(sk);         // Public!
  assert(authority == pk, "Fail");  // Verification in-circuit!
}
```

### Commitment Schemes

**Hash** arbitrary data with random nonce:
```compact
const nonce: Bytes<32> = randomNonce();
const commitment = persistentCommit(secretData, nonce);

// Store commitment publicly
ledgerCommitment = disclose(commitment);

// Later, open commitment
assert(ledgerCommitment == persistentCommit(revealedData, revealedNonce));
```

### Standard Library Hash Functions
```compact
// For non-persisted values
circuit transientHash<T>(value: T): Field;
circuit transientCommit<T>(value: T, rand: Field): Field;

// For ledger state
circuit persistentHash<T>(value: T): Bytes<32>;
circuit persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>;
```

---

## Constructor

Initialize contract state:
```compact
ledger owner: ContractAddress;
ledger initialized: Boolean;

constructor(ownerAddr: ContractAddress) {
  owner = disclose(ownerAddr);
  initialized = true;
}
```

**Rules**:
- At most one constructor per contract
- Must be at top level (not in modules)
- Can call exported module circuits for initialization
- Only place to set `sealed` ledger fields

---

## TypeScript Target

### Compilation Output

Compact compiler generates:
- `index.cjs` - JavaScript implementation
- `index.d.cts` - TypeScript type declarations
- `keys/` - ZK prover/verifier key pairs
- `zkir/` - Proof generation instructions

### Exported TypeScript Types

```typescript
// User-defined types
export type MyStruct = {
  field1: bigint;
  field2: boolean;
};

// Witnesses interface
export type Witnesses<T> = {
  secretKey: (ctx: WitnessContext<Ledger, T>) => [T, Uint8Array];
};

// Pure circuits (no ledger/witness access)
export type PureCircuits = {
  helper: (x: bigint) => bigint;
};

// Impure circuits (ledger/witness access)
export type ImpureCircuits<T> = {
  store: (ctx: CircuitContext<T>, value: bigint) => CircuitResults<T, []>;
};

// Contract class
export class Contract<T, W extends Witnesses<T>> {
  constructor(witnesses: W);
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  initialState(privateState: T): [T, ContractState];
}

// Ledger accessor
export type Ledger = {
  myValue: bigint;
  myCounter: bigint;
};

export function ledger(state: StateValue): Ledger;
```

### TypeScript Representations

| Minokawa Type | TypeScript Type |
|---------------|-----------------|
| `Boolean` | `boolean` |
| `Field` | `bigint` (with bounds checks) |
| `Uint<n>` | `bigint` (with bounds checks) |
| `[T, U]` | `[T, U]` or `T[]` |
| `Bytes<n>` | `Uint8Array` (with length check) |
| `Opaque<"string">` | `string` |
| `Opaque<"Uint8Array">` | `Uint8Array` |
| `struct` | `{ field: type }` object |
| `enum` | `number` (with membership check) |

---

## Best Practices

### 1. Use `disclose()` for Public Parameters
```compact
export circuit store(publicValue: Field): [] {
  ledgerValue = disclose(publicValue);  // Mark as intentionally public
}
```

### 2. Verify Witness Data
```compact
witness untrustedInput(): Field;

export circuit process(): [] {
  const input = untrustedInput();
  // ALWAYS verify!
  assert(input < 1000, "Invalid input");
}
```

### 3. Use Sealed Fields for Constants
```compact
sealed ledger CONTRACT_VERSION: Uint<16>;

constructor() {
  CONTRACT_VERSION = 1;  // Can only set here
}
```

### 4. Explicit Type Annotations for Clarity
```compact
const value: Uint<64> = counter.read();
```

### 5. Use Counter for Incrementing Values
```compact
ledger count: Counter;  // Better than ledger count: Uint<64>

count += 1;  // Efficient increment
```

---

## Common Patterns

### Access Control
```compact
ledger owner: ContractAddress;

circuit assertOwner(caller: ContractAddress): [] {
  assert(caller == owner, "Not owner");
}

export circuit adminFunction(caller: ContractAddress): [] {
  assertOwner(caller);
  // Admin logic
}
```

### Commitment-Reveal
```compact
ledger commitments: Map<Bytes<32>, Bytes<32>>;

export circuit commit(id: Bytes<32>, commitment: Bytes<32>): [] {
  commitments.insert(disclose(id), disclose(commitment));
}

witness revealNonce(): Bytes<32>;

export circuit reveal(id: Bytes<32>, value: Field): [] {
  const nonce = revealNonce();
  const commitment = persistentCommit(value, nonce);
  assert(commitments.lookup(disclose(id)) == commitment, "Invalid");
}
```

### State Machine
```compact
enum State { Init, Active, Closed }
ledger state: State;

export circuit activate(): [] {
  assert(state == State.Init, "Wrong state");
  state = State.Active;
}
```

---

## References

- **Formal Grammar**: https://docs.midnight.network/
- **Ledger Data Types**: API Reference
- **Standard Library**: CompactStandardLibrary documentation
- **Migration Guide**: See MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md

---

**Status**: ✅ Complete language reference from official documentation  
**Version**: Minokawa 0.18.0 / Compact 0.26.0  
**Last Updated**: October 28, 2025
