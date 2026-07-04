# How to Keep Data Private in Midnight

**Privacy Patterns and Best Practices**  
**Network**: Testnet_02  
**Updated**: October 28, 2025

> 🔐 **Practical strategies for keeping data private in Midnight contracts**

---

## Introduction

This document describes strategies for keeping data **private** in Midnight contracts. While not exhaustive, these patterns will help you get started building privacy-preserving applications.

---

## The Fundamental Rule

### What's Public vs Private

**⚠️ CRUCIAL TO REMEMBER**:

Except for `[Historic]MerkleTree` data types, **anything** that is:
- ❌ Passed as argument to ledger operation
- ❌ Read from ledger
- ❌ Written to ledger

Is **publicly visible** and should be treated as such.

**What's public**: The argument or ledger **value** itself  
**NOT public**: The code that manipulates it

---

### Examples

```compact
export ledger items: Set<Field>;
export ledger others: MerkleTree<10, Field>;

// ❌ Reveals `item1` (publicly visible)
items.insert(item1);

// ⚠️ Reveals the *value* of `f(x)`, but NOT `x` directly
items.member(f(x));

// ✅ The exception: Does NOT reveal `item2`
// (though someone who guesses the value can check it!)
others.insert(item2);
```

**The MerkleTree Exception**: Merkle tree insertions don't reveal which specific value, but someone who guesses correctly can verify it.

---

## Privacy Patterns

When you need to reference shielded data in public state, use one of these patterns:

---

## Pattern 1: Hashes and Commitments

### The Basic Approach

**Store only a hash or commitment** of data, rather than the full data itself.

**Why it works**:
- Hash output reveals **nothing** about input
- Cannot compute input from output
- Cannot guess information about input (unless you guess the whole input)

---

### Primitive Functions

Compact's standard library provides two main primitives:

#### 1. persistentHash

**Signature**:
```compact
circuit persistentHash<T>(value: T): Bytes<32>
```

**Use Case**: Hash binary data (limited to `Bytes<32>`)

**Example**:
```compact
witness getUserId(): Bytes<32>;

export ledger userHashes: Set<Bytes<32>>;

export circuit registerUser(): [] {
  const userId = getUserId();
  const hash = persistentHash(userId);
  userHashes.insert(hash);  // Hash is public, userId is not!
}
```

---

#### 2. persistentCommit

**Signature**:
```compact
circuit persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>
```

**Use Case**: Create commitments from **any** Compact type with randomness

**Why randomness matters**:
1. **Prevents guessing**: Even with few possible values (e.g., votes)
2. **Prevents correlation**: Same value, different commitment each time

**Example**:
```compact
witness getVote(): Uint<8>;
witness getNonce(): Bytes<32>;

export ledger voteCommitments: Set<Bytes<32>>;

export circuit castVote(): [] {
  const vote = getVote();
  const nonce = getNonce();
  
  // Commitment is public, vote and nonce are not!
  const commitment = persistentCommit(vote, nonce);
  voteCommitments.insert(commitment);
}
```

---

### Why Randomness is Critical

#### Problem 1: Value Guessing

**Without randomness**:
```compact
// ❌ BAD: Small value space
const hash = persistentHash(vote);  // vote is 0 or 1

// Attacker can try:
// if hash == persistentHash(0) → vote was 0
// if hash == persistentHash(1) → vote was 1
```

**With randomness**:
```compact
// ✅ GOOD: Unpredictable
const commitment = persistentCommit(vote, nonce);

// Attacker cannot guess because they don't know nonce!
```

---

#### Problem 2: Value Correlation

**Without randomness**:
```compact
// ❌ BAD: Same password appears twice
user1Hash = persistentHash(password);
user2Hash = persistentHash(password);

// Attacker sees: user1Hash == user2Hash
// Conclusion: Same password! Privacy leaked!
```

**With randomness**:
```compact
// ✅ GOOD: Different commitments for same value
user1Commitment = persistentCommit(password, nonce1);
user2Commitment = persistentCommit(password, nonce2);

// Attacker sees: user1Commitment ≠ user2Commitment
// No correlation revealed!
```

---

### Randomness Best Practices

#### Fresh Randomness (Ideal)

```compact
witness getFreshNonce(): Bytes<32>;

export circuit commit(): [] {
  const secret = getSecret();
  const nonce = getFreshNonce();  // NEW nonce each time
  
  commitment = persistentCommit(secret, nonce);
}
```

---

#### Reusing Randomness (Advanced)

**When safe**: Guarantee data will **never be the same** for same randomness

**Pattern**: Secret key + round counter

