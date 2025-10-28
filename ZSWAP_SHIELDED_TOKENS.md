# Zswap - Shielded Token Mechanism

**Midnight's Native Currency Implementation**  
**Network**: Testnet_02  
**Status**: 🚧 Under development, subject to change  
**Updated**: October 28, 2025

> 💰 **Understanding Midnight's privacy-preserving token system**

---

## ⚠️ Important Notice

**The details of Midnight's native currency implementation are not yet stable** and will undergo further revisions.

**Performance note**: Basic operations have **not been optimized** at this time.

**Expect changes** as the system matures toward mainnet.

---

## What is Zswap?

**Zswap** is a **shielded token mechanism** based on:
- **Zerocash** - Decentralized anonymous payments
- **Extended with**:
  - Native token support
  - Atomic swaps
  - Contract fund management

**Privacy Properties**:
- ✅ Hidden values
- ✅ Hidden token types
- ✅ Hidden owners
- ✅ Unlinkable transactions

---

## Core Concept

### UTXO Model (with a twist)

**Like Bitcoin UTXO**:
- Set of **inputs** (coins being spent)
- Set of **outputs** (coins being created)

**Unlike Bitcoin**:
- ❌ Cannot compute set of unspent transactions
- ❌ Cannot link inputs to outputs
- ✅ **Privacy preserved** (inherited from Zerocash)

**The Zswap Variation**:
- Permits **contracts to hold funds**
- Enables **privacy-preserving smart contracts**

---

## Offers

The basic component of Zswap is an **offer**.

### Offer Structure

An offer consists of **four elements**:

```
┌─────────────────────────────────────────┐
│  1. Input Coins (Spends)                │
│  • Existing coins being consumed        │
│  • Nullifiers prevent double-spend      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Output Coins                        │
│  • New coins being created              │
│  • Commitments added to tree            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Transient Coins                     │
│  • Created AND spent in same tx         │
│  • For contract coin management         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Balance Vector                      │
│  • Total value per token type           │
│  • Must be non-negative (balanced)      │
└─────────────────────────────────────────┘
```

---

### 1. Input Coins (Spends)

**What they are**: Existing coins being consumed

**Properties**:
- Reference commitment in global Merkle tree (without revealing which)
- Produce nullifier (prevents double-spend)
- Count **positively** toward balance vector

**Example**:
```
Input: 10 TokenA
Balance: +10 TokenA
```

---

### 2. Output Coins

**What they are**: New coins being created

**Properties**:
- Create new commitment
- Add to global Merkle tree
- Count **negatively** toward balance vector

**Example**:
```
Output: 5 TokenA to User A
Output: 5 TokenA to User B
Balance: -10 TokenA
```

---

### 3. Transient Coins

**What they are**: Coins created AND spent in same transaction

**Why they exist**: Extends ability for **contracts to manage coins**

**Conceptually**:
```
Output → Input (in same transaction)
```

**Key distinction**: 
- Input spends from **local** commitment set
- Not from global Merkle tree
- Prevents index collisions

**Use case**:
```compact
// Contract receives, processes, and sends coins in one transaction
export circuit processPayment(amount: Uint<128>): [] {
  // 1. Receive coin (creates transient output)
  const coin = receive(incomingCoin);
  
  // 2. Process (contract logic)
  processFees(coin);
  
  // 3. Send (spends transient coin)
  send(processedCoin, recipient, amount);
}
```

---

### 4. Balance Vector

**What it is**: Vector of total value per token type

**Dimensions**: All possible token types
- Each dimension = one token type
- Each dimension has its own value

**Computation**:
```
Balance[tokenType] = Σ(inputs) - Σ(outputs)
```

**Example**:
```
Inputs:  10 TokenA, 5 TokenB
Outputs: 7 TokenA, 3 TokenB

Balance Vector:
  TokenA: +10 -7 = +3
  TokenB: +5 -3 = +2
```

**Valid**: Balance ≥ 0 for all dimensions

---

### Balanced Offers

**Definition**: An offer is **balanced** if, for all token types, the balance is **non-negative**.

**Checking balance**:
1. Compute balance vector
2. Adjust for mints (add to balance)
3. Adjust for fees (subtract from balance)
4. Verify: All dimensions ≥ 0

**Example**:
```
Inputs:  10 TokenA
Outputs: 8 TokenA
Mint:    0 TokenA
Fees:    1 TokenA

Balance: +10 -8 -1 = +1 TokenA ✅ Valid!
```

