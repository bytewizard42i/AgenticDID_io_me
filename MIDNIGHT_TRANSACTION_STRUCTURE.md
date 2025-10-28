# Midnight Transaction Structure - Building Blocks

**Technical Deep-Dive**  
**Network**: Testnet_02  
**Updated**: October 28, 2025

> 🔧 **Understanding the unique structure of Midnight transactions**

---

## Introduction

Midnight's transaction structure is **unique** and may not be immediately intuitive. This document covers:
- Transaction structure
- Transaction effects
- What makes transactions work

---

## Transaction Components

A Midnight transaction consists of **three main parts**:

```
┌─────────────────────────────────────────┐
│  1. GUARANTEED Zswap Offer              │
│  • Always executes                      │
│  • Shielded coin operations             │
│  • Cannot fail once included            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. FALLIBLE Zswap Offer (Optional)     │
│  • May fail during execution            │
│  • Shielded coin operations             │
│  • Contract deployments                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Contract Calls Segment (Optional)   │
│  • Sequence of calls/deploys            │
│  • Cryptographic binding commitment     │
│  • Binding randomness                   │
└─────────────────────────────────────────┘
```

---

## 1. Guaranteed Zswap Offer

### Properties

**Execution**: Always succeeds (if transaction is included)

**Purpose**: Guaranteed shielded coin operations
- Create coin outputs
- Claim coin inputs
- Atomic value transfers

**Failure Mode**: If this fails, entire transaction rejected **before** inclusion in block

---

### Use Cases

**Guaranteed Transfers**:
```
User A → User B: 10 tokens
```

**Guaranteed Receipts**:
```
Contract → User: Claim winnings
```

---

## 2. Fallible Zswap Offer

### Properties

**Execution**: May fail during block execution

**Purpose**: 
- Conditional shielded operations
- Contract deployments
- Operations that might fail

**Failure Mode**: Transaction included in block, but this part may fail without invalidating entire transaction

---

### Use Cases

**Conditional Transfers**:
```
IF condition THEN transfer
ELSE fail (but transaction still valid)
```

**Contract Deployment**:
```
Deploy new contract
(fails if contract already exists)
```

---

### Why Separate Guaranteed and Fallible?

**Design Goal**: Allow partial success

**Without separation**:
- ❌ Entire transaction fails if any part fails
- ❌ Wasted fees on failed transactions
- ❌ Race conditions cause total failure

**With separation**:
- ✅ Guaranteed parts always succeed
- ✅ Fallible parts can fail gracefully
- ✅ Fees only charged for what executes
- ✅ Better user experience

---

## 3. Contract Calls Segment

### Structure

The contract calls segment contains:

1. **Sequence of operations**:
   - Contract calls
   - Contract deployments

2. **Cryptographic binding commitment**:
   - Ensures integrity
   - Links all parts together
   - See: [Transaction Integrity](#transaction-integrity)

3. **Binding randomness**:
   - Used in commitment
   - Proves ownership
   - Prevents tampering

---

### Contract Call Components

Each contract call includes:

```
┌─────────────────────────────────────────┐
│  Contract Call                          │
│                                         │
│  • Contract address                     │
│  • Entry point (circuit name)           │
│  • Guaranteed transcript                │
│  • Fallible transcript                  │
│  • Communication commitment             │
│  • Zero-knowledge proof                 │
└─────────────────────────────────────────┘
```

---

## Contract Deployments

### What is a Deployment?

**Purpose**: Create a new contract

**Execution**: Entirely part of **fallible** execution step

**Failure**: Fails if contract already exists at that address

---

### Deployment Components

```compact
// Deployment consists of:
{
  contractState: InitialState,  // Initial ledger state
  nonce: Bytes<32>               // Unique nonce
}
```

**Contract Address**: Hash of deployment parts
```
address = hash(contractState, nonce)
```

**Deterministic**: Same state + nonce → Same address

---

### Example Flow

```
1. Developer creates contract code
   ↓
2. Compile to verifier keys
   ↓
3. Create deployment transaction:
   - Initial state
   - Random nonce
   ↓
4. Compute address = hash(state, nonce)
   ↓
5. Submit transaction
   ↓
6. If address unused: ✅ Deploy succeeds
   If address exists: ❌ Deploy fails
```

**Note**: Failure doesn't invalidate transaction (it's fallible)

---

## Contract Calls

### Addressing

**Contract call targets**:
```
contractAddress + entryPoint → verifierKey
```

**Example**:
```
Address: 0x1234...
Entry Point: "increment"
→ Looks up verifier key for "increment" circuit
```

---

### Entry Points

**Entry points** are keys into the contract's **operation map**:

```yaml
Contract at 0x1234...:
  operations:
    "increment": <verifier_key_1>
    "decrement": <verifier_key_2>
    "getValue": <verifier_key_3>
```

**Selection**: `address + entryPoint` → specific `verifierKey`

---

### Transcripts

Each contract call declares **two transcripts**:

#### 1. Guaranteed Transcript

**Properties**:
- Always executes
- Cannot fail once included
- Ledger operations that must succeed

**Example**:
```
Read counter value
Increment counter
Write new value
```

---

#### 2. Fallible Transcript

**Properties**:
- May fail during execution
- Conditional operations
- Can fail gracefully

**Example**:
```
IF condition THEN
  Update state
ELSE
  Fail (transaction still valid)
```

---

### Communication Commitment

**Purpose**: Cross-contract interaction

**Current Status**: 🚧 Under development, not yet available

**Future Use**: 
- Contract A can call Contract B
- Atomic cross-contract operations
- Secure inter-contract communication

**The team wants to hear**: What kinds of interactions would you like?

---

### Zero-Knowledge Proof

**Every contract call includes**:

```
Proof that:
  1. Transcripts are valid for this contract
  2. Transcripts bind to other transaction elements
  3. All circuit constraints satisfied
  4. Private inputs exist (without revealing them)
```

**Verification**:
- Load verifier key from contract
- Verify proof against key
- If valid → Execute transcripts
- If invalid → Reject transaction

---

## Transaction Merging

### The Atomic Swap Feature

**Zswap permits atomic swaps** by allowing transactions to be **merged**.

---

### Merging Rules

**Current Limitations**:
- ❌ Contract call sections **cannot** be merged
- ✅ Two transactions can merge if **at least one** has empty contract call section

**Result**: New composite transaction with combined effects

---

### Example: Atomic Swap

**User A's Transaction**:
```yaml
guaranteed_zswap:
  outputs:
    - 10 TokenA to User B
  inputs:
    - User A's 10 TokenA
contract_calls: []  # Empty!
```

**User B's Transaction**:
```yaml
guaranteed_zswap:
  outputs:
    - 5 TokenB to User A
  inputs:
    - User B's 5 TokenB
contract_calls: []  # Empty!
```

**Merged Transaction**:
```yaml
guaranteed_zswap:
  outputs:
    - 10 TokenA to User B
    - 5 TokenB to User A
  inputs:
    - User A's 10 TokenA
    - User B's 5 TokenB
contract_calls: []
```

**Atomicity**: Either both swaps happen, or neither!

---

### Why Merging Matters

**Traditional Approach** (Two separate transactions):
```
1. User A sends 10 TokenA → User B
2. User B sends 5 TokenB → User A

Problem: User A's transaction might succeed, B's might fail!
Result: Non-atomic, risky
```

**Merged Approach** (One transaction):
```
1. Merge both transactions
2. Submit composite transaction

Result: Atomic swap, trustless!
```

---

## Transaction Integrity

### The Challenge

**Problem**: How to ensure transaction components aren't tampered with during merging?

**Solution**: Cryptographic commitments inherited from Zswap

---

### Pedersen Commitments

**What they are**: Cryptographic commitments to values

**Properties**:
- ✅ **Hiding**: Commitment reveals nothing about value
- ✅ **Binding**: Cannot change value after commitment
- ✅ **Homomorphic**: Can add commitments together

**Formula**:
```
Commitment(value, randomness) = value·G + randomness·H
```
Where G and H are generator points on elliptic curve.

---

### How It Works

#### Step 1: Individual Commitments

**Each input/output** has a commitment:
```
Input 1:  C₁ = v₁·G + r₁·H
Input 2:  C₂ = v₂·G + r₂·H
Output 1: C₃ = v₃·G + r₃·H
Output 2: C₄ = v₄·G + r₄·H
```

---

#### Step 2: Homomorphic Sum

**Combine all commitments**:
```
C_total = C₁ + C₂ - C₃ - C₄
        = (v₁ + v₂ - v₃ - v₄)·G + (r₁ + r₂ - r₃ - r₄)·H
```

**Conservation of value**:
```
If v₁ + v₂ = v₃ + v₄  (inputs = outputs)
Then C_total = 0·G + Δr·H
```

---

#### Step 3: Opening the Commitment

**To prove integrity**:
- Reveal: Δr = r₁ + r₂ - r₃ - r₄
- Verify: C_total = Δr·H

**Only the creators** of input/output commitments know the individual randomnesses!

**This ensures**: Funds spent as originally intended

---

### Extending to Contract Calls

**Contract calls contribute** to the overall Pedersen commitment:

```
C_total = C_inputs + C_outputs + C_contract_calls
```

**Special requirement**: Contract call contribution **carries no value vector**

**How**: Require knowledge of exponent of generator
- Implemented as **Fiat-Shamir transformed Schnorr proof**
- Proves you know randomness without revealing it
- Ensures contract calls don't create/destroy value

---

### Fiat-Shamir Schnorr Proof

**Purpose**: Prove knowledge of discrete logarithm

**What it proves**:
```
Given: Commitment C = r·H
Prove: I know r (without revealing r)
```