```compact
witness getSecretKey(): Bytes<32>;

export ledger round: Counter;
export ledger commitments: Map<Uint<64>, Bytes<32>>;

export circuit commitRound(): [] {
  const sk = getSecretKey();
  const roundNum = round.read();
  
  const data = computeDataForRound(roundNum);
  
  // Randomness: sk + roundNum (unique per round)
  const commitment = persistentCommit(
    data,
    persistentHash<Vector<2, Bytes<32>>>([sk, roundNum as Bytes<32>])
  );
  
  commitments.insert(disclose(roundNum), commitment);
  round += 1;
}
```

**Why safe**: `roundNum` never repeats, so `sk + roundNum` is always unique.

---

### ⚠️ Randomness Warning

**Be careful with randomness!**
- Easy to get wrong
- Err on the safe side
- When in doubt, use fresh random values

---

## Pattern 2: Authenticating with Hashes

### The Power of ZK Proofs

**Zero-knowledge proofs can emulate signatures** just by using hashes!

**How it works**:
1. Hash secret key → "public key"
2. Store public key on ledger
3. Prove you know secret key by computing same hash
4. Contract guarantees only secret key holder can continue

---

### Example: Creator-Only Contract

```compact
import CompactStandardLibrary;

witness secretKey(): Bytes<32>;

export ledger organizer: Bytes<32>;
export ledger restrictedCounter: Counter;

constructor() {
  // Store creator's public key
  organizer = publicKey(secretKey());
}

export circuit increment(): [] {
  // Verify caller knows the secret key
  assert(organizer == publicKey(secretKey()), "not authorized");
  
  // Only authorized user can increment
  restrictedCounter.increment(1);
}

circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "some-domain-separator"),
    sk
  ]);
}
```

**Benefits**:
- ✅ No signature libraries needed
- ✅ Secret key never revealed
- ✅ Proves knowledge without disclosure
- ✅ Efficient verification

---

### Domain Separators

**Always use domain separators** in hash functions:

```compact
// ✅ GOOD
persistentHash<Vector<2, Bytes<32>>>([
  pad(32, "my-app:public-key"),  // Domain separator
  secretKey
])

// ❌ BAD
persistentHash(secretKey)  // Could conflict with other uses
```

**Why**:
- Prevents cross-context attacks
- Ensures hash is used for intended purpose
- Standard cryptographic practice

---

## Pattern 3: Making Use of Merkle Trees

### The Merkle Tree Advantage

**Merkle trees** (`MerkleTree<n, T>` and `HistoricMerkleTree<n, T>`) have a **unique** privacy property:

**Can assert publicly** that a value is in the tree **WITHOUT revealing which value!**

**Compared to `Set<Bytes<32>>`**:
```compact
// ❌ Set reveals WHICH entry
export ledger commitments: Set<Bytes<32>>;
commitments.member(someCommitment);  // Reveals someCommitment

// ✅ MerkleTree does NOT reveal which entry
export ledger tree: MerkleTree<10, Bytes<32>>;
tree.checkRoot(someRoot);  // Doesn't reveal which item was proven!
```

---

### How It Works

**Merkle tree membership proof**:
1. Circuit proves knowledge of a **path** to an inserted value
2. Check that hash of this path matches expected root
3. **Never reveals** which specific item or path

**Use cases**:
- Authorize secret keys without revealing which
- Prove membership in set without identifying member
- Privacy-preserving access control

---

### Types and Functions

**Types**:
- `MerkleTree<n, T>` - Standard Merkle tree
- `HistoricMerkleTree<n, T>` - With historical roots
- `MerkleTreePath<n, T>` - Proof path

**Circuits**:
- `merkleTreePathRoot<n, T>(path)` - Compute root from path

**TypeScript Functions** (on tree objects):
- `pathForLeaf(index, leaf)` - Direct path (fast, O(1))
- `findPathForLeaf(leaf)` - Search for path (slow, O(n))

**See**: MINOKAWA_LEDGER_DATA_TYPES.md

---

### Example: Private Set Membership

```compact
import CompactStandardLibrary;

export ledger items: MerkleTree<10, Field>;

witness findItem(item: Field): MerkleTreePath<10, Field>;

export circuit insert(item: Field): [] {
  items.insert(item);
}

export circuit check(item: Field): [] {
  const path = findItem(item);
  assert(
    items.checkRoot(merkleTreePathRoot<10, Field>(path)),
    "path must be valid"
  );
}
```

**TypeScript Implementation**:
```typescript
function findItem(
  context: WitnessContext, 
  item: bigint
): MerkleTreePath<bigint> {
  return context.ledger.items.findPathForLeaf(item)!;
}
```

