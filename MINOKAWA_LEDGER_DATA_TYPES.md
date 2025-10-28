# Minokawa Ledger Data Types API Reference

**Official API Reference**  
**Compact Language Version**: 0.18.0  
**Compiler Version**: 0.26.0  
**Source**: Midnight Network Official Documentation  
**Updated**: October 28, 2025

> 📚 **Complete reference for all ledger ADT (Abstract Data Type) operations**

---

## Table of Contents

1. [Kernel](#kernel) - Built-in operations
2. [Cell<T>](#cellt) - Single value storage
3. [Counter](#counter) - Simple counter
4. [Set<T>](#sett) - Unbounded set
5. [Map<K,V>](#mapk-v) - Key-value mapping
6. [List<T>](#listt) - Unbounded list
7. [MerkleTree<n,T>](#merkletreen-t) - Bounded Merkle tree
8. [HistoricMerkleTree<n,T>](#historicmerkletreen-t) - Merkle tree with history

---

## Kernel

**Special ADT** defining various built-in operations. Valid only as a top-level ADT type.

### blockTimeGreaterThan
```compact
blockTimeGreaterThan(time: Uint<64>): Boolean
```

Checks whether the current block time (measured in seconds since the Unix epoch) is greater than the given amount.

**Example**:
```compact
if (kernel.blockTimeGreaterThan(deadline)) {
  // Time has passed
}
```

---

### blockTimeLessThan
```compact
blockTimeLessThan(time: Uint<64>): Boolean
```

Checks whether the current block time (measured in seconds since the Unix epoch) is less than the given amount.

**Example**:
```compact
if (kernel.blockTimeLessThan(deadline)) {
  // Still within time limit
}
```

---

### checkpoint
```compact
checkpoint(): []
```

Marks all execution up to this point as being a single atomic unit, allowing partial transaction failures to be split across it.

**Use Case**: Split complex transactions into atomic sections.

---

### claimContractCall
```compact
claimContractCall(addr: Bytes<32>, entry_point: Bytes<32>, comm: Field): []
```

Require the presence of another contract call in the containing transaction, with a match address, entry point hash, and communication commitment, that is not claimed by any other call.

**Use Case**: Cross-contract call coordination.

---

### claimZswapCoinReceive
```compact
claimZswapCoinReceive(note: Bytes<32>): []
```

Requires the presence of a commitment in the containing transaction and that no other call claims it as a receive.

**Use Case**: Receiving shielded coins.

---

### claimZswapCoinSpend
```compact
claimZswapCoinSpend(note: Bytes<32>): []
```

Requires the presence of a commitment in the containing transaction and that no other call claims it as a spend.

**Use Case**: Spending shielded coins.

---

### claimZswapNullifier
```compact
claimZswapNullifier(nul: Bytes<32>): []
```

Requires the presence of a nullifier in the containing transaction and that no other call claims it.

**Use Case**: Nullifier management in privacy protocols.

---

### mint
```compact
mint(domain_sep: Bytes<32>, amount: Uint<64>): []
```

Mints a given amount of shielded coins with a token type derived from the contract's address, and a given domain separator.

**Parameters**:
- `domain_sep`: Domain separator for token type derivation
- `amount`: Amount to mint

---

### self
```compact
self(): ContractAddress
```

Returns the current contract's address.

**Example**:
```compact
const myAddress = kernel.self();
```

**Note**: `ContractAddress` is defined in `CompactStandardLibrary`.

---

## Cell<T>

**Single Cell** containing a value of type `value_type`. Used implicitly when ledger field type is an ordinary Compact type.

**Note**: Programmers cannot write `Cell` explicitly when declaring ledger fields.

### read
```compact
read(): value_type
```

Returns the current contents of this Cell.

**TypeScript**: Available as a getter on the ledger field

**Syntactic Sugar**:
```compact
ledger myValue: Field;

// These are equivalent:
const v1 = myValue;           // Sugar
const v2 = myValue.read();    // Explicit
```

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Cell to the default value of its type.

**Example**:
```compact
ledger value: Uint<64>;

value.resetToDefault();  // value becomes 0
```

---

### write
```compact
write(value: value_type): []
```

Overwrites the content of this Cell with the given value.

**Syntactic Sugar**:
```compact
ledger myValue: Field;

// These are equivalent:
myValue = 42;              // Sugar
myValue.write(42);         // Explicit
```

---

### writeCoin
```compact
writeCoin(coin: CoinInfo, recipient: Either<ZswapCoinPublicKey, ContractAddress>): []
```

Writes a `CoinInfo` to this Cell, which is transformed into a `QualifiedCoinInfo` at runtime by looking up the relevant Merkle tree index. This index must have been allocated within the current transaction or this write fails.

**Available only for**: `QualifiedCoinInfo` value_type

**Types**: `CoinInfo`, `ContractAddress`, `Either`, and `ZswapCoinPublicKey` are defined in `CompactStandardLibrary`.

---

## Counter

**Simple counter** ADT for incrementable values.

### decrement
```compact
decrement(amount: Uint<16>): []
```

Decrements the counter by a given amount.

**⚠️ Runtime Error**: Decrementing below zero results in a run-time error.

**Syntactic Sugar**:
```compact
ledger counter: Counter;

// These are equivalent:
counter -= 5;                  // Sugar
counter.decrement(5);          // Explicit
```

---

### increment
```compact
increment(amount: Uint<16>): []
```

Increments the counter by the given amount.

**Syntactic Sugar**:
```compact
ledger counter: Counter;

// These are equivalent:
counter += 5;                  // Sugar
counter.increment(5);          // Explicit
```

---

### lessThan
```compact
lessThan(threshold: Uint<64>): Boolean
```

Returns if the counter is less than the given threshold value.

**Example**:
```compact
if (counter.lessThan(100)) {
  // Counter is below threshold
}
```

---

### read
```compact
read(): Uint<64>
```

Retrieves the current value of the counter.

**TypeScript**: Available as a getter on the ledger field

**Syntactic Sugar**:
```compact
ledger counter: Counter;

// These are equivalent:
const c1 = counter;            // Sugar
const c2 = counter.read();     // Explicit
```

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Counter to its default value of 0.

---

## Set<T>

**Unbounded set** of values of type `value_type`.

### insert
```compact
insert(elem: value_type): []
```

Updates this Set to include a given element.

**Example**:
```compact
ledger mySet: Set<Field>;

mySet.insert(42);
```

---

### insertCoin
```compact
insertCoin(coin: CoinInfo, recipient: Either<ZswapCoinPublicKey, ContractAddress>): []
```

Inserts a `CoinInfo` into this Set, which is transformed into a `QualifiedCoinInfo` at runtime by looking up the relevant Merkle tree index. This index must have been allocated within the current transaction or this insertion fails.

**Available only for**: `QualifiedCoinInfo` value_type

**Types**: `CoinInfo`, `ContractAddress`, `Either`, and `ZswapCoinPublicKey` are defined in `CompactStandardLibrary`.

---

### isEmpty
```compact
isEmpty(): Boolean
```

Returns whether this Set is the empty set.

**TypeScript**: `isEmpty(): boolean`

**Example**:
```compact
if (mySet.isEmpty()) {
  // Set has no elements
}
```

---

### member
```compact
member(elem: value_type): Boolean
```

Returns if an element is contained within this Set.

**TypeScript**: `member(elem: value_type): boolean`

**Example**:
```compact
if (mySet.member(42)) {
  // 42 is in the set
}
```

---

### remove
```compact
remove(elem: value_type): []
```

Update this Set to not include a given element.

**Example**:
```compact
mySet.remove(42);
```

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Set to the empty set.

---

### size
```compact
size(): Uint<64>
```

Returns the number of unique entries in this Set.

**TypeScript**: `size(): bigint`

**Example**:
```compact
const count = mySet.size();
```

---

### [Symbol.iterator]
**TypeScript only**

```typescript
[Symbol.iterator](): Iterator<value_type>
```

Iterates over the entries in this Set.

**Example (TypeScript)**:
```typescript
for (const elem of mySet) {
  console.log(elem);
}
```

---

## Map<K, V>

**Unbounded set of mappings** between values of type `key_type` and values of type `value_type`.

### insert
```compact
insert(key: key_type, value: value_type): []
```

Updates this Map to include a new value at a given key.

**Example**:
```compact
ledger myMap: Map<Bytes<32>, Field>;

myMap.insert(disclose(key), value);
```

---

### insertCoin
```compact
insertCoin(key: key_type, coin: CoinInfo, recipient: Either<ZswapCoinPublicKey, ContractAddress>): []
```

Inserts a `CoinInfo` into this Map at a given key, where the `CoinInfo` is transformed into a `QualifiedCoinInfo` at runtime by looking up the relevant Merkle tree index. This index must have been allocated within the current transaction or this insertion fails.

**Available only for**: `QualifiedCoinInfo` value_type

**Types**: `CoinInfo`, `ContractAddress`, `Either`, and `ZswapCoinPublicKey` are defined in `CompactStandardLibrary`.

---

### insertDefault
```compact
insertDefault(key: key_type): []
```

Updates this Map to include the value type's default value at a given key.

**Example**:
```compact
ledger myMap: Map<Field, Counter>;

myMap.insertDefault(42);  // Inserts default Counter (value 0)
```

---

### isEmpty
```compact
isEmpty(): Boolean
```

Returns if this Map is the empty map.

**TypeScript**: `isEmpty(): boolean`

---

### lookup
```compact
lookup(key: key_type): value_type
```

Looks up the value of a key within this Map. The returned value may be another ADT.

**TypeScript**: `lookup(key: key_type): value_type`

**Example**:
```compact
const value = myMap.lookup(disclose(key));

// For nested ADTs:
const nestedValue = myMap.lookup(key1).lookup(key2);
```

---

### member
```compact
member(key: key_type): Boolean
```

Returns if a key is contained within this Map.

**TypeScript**: `member(key: key_type): boolean`

**Example**:
```compact
if (myMap.member(disclose(key))) {
  // Key exists in map
}
```

---

### remove
```compact
remove(key: key_type): []
```

Updates this Map to not include a given key.

**Example**:
```compact
myMap.remove(disclose(key));
```

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Map to the empty map.

---

### size
```compact
size(): Uint<64>
```

Returns the number of entries in this Map.

**TypeScript**: `size(): bigint`

---

### [Symbol.iterator]
**TypeScript only**

```typescript
[Symbol.iterator](): Iterator<[key_type, value_type]>
```

Iterates over the key-value pairs contained in this Map.

**Example (TypeScript)**:
```typescript
for (const [key, value] of myMap) {
  console.log(key, value);
}
```

---

## List<T>

**Unbounded list** of values of type `value_type`.

### head
```compact
head(): Maybe<value_type>
```

Retrieves the head of this List, returning a `Maybe`, ensuring this call succeeds on the empty list.

**TypeScript**: `head(): Maybe<value_type>`

**Note**: `Maybe` is defined in `CompactStandardLibrary` (compact-runtime runtime.ts from TypeScript).

**Example**:
```compact
const maybeHead = myList.head();
// Check if value exists before using
```

---

### isEmpty
```compact
isEmpty(): Boolean
```

Returns if this List is the empty list.

**TypeScript**: `isEmpty(): boolean`

---

### length
```compact
length(): Uint<64>
```

Returns the number of elements contained in this List.

**TypeScript**: `length(): bigint`

---

### popFront
```compact
popFront(): []
```

Removes the first element from the front of this list.

**Example**:
```compact
myList.popFront();
```

---

### pushFront
```compact
pushFront(value: value_type): []
```

Pushes a new element onto the front of this list.

**Example**:
```compact
myList.pushFront(newValue);
```

---

### pushFrontCoin
```compact
pushFrontCoin(coin: CoinInfo, recipient: Either<ZswapCoinPublicKey, ContractAddress>): []
```

Pushes a `CoinInfo` onto the front of this List, where the `CoinInfo` is transformed into a `QualifiedCoinInfo` at runtime by looking up the relevant Merkle tree index. This index must have been allocated within the current transaction or this push fails.

**Available only for**: `QualifiedCoinInfo` value_type

**Types**: `CoinInfo`, `ContractAddress`, `Either`, and `ZswapCoinPublicKey` are defined in `CompactStandardLibrary`.

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this List to the empty list.

---

### [Symbol.iterator]
**TypeScript only**

```typescript
[Symbol.iterator](): Iterator<value_type>
```

Iterates over the entries in this List.

**Example (TypeScript)**:
```typescript
for (const item of myList) {
  console.log(item);
}
```

---

## MerkleTree<n, T>

**Bounded Merkle tree** of depth `nat` containing values of type `value_type`.

**Depth**: `1 < n <= 32`

### checkRoot
```compact
checkRoot(rt: MerkleTreeDigest): Boolean
```

Tests if the given Merkle tree root is the root for this Merkle tree.

**TypeScript**: `checkRoot(rt: MerkleTreeDigest): boolean`

**Note**: `MerkleTreeDigest` is defined in `CompactStandardLibrary` (compact-runtime runtime.ts from TypeScript).

---

### insert
```compact
insert(item: value_type): []
```

Inserts a new leaf at the first free index in this Merkle tree.

**Example**:
```compact
myTree.insert(newLeaf);
```

---

### insertHash
```compact
insertHash(hash: Bytes<32>): []
```

Inserts a new leaf with a given hash at the first free index in this Merkle tree.

---

### insertHashIndex
```compact
insertHashIndex(hash: Bytes<32>, index: Uint<64>): []
```

Inserts a new leaf with a given hash at a specific index in this Merkle tree.

---

### insertIndex
```compact
insertIndex(item: value_type, index: Uint<64>): []
```

Inserts a new leaf at a specific index in this Merkle tree.

---

### insertIndexDefault
```compact
insertIndexDefault(index: Uint<64>): []
```

Inserts a default value leaf at a specific index in this Merkle tree.

**Use Case**: This can be used to emulate a removal from the tree.

---

### isFull
```compact
isFull(): Boolean
```

Returns if this Merkle tree is full and further items cannot be directly inserted.

**TypeScript**: `isFull(): boolean`

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Merkle tree to the empty Merkle tree.

---

### findPathForLeaf
**TypeScript only**

```typescript
findPathForLeaf(leaf: value_type): MerkleTreePath<value_type> | undefined
```

Finds the path for a given leaf in a Merkle tree.

**⚠️ Performance Warning**: This is O(n) and should be avoided for large trees.

**Returns**: `undefined` if no such leaf exists.

**Note**: `MerkleTreePath` is defined in compact-runtime runtime.ts.

---

### firstFree
**TypeScript only**

```typescript
firstFree(): bigint
```

Retrieves the first (guaranteed) free index in the Merkle tree.

---

### pathForLeaf
**TypeScript only**

```typescript
pathForLeaf(index: bigint, leaf: value_type): MerkleTreePath<value_type>
```

Returns the Merkle path, given the knowledge that a specified leaf is at the given index.

**⚠️ Error**: It is an error to call this if this leaf is not contained at the given index.

**Note**: `MerkleTreePath` is defined in compact-runtime runtime.ts.

---

### root
**TypeScript only**

```typescript
root(): MerkleTreeDigest
```

Retrieves the root of the Merkle tree.

**Note**: `MerkleTreeDigest` is defined in compact-runtime runtime.ts.

---

## HistoricMerkleTree<n, T>

**Bounded Merkle tree** of depth `nat` containing values of type `value_type`, **with history**.

**Depth**: `1 < n <= 32`

### checkRoot
```compact
checkRoot(rt: MerkleTreeDigest): Boolean
```

Tests if the given Merkle tree root is **one of the past roots** for this Merkle tree.

**TypeScript**: `checkRoot(rt: MerkleTreeDigest): boolean`

**Note**: `MerkleTreeDigest` is defined in `CompactStandardLibrary` (compact-runtime runtime.ts from TypeScript).

**Difference from MerkleTree**: Checks **historical** roots, not just current root.

---

### insert
```compact
insert(item: value_type): []
```

Inserts a new leaf at the first free index in this Merkle tree.

---

### insertHash
```compact
insertHash(hash: Bytes<32>): []
```

Inserts a new leaf with a given hash at the first free index in this Merkle tree.

---

### insertHashIndex
```compact
insertHashIndex(hash: Bytes<32>, index: Uint<64>): []
```

Inserts a new leaf with a given hash at a specific index in this Merkle tree.

---

### insertIndex
```compact
insertIndex(item: value_type, index: Uint<64>): []
```

Inserts a new leaf at a specific index in this Merkle tree.

---

### insertIndexDefault
```compact
insertIndexDefault(index: Uint<64>): []
```

Inserts a default value leaf at a specific index in this Merkle tree.

**Use Case**: This can be used to emulate a removal from the tree.

---

### isFull
```compact
isFull(): Boolean
```

Returns if this Merkle tree is full and further items cannot be directly inserted.

**TypeScript**: `isFull(): boolean`

---

### resetHistory
```compact
resetHistory(): []
```

Resets the history for this Merkle tree, leaving only the current root valid.

**Use Case**: Manage history size when old roots no longer needed.

---

### resetToDefault
```compact
resetToDefault(): []
```

Resets this Merkle tree to the empty Merkle tree.

---

### findPathForLeaf
**TypeScript only**

```typescript
findPathForLeaf(leaf: value_type): MerkleTreePath<value_type> | undefined
```

Finds the path for a given leaf in a Merkle tree.

**⚠️ Performance Warning**: This is O(n) and should be avoided for large trees.

**Returns**: `undefined` if no such leaf exists.

**Note**: `MerkleTreePath` is defined in compact-runtime runtime.ts.

---

### firstFree
**TypeScript only**

```typescript
firstFree(): bigint
```

Retrieves the first (guaranteed) free index in the Merkle tree.

---

### history
**TypeScript only**

```typescript
history(): Iterator<MerkleTreeDigest>
```

An iterator over the roots that are considered valid past roots for this Merkle tree.

**Note**: `MerkleTreeDigest` is defined in compact-runtime runtime.ts.

**Example (TypeScript)**:
```typescript
for (const root of myTree.history()) {
  console.log(root);
}
```

---

### pathForLeaf
**TypeScript only**

```typescript
pathForLeaf(index: bigint, leaf: value_type): MerkleTreePath<value_type>
```

Returns the Merkle path, given the knowledge that a specified leaf is at the given index.

**⚠️ Error**: It is an error to call this if this leaf is not contained at the given index.

**Note**: `MerkleTreePath` is defined in compact-runtime runtime.ts.

---

### root
**TypeScript only**

```typescript
root(): MerkleTreeDigest
```

Retrieves the root of the Merkle tree.

**Note**: `MerkleTreeDigest` is defined in compact-runtime runtime.ts.

---

## Quick Reference Table

| ADT | Purpose | Key Operations |
|-----|---------|----------------|
| **Kernel** | Built-in ops | `self()`, `blockTimeGreaterThan()`, `mint()` |
| **Cell<T>** | Single value | `read()`, `write()`, `resetToDefault()` |
| **Counter** | Incrementable | `increment()`, `decrement()`, `read()` |
| **Set<T>** | Unique items | `insert()`, `member()`, `remove()`, `size()` |
| **Map<K,V>** | Key-value | `insert()`, `lookup()`, `member()`, `size()` |
| **List<T>** | Ordered list | `pushFront()`, `popFront()`, `head()`, `length()` |
| **MerkleTree<n,T>** | Bounded tree | `insert()`, `checkRoot()`, `isFull()` |
| **HistoricMerkleTree<n,T>** | Tree w/ history | `insert()`, `checkRoot()`, `resetHistory()` |

---

## Usage Examples

### Counter Pattern
```compact
ledger pageViews: Counter;

export circuit incrementViews(): [] {
  pageViews += 1;
}

export circuit getViews(): Uint<64> {
  return pageViews;
}
```

### Map Pattern
```compact
ledger balances: Map<Bytes<32>, Uint<64>>;

export circuit setBalance(user: Bytes<32>, amount: Uint<64>): [] {
  balances.insert(disclose(user), amount);
}

export circuit getBalance(user: Bytes<32>): Uint<64> {
  if (balances.member(disclose(user))) {
    return balances.lookup(disclose(user));
  }
  return 0;
}
```

### Merkle Tree Pattern
```compact
ledger commitments: MerkleTree<20, Bytes<32>>;

export circuit addCommitment(hash: Bytes<32>): [] {
  assert(!commitments.isFull(), "Tree is full");
  commitments.insertHash(hash);
}

export circuit verifyRoot(root: MerkleTreeDigest): Boolean {
  return commitments.checkRoot(root);
}
```

---

## Notes on TypeScript Integration

### Syntactic Sugar in Compact
Many operations have **syntactic sugar** in Compact:

| Operation | Explicit | Sugar |
|-----------|----------|-------|
| Cell read | `value.read()` | `value` |
| Cell write | `value.write(x)` | `value = x` |
| Counter read | `counter.read()` | `counter` |
| Counter increment | `counter.increment(n)` | `counter += n` |
| Counter decrement | `counter.decrement(n)` | `counter -= n` |

### TypeScript-Only Methods
Some operations are **only available in TypeScript**:
- `[Symbol.iterator]()` - for iteration
- `findPathForLeaf()` - O(n) search
- `firstFree()` - tree index
- `history()` - historic roots
- Getter properties

---

## Performance Considerations

### O(n) Operations ⚠️
- `MerkleTree.findPathForLeaf()` - Avoid for large trees
- `HistoricMerkleTree.findPathForLeaf()` - Avoid for large trees

### Recommended Alternatives
- Pre-compute and store indices
- Use `pathForLeaf(index, leaf)` when index is known

### Tree Depth Limits
- Merkle trees: `1 < n <= 32`
- Depth determines maximum capacity: 2^n leaves

---

**Status**: ✅ Complete Ledger ADT API Reference  
**Source**: docs.midnight.network  
**Version**: Compact 0.18.0 / Compiler 0.26.0  
**Last Updated**: October 28, 2025