**Invalid Example**:
```
Inputs:  10 TokenA
Outputs: 12 TokenA

Balance: +10 -12 = -2 TokenA ❌ Invalid!
```

---

## Outputs (Detailed)

### What an Output Does

**Creates a new coin** and places commitment in global Merkle tree.

---

### Output Components

```
┌─────────────────────────────────────────┐
│  Zswap Output                           │
│                                         │
│  1. Commitment                          │
│     • To coin data (nonce, type, value) │
│                                         │
│  2. Pedersen Commitment                 │
│     • Multi-base commitment to type/val │
│                                         │
│  3. Contract Address (optional)         │
│     • IFF output is for a contract      │
│                                         │
│  4. Ciphertext (optional)               │
│     • If output is for a user           │
│     • Encrypted coin info               │
│                                         │
│  5. Zero-Knowledge Proof                │
│     • Proves 1-4 are correct            │
└─────────────────────────────────────────┘
```

---

### 1. Commitment

**Formula**:
```
commitment = hash(nonce, tokenType, value, owner)
```

**Stored**: In global Merkle tree

**Purpose**: Proves coin existence without revealing details

---

### 2. Multi-Base Pedersen Commitment

**Formula**:
```
C = value·G + tokenType·H + randomness·I
```

**Purpose**: 
- Commits to value and token type
- Homomorphic (can add commitments)
- Used for balance checking

**Multi-base**: Multiple generator points (G, H, I)

---

### 3. Contract Address (Optional)

**Present IFF**: Output is targeted at a contract

**Example**:
```compact
// Output to contract
const recipient = right<ZswapCoinPublicKey, ContractAddress>(
  contractAddr
);
```

**Purpose**: Identifies which contract receives coin

---

### 4. Ciphertext (Optional)

**Present if**: Output is toward a user

**Contains**: Encrypted coin information
- Nonce
- Token type
- Value

**Encrypted with**: Recipient's public key

**Purpose**: User can decrypt to learn about received coin

**Note**: ⚠️ Currently, coin ciphertexts not created for all recipients (see `send()` function notes)

---

### 5. Zero-Knowledge Proof

**Proves**:
- Commitment correctly formed
- Pedersen commitment matches
- Value is positive
- Token type is valid
- Encryption (if present) is correct

**Validation**: Outputs are **valid** if ZK proof verifies

---

## Inputs (Detailed)

### What an Input Does

**Spends an existing coin** by:
- Referencing commitment (without revealing which)
- Producing nullifier (prevents double-spend)

---

### Input Components

```
┌─────────────────────────────────────────┐
│  Zswap Input                            │
│                                         │
│  1. Nullifier                           │
│     • Derived from coin commitment      │
│     • Unlinkable to commitment          │
│                                         │
│  2. Pedersen Commitment                 │
│     • Multi-base commitment to type/val │
│                                         │
│  3. Contract Address (optional)         │
│     • IFF input is from a contract      │
│                                         │
│  4. Merkle Tree Root                    │
│     • Root containing the commitment    │
│                                         │
│  5. Zero-Knowledge Proof                │
│     • Proves 1-4 are correct            │
└─────────────────────────────────────────┘
```

---

### 1. Nullifier

**Formula**:
```
nullifier = hash(commitment, secretKey, "nullifier-domain")
```

**Properties**:
- Unique per coin
- Unlinkable to commitment
- Prevents double-spend

**Stored**: In global nullifier set

**Validation**: Transaction invalid if nullifier already exists

---

### 2. Multi-Base Pedersen Commitment

**Same as output**: Commits to value and token type

**Purpose**: Balance checking (inputs + outputs must balance)

---

### 3. Contract Address (Optional)

**Present IFF**: Input is from a contract

**Purpose**: Identifies which contract is spending coin

---

### 4. Merkle Tree Root

**What it is**: Root of tree containing the coin commitment

**Why needed**: Proves coin exists without revealing which coin

**Validation**: Root must be in **set of past roots**

**Historic roots**: Allows spending even if tree has grown since coin creation

---

### 5. Zero-Knowledge Proof

**Proves**:
- Nullifier correctly derived from commitment
- Commitment exists in Merkle tree
- Merkle path is valid
- User knows secret key
- Pedersen commitment matches

**Validation**: Inputs are **valid** IFF:
- ✅ ZK proof verifies
- ✅ Merkle tree root is in set of past roots
- ✅ Nullifier not in nullifier set