**Note**: `pathForLeaf` is **preferable** when you know the index (no O(n) scan).

---

### MerkleTree vs HistoricMerkleTree

#### MerkleTree<n, T>

**Behavior**: `checkRoot()` accepts **only current root**

**Use when**: Tree rarely changes

**Problem**: Frequent insertions invalidate old proofs

---

#### HistoricMerkleTree<n, T>

**Behavior**: `checkRoot()` accepts **current AND prior roots**

**Use when**: Tree has frequent insertions

**Problem**: Not suitable if items are frequently removed/replaced (old proofs might become inappropriately valid)

**Example**:
```compact
export ledger authKeys: HistoricMerkleTree<10, Bytes<32>>;

// Insertions don't invalidate old proofs!
authKeys.insert(newKey);
```

---

## Pattern 4: The Commitment/Nullifier Pattern

### The Most Powerful Pattern

**Concept**: Keep data in **two different committed forms**:
1. **Commitment** - Stored in MerkleTree
2. **Nullifier** - Stored in Set

**Enables**: Single-use authentication tokens
- ✅ Prove membership without revealing which member
- ✅ Prevent reuse
- ✅ Maintain anonymity

**Used by**: Zerocash, Zswap (shielded UTXOs)

---

### How It Works

**Setup**:
1. Create commitment from secret data
2. Insert commitment into MerkleTree

**Use**:
1. Prove commitment exists in tree (via Merkle proof)
2. Compute nullifier from same secret data
3. Assert nullifier not in Set (first use)
4. Add nullifier to Set (mark as used)

**Security**:
- ✅ Can't reuse (nullifier prevents)
- ✅ Can't identify which token (Merkle tree hides)
- ✅ Can't forge (needs secret to create nullifier)

---

### Critical Requirements

1. **Domain separators**: Commitments ≠ nullifiers for same secret
   ```compact
   commitment = hash([pad(32, "commitment-domain"), secret])
   nullifier  = hash([pad(32, "nullifier-domain"), secret])
   ```

2. **Secret knowledge**: Nullifier creation requires secret
   - Prevents initial authorizer from tracking use

---

### Example: Single-Use Authority

```compact
import CompactStandardLibrary;

witness findAuthPath(pk: Bytes<32>): MerkleTreePath<10, Bytes<32>>;
witness secretKey(): Bytes<32>;

export ledger authorizedCommitments: HistoricMerkleTree<10, Bytes<32>>;
export ledger authorizedNullifiers: Set<Bytes<32>>;
export ledger restrictedCounter: Counter;

export circuit addAuthority(pk: Bytes<32>): [] {
  // Add new authority (public key commitment)
  authorizedCommitments.insert(pk);
}

export circuit increment(): [] {
  const sk = secretKey();
  
  // 1. Prove you have authority (via Merkle proof)
  const authPath = findAuthPath(publicKey(sk));
  assert(
    authorizedCommitments.checkRoot(
      merkleTreePathRoot<10, Bytes<32>>(authPath)
    ),
    "not authorized"
  );
  
  // 2. Compute nullifier
  const nul = nullifier(sk);
  
  // 3. Check not already used
  assert(!authorizedNullifiers.member(nul), "already incremented");
  
  // 4. Mark as used
  authorizedNullifiers.insert(disclose(nul));
  
  // 5. Perform action
  restrictedCounter.increment(1);
}

// Commitment (for MerkleTree)
circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "commitment-domain"),
    sk
  ]);
}

// Nullifier (for Set)
circuit nullifier(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "nullifier-domain"),
    sk
  ]);
}
```

**Flow**:
1. Admin adds authority: `addAuthority(hash("commitment", sk))`
2. User proves & uses once: `increment()` with sk
   - Proves membership in tree (which commitment? unknown!)
   - Adds nullifier to set (marks this authority as used)
   - Cannot be used again (nullifier already in set)

---

### Advanced: Nullifier Pattern for Coins

**Zswap uses this pattern** for shielded transactions:

```compact
// Coin commitment (UTXO creation)
coinCommitment = hash([nonce, amount, owner, tokenType])

// Insert into Merkle tree
coinTree.insert(coinCommitment)

// Later: Spend coin
// Prove commitment in tree (which coin? secret!)
// Add nullifier (prevent double-spend)
nullifier = hash([nonce, "nullifier-domain"])
spentNullifiers.insert(nullifier)
```