**How**:
1. Prover computes challenge from commitment
2. Prover computes response using secret randomness
3. Verifier checks response is valid
4. Non-interactive (Fiat-Shamir transformation)

**Result**: Contract calls are cryptographically bound but don't affect value balance

---

## Transaction Lifecycle

### Complete Flow

```
1. USER CREATES TRANSACTION
   ├─ Guaranteed Zswap offer
   ├─ Fallible Zswap offer (optional)
   └─ Contract calls (optional)
   
2. COMPUTE COMMITMENTS
   ├─ Each input/output committed
   ├─ Contract calls contribute
   └─ Binding randomness generated
   
3. GENERATE PROOFS
   ├─ Zero-knowledge proofs for circuits
   └─ Schnorr proof for integrity
   
4. SUBMIT TO NETWORK
   
5. NETWORK VALIDATES
   ├─ Verify integrity (Pedersen commitments)
   ├─ Verify ZK proofs
   └─ Check guaranteed parts succeed
   
6. EXECUTE
   ├─ Guaranteed Zswap: Always succeeds
   ├─ Fallible Zswap: May fail
   └─ Contract calls: Execute transcripts
   
7. FINALIZE
   ├─ Update ledger state
   ├─ Record on blockchain
   └─ Settle on Cardano base layer
```

---

## Transaction Types

### Type 1: Pure Zswap

**Components**:
- ✅ Guaranteed Zswap
- ❌ No fallible part
- ❌ No contract calls

**Use Case**: Simple shielded transfers

**Example**: Send tokens to friend

---

### Type 2: Zswap + Contract

**Components**:
- ✅ Guaranteed Zswap (optional)
- ✅ Fallible Zswap (optional)
- ✅ Contract calls

**Use Case**: Contract interaction with value transfer

**Example**: Place bet with tokens

---

### Type 3: Pure Contract Call

**Components**:
- ❌ No guaranteed Zswap
- ❌ No fallible Zswap
- ✅ Contract calls only

**Use Case**: State updates without value transfer

**Example**: Vote in election, increment counter

---

### Type 4: Contract Deployment

**Components**:
- ❌ No guaranteed Zswap
- ✅ Fallible Zswap (deployment)
- ❌ No contract calls

**Use Case**: Deploy new contract

**Example**: Launch new DApp

---

## Advanced Concepts

### Transaction Batching

**Multiple contract calls** in one transaction:

```
Transaction:
  contract_calls:
    1. Call Contract A / increment
    2. Call Contract B / decrement
    3. Call Contract A / getValue
```

**Atomicity**: All execute or none execute

---

### Cross-Contract Calls (Future)

**Current**: 🚧 Under development

**Vision**:
```compact
// Contract A
export circuit callContractB(): [] {
  const result = contractB.someFunction(param);
  useResult(result);
}
```

**Benefits**:
- Composability
- Complex workflows
- Atomic multi-contract operations

---

## Security Properties

### Guaranteed by Transaction Structure

1. **Value Conservation**
   - Inputs = Outputs (via Pedersen commitments)
   - Cannot create/destroy value
   - Cryptographically enforced

2. **Binding**
   - Transaction parts cryptographically linked
   - Cannot swap parts between transactions
   - Tamper-evident

3. **Atomicity**
   - Guaranteed parts always execute together
   - Fallible parts fail gracefully
   - Merged transactions are atomic

4. **Privacy**
   - Values hidden (Zswap)
   - Identities hidden (zero-knowledge)
   - Only transcripts public

---

## Practical Implications

### For DApp Developers

**Design Considerations**:
1. Split guaranteed vs fallible operations
2. Handle fallible failures gracefully
3. Plan for future cross-contract calls
4. Use atomic swaps for trustless exchange

---

### For Users

**What to expect**:
1. Some operations guaranteed to succeed
2. Some operations may fail (but you're not charged)
3. Atomic swaps are trustless
4. Privacy is maintained throughout

---

## Summary

### Transaction Structure

```
Transaction = Guaranteed Zswap
            + Fallible Zswap (optional)
            + Contract Calls (optional)
            + Integrity Commitments
            + Binding Randomness
```

### Key Features

✅ **Guaranteed execution** for critical operations  
✅ **Fallible execution** for conditional operations  
✅ **Atomic swaps** via merging  
✅ **Value conservation** via Pedersen commitments  
✅ **Binding** via Schnorr proofs  
✅ **Privacy** via zero-knowledge proofs  

### Future Enhancements

🚧 **Cross-contract calls**  
🚧 **More flexible merging**  
🚧 **Enhanced composability**  

---

## Related Documentation

- **[SMART_CONTRACTS_ON_MIDNIGHT.md](SMART_CONTRACTS_ON_MIDNIGHT.md)** - How contracts work
- **[HOW_MIDNIGHT_WORKS.md](HOW_MIDNIGHT_WORKS.md)** - Overall architecture
- **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - Writing contracts
- **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - Zswap functions

---

**Status**: ✅ Complete Transaction Structure Deep-Dive  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025