---

## Token Types

### What is a Token Type?

**Definition**: 256-bit identifier for a token

**Two categories**:
1. **Native token**: Pre-defined zero value (`0x00...00`)
2. **User tokens**: Collision-resistant hash output

---

### Native Token

**Identifier**: `0x00000000000000000000000000000000` (all zeros)

**Obtained via**:
```compact
const nativeTokenType = nativeToken();
```

**Use**: Midnight's primary currency

---

### User-Issued Tokens

**Created by**: Contracts

**Derivation**:
```
tokenType = hash(contractAddress, domainSeparator)
```

**Formula**:
```compact
const myTokenType = tokenType(
  pad(32, "my-unique-token"),  // domain separator
  kernel.self()                 // contract address
);
```

**Properties**:
- ✅ Unique per contract + domain separator
- ✅ Collision-resistant
- ✅ Cannot mint another contract's tokens

---

### Example: Creating Custom Token

```compact
import CompactStandardLibrary;

export ledger totalSupply: Uint<128>;

const TOKEN_DOMAIN = pad(32, "MyAwesomeToken");

export circuit mintTokens(
  amount: Uint<128>,
  recipient: Either<ZswapCoinPublicKey, ContractAddress>
): [] {
  // Get our token type
  const myTokenType = tokenType(TOKEN_DOMAIN, kernel.self());
  
  // Mint new tokens
  const coin = createZswapOutput(recipient, amount, myTokenType);
  
  // Update supply
  totalSupply = disclose(totalSupply + amount);
}
```

---

## Privacy Properties

### What's Hidden

**Commitments hide**:
- ✅ Coin value
- ✅ Token type
- ✅ Owner identity
- ✅ Which commitment in tree

**Nullifiers hide**:
- ✅ Which commitment was spent
- ✅ Link to original output

**Pedersen commitments hide**:
- ✅ Actual values (binding but hiding)

---

### What's Revealed

**Public information**:
- ❌ Commitment exists (in tree)
- ❌ Nullifier exists (in set)
- ❌ Transaction occurred
- ❌ Contract address (if involved)
- ❌ Number of inputs/outputs

**NOT revealed**:
- ✅ Who owns coins
- ✅ Coin values
- ✅ Token types
- ✅ Which coins linked

---

## The Commitment/Nullifier Pattern

### How It Works

**Zerocash pattern** (used by Zswap):

```
1. CREATE COIN
   ↓
   commitment = hash(nonce, type, value, owner)
   ↓
   Insert into Merkle tree
   
2. SPEND COIN
   ↓
   Prove commitment in tree (via Merkle proof)
   ↓
   nullifier = hash(commitment, secretKey, "nullifier")
   ↓
   Add nullifier to set
   ↓
   Prevent re-spend (nullifier already in set)
```

**Privacy**:
- Can't link commitment ↔ nullifier
- Can't identify which coin spent
- Can't double-spend (nullifier prevents)

---

## Atomic Swaps

### How Zswap Enables Swaps

**Key feature**: Transaction merging

**Process**:
1. User A creates offer: Spend 10 TokenA, Output to B
2. User B creates offer: Spend 5 TokenB, Output to A
3. **Merge offers** into one transaction
4. Submit composite transaction

**Atomicity**: Either both swaps succeed, or neither!

**Trustless**: No need to trust counterparty

**See**: MIDNIGHT_TRANSACTION_STRUCTURE.md for details

---

## Contract Integration

### Contracts Holding Funds

**Midnight variation** of Zswap permits contracts to hold funds.

**How it works**:
1. Output targeted at contract (includes contract address)
2. Contract stores coin in ledger
3. Contract can later spend coin

**Example**:
```compact
export ledger contractFunds: List<QualifiedCoinInfo>;

export circuit receivePayment(coin: CoinInfo): [] {
  // Receive coin
  receive(coin);
  
  // Store in contract (qualified by receive)
  const qualifiedCoin = /* coin becomes qualified */;
  contractFunds.pushFront(qualifiedCoin);
}

export circuit withdraw(
  recipient: Either<ZswapCoinPublicKey, ContractAddress>,
  amount: Uint<128>
): [] {
  // Get coin from storage
  const coin = contractFunds.head();
  
  // Send to recipient
  const result = send(coin, recipient, amount);
  
  // Handle change
  if (result.change.isSome) {
    contractFunds.pushFront(result.change.value);
  }
}
```

