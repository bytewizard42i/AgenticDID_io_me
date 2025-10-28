# Compact Standard Library - Complete API Reference

**CompactStandardLibrary API**  
**Language**: Minokawa (Compact) 0.18.0  
**Compiler**: 0.26.0  
**Official Standard Library Documentation**  
**Updated**: October 28, 2025

> 📚 **Standard types and circuits for Minokawa programs**

---

## Table of Contents

1. [Common Data Types](#common-data-types)
2. [Coin Management Types](#coin-management-data-types)
3. [Common Functions](#common-functions)
4. [Hashing Functions](#hashing-functions)
5. [Elliptic Curve Functions](#elliptic-curve-functions)
6. [Merkle Tree Functions](#merkle-tree-functions)
7. [Coin Management Functions](#coin-management-functions)
8. [Block Time Functions](#block-time-functions)

---

## How to Import

```compact
import CompactStandardLibrary;
```

All functions and types are available after import.

---

## Common Data Types

### Maybe<T>

Optional value type - represents a value that may or may not be present.

**Type Definition**:
```compact
struct Maybe<T> {
  isSome: Boolean;
  value: T;
}
```

**Convention**: If `isSome` is `false`, `value` should be `default<T>`.

**Usage**:
```compact
const maybeValue: Maybe<Field> = some(42);
const noValue: Maybe<Field> = none();

// Manual construction
const manual = Maybe<Field> { isSome: true, value: 42 };
```

**See**: [`some()`](#some), [`none()`](#none)

---

### Either<A, B>

Disjoint union of A and B.

**Type Definition**:
```compact
struct Either<A, B> {
  isLeft: Boolean;
  left: A;
  right: B;
}
```

**Convention**: 
- If `isLeft` is `true`, `left` should be populated, `right` should be `default<B>`
- If `isLeft` is `false`, `right` should be populated, `left` should be `default<A>`

**Usage**:
```compact
const leftVal: Either<Field, Boolean> = left<Field, Boolean>(42);
const rightVal: Either<Field, Boolean> = right<Field, Boolean>(true);

// Manual construction
const manual = Either<Field, Boolean> { 
  isLeft: true, 
  left: 42, 
  right: default<Boolean> 
};
```

**Common Use Case**: `Either<ZswapCoinPublicKey, ContractAddress>` for recipients

**See**: [`left()`](#left), [`right()`](#right)

---

### CurvePoint

Point on an elliptic curve in affine coordinates.

**Type Definition**:
```compact
struct CurvePoint {
  x: Field;
  y: Field;
}
```

**Important**: Only outputs of elliptic curve operations are **guaranteed to lie on the curve**. Manually constructed `CurvePoint` values may not be valid curve points.

**Usage**:
```compact
const point: CurvePoint = ecMulGenerator(scalar);
const sum: CurvePoint = ecAdd(point1, point2);
```

**See**: [Elliptic Curve Functions](#elliptic-curve-functions)

---

### MerkleTreeDigest

Merkle tree root digest.

**Type Definition**:
```compact
struct MerkleTreeDigest {
  field: Field;
}
```

**Usage**:
```compact
ledger tree: MerkleTree<20, Field>;

// TypeScript only:
const root: MerkleTreeDigest = tree.root();

// In Compact:
const isValid = tree.checkRoot(expectedRoot);

// Manual construction
const digest = MerkleTreeDigest { field: rootValue };
```

**See**: [Merkle Tree Functions](#merkle-tree-functions)

---

### MerkleTreePathEntry

Single entry in a Merkle tree path.

**Type Definition**:
```compact
struct MerkleTreePathEntry {
  sibling: MerkleTreeDigest;
  goesLeft: Boolean;
}
```

**Fields**:
- `sibling`: Root hash of the sibling node
- `goesLeft`: Direction the path takes (true = left, false = right)

**Usage**: Primarily used internally in `MerkleTreePath`

---

### MerkleTreePath<n, T>

Complete path in a depth `n` Merkle tree, leading to a leaf of type `T`.

**Type Definition**:
```compact
struct MerkleTreePath<#n, T> {
  leaf: T;
  path: Vector<n, MerkleTreePathEntry>;
}
```

**Fields**:
- `leaf`: The leaf value being proven
- `path`: Vector of path entries from leaf to root

**Construction**: Use TypeScript functions from compiler output:
- `findPathForLeaf(leaf)` - O(n) search for leaf
- `pathForLeaf(index, leaf)` - Direct path construction

**Usage**:
```compact
// TypeScript constructs path, witness provides it
witness getMerklePath(): MerkleTreePath<20, Field>;

export circuit verifyMembership(): Boolean {
  const path = getMerklePath();
  const root = merkleTreePathRoot(path);
  return tree.checkRoot(root);
}
```

**See**: [`merkleTreePathRoot()`](#merkletreepathroot)

---

### ContractAddress

Address of a Midnight contract.

**Type Definition**:
```compact
struct ContractAddress {
  bytes: Bytes<32>;
}
```

**Usage**:
```compact
const myAddress: ContractAddress = kernel.self();

// As recipient in coin functions
const recipient: Either<ZswapCoinPublicKey, ContractAddress> = 
  right<ZswapCoinPublicKey, ContractAddress>(myAddress);
```

**Used In**:
- `send()`, `sendImmediate()` - as recipient
- `createZswapOutput()` - as recipient
- `mintToken()` - as recipient
- `tokenType()` - to specify contract

**See**: `kernel.self()` in Ledger Data Types

---

### ZswapCoinPublicKey

Public key for a Zswap coin (shielded transaction).

**Type Definition**:
```compact
struct ZswapCoinPublicKey {
  bytes: Bytes<32>;
}
```

**Usage**:
```compact
// Get current user's key
const myKey: ZswapCoinPublicKey = ownPublicKey();

// As recipient in coin functions
const recipient: Either<ZswapCoinPublicKey, ContractAddress> = 
  left<ZswapCoinPublicKey, ContractAddress>(myKey);
```

**Used In**:
- `send()`, `sendImmediate()` - as recipient
- `createZswapOutput()` - as recipient
- `mintToken()` - as recipient
- `ownPublicKey()` - returns this type

**See**: [Coin Management Functions](#coin-management-functions)

---

## Coin Management Data Types

### CoinInfo

Description of a newly created shielded coin.

**Type Definition**:
```compact
struct CoinInfo {
  nonce: Bytes<32>;
  color: Bytes<32>;
  value: Uint<128>;
}
```

**Fields**:
- `nonce`: Unique identifier (use `evolveNonce()` for deterministic generation)
- `color`: Token type (from `tokenType()` or `nativeToken()`)
- `value`: Amount of the coin

**Used For**:
- Outputting shielded coins
- Spending/receiving coins created in current transaction

**Used In**:
- `receive()` - Claim incoming coin
- `sendImmediate()` - Send from newly created coin
- `mergeCoin()`, `mergeCoinImmediate()` - Combine coins
- `createZswapOutput()` - Low-level output creation

**See**: `writeCoin()`, `insertCoin()`, `pushFrontCoin()` in Ledger Data Types

---

### QualifiedCoinInfo

Description of an existing shielded coin in the ledger, ready to be spent.

**Type Definition**:
```compact
struct QualifiedCoinInfo {
  nonce: Bytes<32>;
  color: Bytes<32>;
  value: Uint<128>;
  mtIndex: Uint<64>;
}
```

**Fields**:
- `nonce`, `color`, `value`: Same as `CoinInfo`
- `mtIndex`: Merkle tree index (assigned when coin added to ledger)

**Used For**:
- Spending coins that exist in the ledger

**Used In**:
- `send()` - Send from existing coin
- `mergeCoin()`, `mergeCoinImmediate()` - Combine coins
- `createZswapInput()` - Low-level input creation

**Storage**:
```compact
ledger myCoin: QualifiedCoinInfo;
ledger coins: List<QualifiedCoinInfo>;
```

**Note**: Created automatically when using `*Coin` ledger operations on `CoinInfo`

---

### SendResult

Result of sending coins.

**Type Definition**:
```compact
struct SendResult {
  change: Maybe<CoinInfo>;
  sent: CoinInfo;
}
```

**Fields**:
- `change`: Change from spending input (if any). `None` if exact amount.
- `sent`: The coin that was sent to recipient

**Usage**:
```compact
const result: SendResult = send(coin, recipient, amount);

// Handle change
if (result.change.isSome) {
  // Store change coin for later use
  changeCoin.writeCoin(result.change.value, kernel.self());
}
```

**Returned By**: `send()` and `sendImmediate()`

---

## Common Functions

### some

Create a `Maybe` value containing a value.

**Signature**:
```compact
circuit some<T>(value: T): Maybe<T>
```

**Example**:
```compact
const maybeField: Maybe<Field> = some(42);
const maybeString: Maybe<Bytes<32>> = some("value");
```

---

### none

Create an empty `Maybe` value.

**Signature**:
```compact
circuit none<T>(): Maybe<T>
```

**Example**:
```compact
const emptyField: Maybe<Field> = none<Field>();
```

---

### left

Create an `Either` with a left value.

**Signature**:
```compact
circuit left<L, R>(value: L): Either<L, R>
```

**Example**:
```compact
const result: Either<Field, Boolean> = left<Field, Boolean>(42);

// Common pattern: Public key as recipient
const recipient: Either<ZswapCoinPublicKey, ContractAddress> = 
  left<ZswapCoinPublicKey, ContractAddress>(pubKey);
```

---

### right

Create an `Either` with a right value.

**Signature**:
```compact
circuit right<L, R>(value: R): Either<L, R>
```

**Example**:
```compact
const result: Either<Field, Boolean> = right<Field, Boolean>(true);

// Common pattern: Contract address as recipient
const recipient: Either<ZswapCoinPublicKey, ContractAddress> = 
  right<ZswapCoinPublicKey, ContractAddress>(contractAddr);
```

---

## Hashing Functions

### transientHash

**Builtin transient hash compression function**

**Signature**:
```compact
circuit transientHash<T>(value: T): Field
```

**Returns**: Field value (hash digest)

**Properties**:
- Circuit-efficient compression function
- Arbitrary values → field elements
- **Not guaranteed to persist between upgrades**
- Should **NOT** be used to derive state data
- Can be used for consistency checks

**Implicit Disclosure**: ✅ Result is automatically disclosed (safe to store in ledger)

**⚠️ Important**: Although this returns a hash, it is **not considered sufficient** to protect input from disclosure. If input contains witness values, must use `disclose()` wrapper.

**Use Case**: Hash data for temporary consistency checks, not for ledger state

**Example**:
```compact
witness getSecret(): Field;

export circuit hashSecret(): Field {
  const secret = getSecret();
  // No disclose() needed - automatically safe
  return transientHash(secret);
}
```

---

### transientCommit

**Builtin transient commitment function**

**Signature**:
```compact
circuit transientCommit<T>(value: T, rand: Field): Field
```

**Parameters**:
- `value`: Data to commit to
- `rand`: Random field element (commitment opening)

**Returns**: Field value (commitment)

**Properties**:
- Circuit-efficient commitment function
- Arbitrary types → field elements
- **Not guaranteed to persist between upgrades**
- Should **NOT** be used to derive state data
- Can be used for consistency checks

**Implicit Disclosure**: ✅ Result is automatically disclosed

**✅ Privacy Protection**: Unlike `transientHash`, this **IS considered sufficient** to protect input from disclosure, assuming `rand` is sufficiently random. No `disclose()` wrapper needed even if input contains witness values.

**Use Case**: Commitment scheme for temporary values

**Example**:
```compact
witness getSecret(): Field;
witness getNonce(): Field;

export circuit commitSecret(): Field {
  const secret = getSecret();
  const nonce = getNonce();
  return transientCommit(secret, nonce);
}
```

---

### persistentHash

**Builtin persistent hash compression function**

**Signature**:
```compact
circuit persistentHash<T>(value: T): Bytes<32>
```

**Returns**: `Bytes<32>` (256-bit hash digest)

**Properties**:
- **Non-circuit-optimized** compression function
- Arbitrary values → 256-bit bytestring
- **Guaranteed to persist between upgrades**
- Consistently uses **SHA-256** compression algorithm
- **Should be used** to derive state data
- **Avoid for consistency checks** where not needed

**Implicit Disclosure**: ✅ Result is automatically disclosed (safe to store in ledger)

**⚠️ Important**: Although this returns a hash, it is **not considered sufficient** to protect input from disclosure. If input contains witness values, must use `disclose()` wrapper.

**Use Case**: Hash data for ledger state storage (persistent, guaranteed)

**Example**:
```compact
witness getUserId(): Bytes<32>;

ledger userHashes: Set<Bytes<32>>;

export circuit storeUserHash(): [] {
  const userId = getUserId();
  const hash = persistentHash(userId);
  // hash is auto-disclosed, safe to insert
  userHashes.insert(hash);
}
```

---

### persistentCommit

**Builtin persistent commitment function**

**Signature**:
```compact
circuit persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>
```

**Parameters**:
- `value`: Data to commit to (any Compact type)
- `rand`: Random 256-bit opening (commitment nonce)

**Returns**: `Bytes<32>` (256-bit commitment)

**Properties**:
- **Non-circuit-optimized** commitment function
- **Guaranteed to persist between upgrades**
- Uses **SHA-256** compression algorithm
- **Should be used** to derive state data
- **Avoid for consistency checks** where not needed

**Implicit Disclosure**: ✅ Result is automatically disclosed

**✅ Privacy Protection**: This **IS considered sufficient** to protect input from disclosure, assuming `rand` is sufficiently random. No `disclose()` wrapper needed even if input contains witness values.

**Use Case**: Commitment scheme for ledger state (persistent, guaranteed)

**Example**:
```compact
witness getSecret(): Field;
witness getNonce(): Bytes<32>;

ledger commitment: Bytes<32>;

export circuit commit(): [] {
  const secret = getSecret();
  const nonce = getNonce();
  commitment = persistentCommit(secret, nonce);
}
```

---

### degradeToTransient

Convert persistent hash to transient hash.

**Signature**:
```compact
circuit degradeToTransient(hash: Bytes<32>): Field
```

**Parameters**:
- `hash`: Persistent hash (`Bytes<32>`)

**Returns**: Transient hash (`Field`)

**Use Case**: Convert between hash representations

---

## Elliptic Curve Functions

### ecAdd

Add two elliptic curve points.

**Signature**:
```compact
circuit ecAdd(p1: CurvePoint, p2: CurvePoint): CurvePoint
```

**Parameters**:
- `p1`, `p2`: Points to add

**Returns**: Sum of the two points

**Example**:
```compact
const p1: CurvePoint = ecMulGenerator(5);
const p2: CurvePoint = ecMulGenerator(3);
const sum: CurvePoint = ecAdd(p1, p2);  // Represents 8*G
```

---

### ecMul

Multiply an elliptic curve point by a scalar.

**Signature**:
```compact
circuit ecMul(scalar: Field, point: CurvePoint): CurvePoint
```

**Parameters**:
- `scalar`: Multiplier
- `point`: Point to multiply

**Returns**: Scalar multiple of the point

**Example**:
```compact
const g: CurvePoint = ecMulGenerator(1);
const result: CurvePoint = ecMul(5, g);  // 5*G
```

---

### ecMulGenerator

Multiply the generator point by a scalar.

**Signature**:
```compact
circuit ecMulGenerator(scalar: Field): CurvePoint
```

**Parameters**:
- `scalar`: Multiplier

**Returns**: Scalar multiple of the generator point

**Use Case**: Generate public keys, curve points

**Example**:
```compact
witness getPrivateKey(): Field;

export circuit getPublicKey(): CurvePoint {
  const sk = getPrivateKey();
  return ecMulGenerator(sk);
}
```

---

### hashToCurve

Hash arbitrary data to an elliptic curve point.

**Signature**:
```compact
circuit hashToCurve<T>(value: T): CurvePoint
```

**Parameters**:
- `value`: Data to hash to curve

**Returns**: Curve point deterministically derived from value

**Use Case**: Derive curve points from arbitrary data

---

### upgradeFromTransient

Convert transient hash to persistent hash.

**Signature**:
```compact
circuit upgradeFromTransient(hash: Field): Bytes<32>
```

**Parameters**:
- `hash`: Transient hash (`Field`)

**Returns**: Persistent hash (`Bytes<32>`)

**Use Case**: Convert between hash representations

---

## Merkle Tree Functions

### merkleTreePathRoot

Compute Merkle tree root from a path and leaf.

**Signature**:
```compact
circuit merkleTreePathRoot<T>(
  path: MerkleTreePath<T>,
  leaf: T
): MerkleTreeDigest
```

**Parameters**:
- `path`: Merkle proof path
- `leaf`: Leaf value to verify

**Returns**: Computed Merkle root

**Use Case**: Verify Merkle proofs

**Example**:
```compact
// TypeScript provides path
witness getMerklePath(): MerkleTreePath<Field>;
witness getLeaf(): Field;

export circuit verifyMembership(expectedRoot: MerkleTreeDigest): Boolean {
  const path = getMerklePath();
  const leaf = getLeaf();
  const computedRoot = merkleTreePathRoot(path, leaf);
  return computedRoot == expectedRoot;
}
```

---

### merkleTreePathRootNoLeafHash

Compute Merkle tree root from a path (leaf already hashed in path).

**Signature**:
```compact
circuit merkleTreePathRootNoLeafHash<T>(
  path: MerkleTreePath<T>
): MerkleTreeDigest
```

**Parameters**:
- `path`: Merkle proof path with leaf hash included

**Returns**: Computed Merkle root

**Use Case**: When path already includes hashed leaf

---

## Coin Management Functions

### tokenType

Get the token type for a domain separator.

**Signature**:
```compact
circuit tokenType(domainSep: Bytes<32>): Bytes<32>
```

**Parameters**:
- `domainSep`: Domain separator for token

**Returns**: Token type identifier

---

### nativeToken

Get the native token type identifier.

**Signature**:
```compact
circuit nativeToken(): Bytes<32>
```

**Returns**: Native token type identifier

---

### ownPublicKey

Get the current user's public key.

**Signature**:
```compact
circuit ownPublicKey(): ZswapCoinPublicKey
```

**Returns**: Public key of the user executing the circuit

**Use Case**: Identify the current user

---

### createZswapInput

Create a Zswap input (spend a coin).

**Signature**:
```compact
circuit createZswapInput(coin: QualifiedCoinInfo): []
```

**Parameters**:
- `coin`: Qualified coin to spend

**Use Case**: Spend a shielded coin

---

### createZswapOutput

Create a Zswap output (receive a coin).

**Signature**:
```compact
circuit createZswapOutput(
  recipient: Either<ZswapCoinPublicKey, ContractAddress>,
  amount: Uint<64>,
  tokenType: Bytes<32>
): CoinInfo
```

**Parameters**:
- `recipient`: Who receives the coin (user pubkey or contract address)
- `amount`: Amount of the coin
- `tokenType`: Type of token

**Returns**: `CoinInfo` for the new coin

**Use Case**: Create a new shielded coin

---

### mintToken

Mint new tokens.

**Signature**:
```compact
circuit mintToken(
  domainSep: Bytes<32>,
  amount: Uint<64>
): []
```

**Parameters**:
- `domainSep`: Domain separator for token type
- `amount`: Amount to mint

**Use Case**: Create new tokens (if contract has minting rights)

---

### evolveNonce

Evolve a nonce value.

**Signature**:
```compact
circuit evolveNonce(nonce: Field): Field
```

**Parameters**:
- `nonce`: Current nonce

**Returns**: Evolved nonce

**Use Case**: Generate unique nonces

---

### receive

Receive a coin (claim it in transaction).

**Signature**:
```compact
circuit receive(coin: CoinInfo): QualifiedCoinInfo
```

**Parameters**:
- `coin`: Coin information to receive

**Returns**: Qualified coin with Merkle index

**Use Case**: Accept incoming coins

---

### send

Send a coin to a recipient.

**Signature**:
```compact
circuit send(
  coin: QualifiedCoinInfo,
  recipient: Either<ZswapCoinPublicKey, ContractAddress>,
  amount: Uint<64>,
  tokenType: Bytes<32>
): SendResult
```

**Parameters**:
- `coin`: Coin to send from
- `recipient`: Who receives
- `amount`: Amount to send
- `tokenType`: Token type

**Returns**: Send operation result

**Use Case**: Send shielded coins

---

### sendImmediate

Send a coin immediately (synchronous).

**Signature**:
```compact
circuit sendImmediate(
  coin: QualifiedCoinInfo,
  recipient: Either<ZswapCoinPublicKey, ContractAddress>,
  amount: Uint<64>,
  tokenType: Bytes<32>
): SendResult
```

**Similar to**: `send()` but executes immediately

---

### mergeCoin

Merge multiple coins into one.

**Signature**:
```compact
circuit mergeCoin(
  coins: Vector<N, QualifiedCoinInfo>
): QualifiedCoinInfo
```

**Parameters**:
- `coins`: Vector of coins to merge

**Returns**: Single merged coin

**Use Case**: Combine multiple small coins

---

### mergeCoinImmediate

Merge coins immediately (synchronous).

**Signature**:
```compact
circuit mergeCoinImmediate(
  coins: Vector<N, QualifiedCoinInfo>
): QualifiedCoinInfo
```

**Similar to**: `mergeCoin()` but executes immediately

---

### burnAddress

Get the burn address (coins sent here are destroyed).

**Signature**:
```compact
circuit burnAddress(): Either<ZswapCoinPublicKey, ContractAddress>
```

**Returns**: Special burn address

**Use Case**: Destroy coins by sending to burn address

---

## Block Time Functions

### blockTimeLt

Check if block time is less than a threshold.

**Signature**:
```compact
circuit blockTimeLt(time: Uint<64>): Boolean
```

**Parameters**:
- `time`: Threshold timestamp (seconds since Unix epoch)

**Returns**: `true` if current block time < threshold

**Example**:
```compact
export circuit checkDeadline(deadline: Uint<64>): [] {
  assert(blockTimeLt(deadline), "Deadline passed");
}
```

---

### blockTimeGte

Check if block time is greater than or equal to a threshold.

**Signature**:
```compact
circuit blockTimeGte(time: Uint<64>): Boolean
```

**Parameters**:
- `time`: Threshold timestamp

**Returns**: `true` if current block time >= threshold

---

### blockTimeGt

Check if block time is greater than a threshold.

**Signature**:
```compact
circuit blockTimeGt(time: Uint<64>): Boolean
```

**Parameters**:
- `time`: Threshold timestamp

**Returns**: `true` if current block time > threshold

---

### blockTimeLte

Check if block time is less than or equal to a threshold.

**Signature**:
```compact
circuit blockTimeLte(time: Uint<64>): Boolean
```

**Parameters**:
- `time`: Threshold timestamp

**Returns**: `true` if current block time <= threshold

---

## Common Usage Patterns

### Pattern 1: Hash for Privacy

```compact
import CompactStandardLibrary;

witness getUserSecret(): Field;
ledger secretHash: Bytes<32>;

export circuit storeSecretHash(): [] {
  const secret = getUserSecret();
  // Hash is auto-disclosed, safe to store
  secretHash = persistentHash(secret);
}
```

---

### Pattern 2: Commitment-Reveal

```compact
witness getSecret(): Field;
witness getNonce(): Bytes<32>;

ledger commitment: Bytes<32>;

// Commit phase
export circuit commit(): [] {
  const secret = getSecret();
  const nonce = getNonce();
  commitment = persistentCommit(secret, nonce);
}

// Reveal phase
export circuit reveal(revealedSecret: Field, revealedNonce: Bytes<32>): [] {
  const computedCommitment = persistentCommit(
    disclose(revealedSecret),
    disclose(revealedNonce)
  );
  assert(commitment == computedCommitment, "Invalid reveal");
}
```

---

### Pattern 3: Maybe Type for Optional Values

```compact
ledger maybeValue: Maybe<Field>;

export circuit setValue(value: Field): [] {
  maybeValue = some(disclose(value));
}

export circuit clearValue(): [] {
  maybeValue = none<Field>();
}
```

---

### Pattern 4: Either for Multiple Recipients

```compact
export circuit sendToRecipient(
  isUser: Boolean,
  userKey: ZswapCoinPublicKey,
  contractAddr: ContractAddress
): [] {
  const recipient = isUser
    ? left<ZswapCoinPublicKey, ContractAddress>(userKey)
    : right<ZswapCoinPublicKey, ContractAddress>(contractAddr);
  
  // Use recipient...
}
```

---

### Pattern 5: Time-Based Access Control

```compact
sealed ledger deadline: Uint<64>;

constructor(deadlineTime: Uint<64>) {
  deadline = deadlineTime;
}

export circuit beforeDeadline(): [] {
  assert(blockTimeLt(deadline), "Deadline has passed");
  // Execute time-sensitive logic
}

export circuit afterDeadline(): [] {
  assert(blockTimeGte(deadline), "Deadline not reached");
  // Execute post-deadline logic
}
```

---

## Quick Reference

### Hash Functions
| Function | Input Type | Output Type | For Ledger? |
|----------|-----------|-------------|-------------|
| `transientHash` | `<T>` | `Field` | No |
| `transientCommit` | `<T>, Field` | `Field` | No |
| `persistentHash` | `<T>` | `Bytes<32>` | Yes ✅ |
| `persistentCommit` | `<T>, Bytes<32>` | `Bytes<32>` | Yes ✅ |

**All hash functions** have implicit disclosure - no `disclose()` needed!

### Common Types
| Type | Purpose |
|------|---------|
| `Maybe<T>` | Optional value |
| `Either<L,R>` | One of two types |
| `ContractAddress` | Contract identifier |
| `ZswapCoinPublicKey` | User public key |
| `CurvePoint` | Elliptic curve point |

### Block Time
| Function | Comparison |
|----------|-----------|
| `blockTimeLt(t)` | time < t |
| `blockTimeLte(t)` | time <= t |
| `blockTimeGt(t)` | time > t |
| `blockTimeGte(t)` | time >= t |

---

## Related Documentation

- **Language Reference**: MINOKAWA_LANGUAGE_REFERENCE.md
- **Ledger Types**: MINOKAWA_LEDGER_DATA_TYPES.md
- **Privacy**: MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md
- **Opaque Types**: MINOKAWA_OPAQUE_TYPES.md

---

**Status**: ✅ Complete Standard Library API Reference  
**Source**: Official Midnight Documentation  
**Version**: Minokawa 0.18.0 / CompactStandardLibrary  
**Last Updated**: October 28, 2025