**Properties**:
- ✅ Can't see who owns coins
- ✅ Can't see which coin was spent
- ✅ Can't double-spend (nullifier prevents)
- ✅ Can't forge (need to know nonce)

---

## Privacy Patterns Summary

### Pattern Comparison

| Pattern | Privacy Level | Use Case | Complexity |
|---------|---------------|----------|------------|
| **Hash** | Good | Single values | Low |
| **Commitment** | Better | Values with randomness | Low |
| **Authentication** | Good | Access control | Medium |
| **Merkle Tree** | Excellent | Set membership | Medium |
| **Commit/Nullify** | Maximum | Single-use tokens | High |

---

### When to Use Each

**Use Hashes** when:
- Storing fixed data
- No need to prevent correlation
- Example: Password verification

**Use Commitments** when:
- Need to hide value with small space
- Prevent correlation
- Example: Voting, bids

**Use Authentication** when:
- Access control needed
- Public key auth without signatures
- Example: Owner-only functions

**Use Merkle Trees** when:
- Need to prove membership
- Don't want to reveal which member
- Example: Authorized key set

**Use Commit/Nullify** when:
- Single-use tokens
- Maximum privacy
- Prevent double-use
- Example: Coins, tickets, credentials

---

## Best Practices

### 1. Always Use Domain Separators

```compact
// ✅ GOOD
hash([pad(32, "my-app:purpose"), data])

// ❌ BAD
hash(data)
```

---

### 2. Fresh Randomness When Possible

```compact
// ✅ GOOD
commitment = persistentCommit(value, freshNonce())

// ⚠️ CAREFUL
commitment = persistentCommit(value, reusedNonce + counter)
```

---

### 3. Document Privacy Decisions

```compact
// PRIVACY: User ID hashed to prevent linking
const userHash = persistentHash(userId);
userHashes.insert(userHash);

// DISCLOSURE: Count is public for transparency
totalUsers = disclose(totalUsers + 1);
```

---

### 4. Test Privacy Properties

**Verify**:
- Private data never appears in ledger
- Commitments don't leak information
- Merkle proofs don't reveal members
- Nullifiers prevent reuse

---

### 5. Consider Trade-offs

**Privacy vs Usability**:
- More privacy = More complexity
- Choose appropriate level for use case

**Example**:
- Public leaderboard: Less privacy OK
- Medical records: Maximum privacy required

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting to Use Randomness

```compact
// ❌ BAD: Vote is guessable
const voteHash = persistentHash(vote);  // vote is 0 or 1

// ✅ GOOD: Vote is hidden
const voteCommitment = persistentCommit(vote, nonce);
```

---

### ❌ Pitfall 2: Reusing Randomness Unsafely

```compact
// ❌ BAD: Same nonce for same user
const commitment = persistentCommit(action, userNonce);

// ✅ GOOD: Unique nonce per action
const commitment = persistentCommit(action, hash([userNonce, actionId]));
```

---

### ❌ Pitfall 3: Missing Domain Separators

```compact
// ❌ BAD: Could conflict with other uses
const hash1 = persistentHash(sk);
const hash2 = persistentHash(sk);  // Same as hash1!

// ✅ GOOD: Different domains
const publicKey = persistentHash([pad(32, "pubkey"), sk]);
const nullifier = persistentHash([pad(32, "nullifier"), sk]);
```

---

### ❌ Pitfall 4: Revealing Too Much

```compact
// ❌ BAD: Reveals actual value
items.insert(disclose(secretValue));

// ✅ GOOD: Reveals only hash
const hash = persistentHash(secretValue);
items.insert(hash);
```

---

## Related Documentation

- **[MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md](MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)** - disclose() mechanism
- **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - Hash and commitment functions
- **[MINOKAWA_LEDGER_DATA_TYPES.md](MINOKAWA_LEDGER_DATA_TYPES.md)** - MerkleTree operations
- **[SMART_CONTRACTS_ON_MIDNIGHT.md](SMART_CONTRACTS_ON_MIDNIGHT.md)** - Technical deep-dive

---

## Summary

### The Privacy Toolkit

**Basic**:
- `persistentHash()` - Hash values
- `persistentCommit()` - Commitments with randomness

**Advanced**:
- MerkleTree - Anonymous set membership
- Commitment/Nullifier - Single-use tokens

### Remember

✅ **Ledger operations reveal arguments**  
✅ **MerkleTree is the exception**  
✅ **Use randomness for commitments**  
✅ **Domain separators prevent conflicts**  
✅ **Test privacy properties**  

**With these patterns, you can build truly private applications!** 🔐🌙

---

**Status**: ✅ Complete Privacy Patterns Guide  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025