---

## Transient Coins Deep-Dive

### Why Transient Coins?

**Problem**: Contracts need to manipulate coins within one transaction

**Solution**: Transient coins (created and spent in same tx)

**Example flow**:
```
1. Contract receives coin (output)
   ↓
2. Process coin (contract logic)
   ↓
3. Send processed coin (input)

All in ONE transaction!
```

---

### Transient vs Regular

**Regular coin**:
```
Output → Global Merkle tree
         ↓
         (Later transaction)
         ↓
Input ← Global Merkle tree
```

**Transient coin**:
```
Output → Local commitment set
         ↓
         (Same transaction)
         ↓
Input ← Local commitment set
```

**Benefit**: No index collision with global tree

---

## Zero-Knowledge Proofs in Zswap

### What's Proven

**For outputs**:
- Commitment correctly formed
- Pedersen commitment matches
- Value > 0
- Encryption correct (if present)

**For inputs**:
- Nullifier derived correctly
- Commitment in Merkle tree
- Merkle path valid
- Know secret key
- Pedersen commitment matches

**For balance**:
- Inputs - Outputs ≥ 0 (all token types)

---

### Privacy Guarantee

**Zero-knowledge property**:
- Proof reveals **nothing** beyond statement being true
- Cannot learn values, types, or identities from proof
- Cannot link inputs to outputs

---

## Performance Considerations

### Current Status

⚠️ **Basic operations have not been optimized** at this time.

**Expect**:
- Slower proof generation than final version
- Larger proof sizes than optimal
- Room for improvement

**Future**:
- Optimized circuits
- Faster proof generation
- Smaller proofs

---

### Practical Implications

**For developers**:
- Test with patience
- Expect improvements
- Design for future optimization

**For users**:
- Longer confirmation times (currently)
- Higher resource usage
- Will improve over time

---

## Comparison with Other Systems

### vs Bitcoin UTXO

| Feature | Bitcoin | Zswap |
|---------|---------|-------|
| **Privacy** | None | Full |
| **Values** | Public | Hidden |
| **Owners** | Public (addresses) | Hidden |
| **Linking** | Traceable | Unlinkable |
| **Tokens** | One type | Multi-token |
| **Contracts** | Limited (scripts) | Full support |

---

### vs Zerocash

| Feature | Zerocash | Zswap |
|---------|----------|-------|
| **Privacy** | Full | Full |
| **Tokens** | One type | Multi-token |
| **Swaps** | No | Atomic |
| **Contracts** | No | Yes |
| **Flexibility** | Payment only | Programmable |

---

## Summary

### Key Concepts

**Zswap offers**:
- Input coins (spends)
- Output coins (creates)
- Transient coins (same tx)
- Balance vector (must balance)

**Privacy through**:
- Commitments (hide details)
- Nullifiers (prevent double-spend, hide link)
- Zero-knowledge proofs (prove without revealing)

**Features**:
- ✅ Multi-token support
- ✅ Atomic swaps
- ✅ Contract integration
- ✅ Full privacy

### Current Status

🚧 **Under development**
- Not yet optimized
- Subject to change
- Expect improvements

---

## Related Documentation

- **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction details
- **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - Coin management functions
- **[HOW_TO_KEEP_DATA_PRIVATE.md](HOW_TO_KEEP_DATA_PRIVATE.md)** - Commitment/nullifier pattern
- **[SMART_CONTRACTS_ON_MIDNIGHT.md](SMART_CONTRACTS_ON_MIDNIGHT.md)** - Contract integration

---

## References

**[1]** Engelmann, F., Kerber, T., Kohlweiss, M., & Volkhov, M. (2022). *Zswap: zk-SNARK based non-interactive multi-asset swaps*. Proceedings on Privacy Enhancing Technologies (PoPETs) 4 (2022), 507-527.  
https://eprint.iacr.org/2022/1002.pdf

**[2]** Ben-Sasson, E., Chiesa, A. Garman, C., Green, M., Miers, I., Tromer, E., & Virza, M. (2014). *Zerocash: Decentralized Anonymous Payments from Bitcoin*. 2014 IEEE Symposium on Security and Privacy, SP 2014, Berkeley, CA, USA, May 18-21, 2014, 459-474.  
https://eprint.iacr.org/2014/349.pdf

---

**Status**: ✅ Complete Zswap Technical Reference  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025
