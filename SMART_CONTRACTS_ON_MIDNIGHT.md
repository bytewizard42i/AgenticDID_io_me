# Smart Contracts on Midnight

**Deep Technical Explanation**  
**Network**: Testnet_02  
**Updated**: October 28, 2025

> 🔐 **Understanding how Midnight's privacy-preserving smart contracts actually work**

---

## Introduction

Designing smart contracts for **data protection** provides unique challenges and perspectives. This document explains how Midnight differs from public smart contract solutions and how this should inform contract construction.

---

## Replicated State Machines

### Core Concept

All blockchain systems are **replicated state machines**:
- Keep a **ledger state**
- Modified by **transactions**
- Different blockchains have different validity criteria

### Smart Contract Blockchains

**Account Model**:
- Contracts deployed by transaction
- Assigned unique address
- Define validation criteria
- Define state transitions

---

## Traditional Smart Contracts (Public)

### Example: Guessing Game

**Concept**: Players guess factors of a number. Correct guess lets you set the next number.

**Pseudocode** (NOT real Compact):
```javascript
def guess_number(guess_a, guess_b, new_a, new_b):
  assert(guess_a != 1 and guess_b != 1 and new_a != 1 and new_b != 1,
    "1 is too boring a factor")
  assert(guess_a * guess_b == number,
    "Guessed factors must be correct")
  number = new_a * new_b
```

**Why factors?** Prevents players from setting prime numbers (which would spoil the game).

---

### On-Chain State (Traditional)

```yaml
contracts:
  "<contract address>":
    state:
      number: 35
    entryPoints:
      guess_number: |
        def guess_number(...):
          // code here
```

---

### Transaction (Traditional)

```yaml
transaction:
  type: "call"
  address: "<contract address>"
  entryPoint: "guess_number"
  inputs: [5, 7, 2, 6]  # guess_a, guess_b, new_a, new_b
```

**Processing**:
1. Look up state at address
2. Look up program at address/entryPoint
3. Run program against state and inputs
4. If succeeds, store new state

---

### The Privacy Problem

**Issue**: Transaction inputs are **public**!

```yaml
inputs: [5, 7, 2, 6]
```

Anyone can see:
- ✅ Guess: 5 × 7 = 35 (correct!)
- ✅ Next number: 2 × 6 = 12
- ❌ **No privacy** - next player knows the factors!

**Where's the sport in that?**

---

## Midnight Contracts (Conceptual)

### The Key Innovation

**Don't worry about blockchain processing.** Instead, imagine a contract as an **interactive program** that can:
- ✅ Interact with on-chain state
- ✅ Call arbitrary code on **user's local machine**

---

### Reimagined Pseudocode

```javascript
def guess_number():
  // Get guess from local machine (PRIVATE!)
  (a, b) = local.guess_factors(number)
  assert(a != 1 and b != 1, "1 is too boring a factor")
  assert(a * b == number, "Guessed factors must be correct")
  
  // Get new challenge from local machine (PRIVATE!)
  (a, b) = local.new_challenge()
  assert(a != 1 and b != 1, "1 is too boring a factor")
  number = a * b
```

**Benefits**:
- ✅ API is clear (`local.guess_factors(number)`)
- ✅ Factors come from local machine
- ✅ **Nothing revealed to blockchain**

---

### On-Chain Interactions

Only these operations touch the chain:
1. **Read** `number` ledger field
2. **Write** `number` ledger field

**Critically**: Neither reveals the factors!
- Not the guessed factors
- Not the new challenge factors

---

### The Challenge

**How do we ensure correctness?**

**Local calls**: Accepted risk (we validate output, not implementation)

**Contract program**: Must **prove** to others:
- Ran the correct program
- State changes are valid
- **Without revealing private data**

---

## Transcripts and Zero-Knowledge SNARKs

### What is a ZK-SNARK?

**Zero-Knowledge Succinct Non-Interactive Argument of Knowledge**

**Core Idea**: Prove you know values for variables that satisfy mathematical conditions
- Some variables are **public**
- Most variables are **private**

---

### Three-Part Architecture

Every Midnight program splits into:

```
┌─────────────────────────────────────┐
│  1. LOCAL PART                      │
│  • Runs on user's machine           │
│  • Completely private                │
│  • Witness functions                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. IN-CIRCUIT CODE (GLUE)          │
│  • Connects local and ledger        │
│  • Core program logic               │
│  • Converted to ZK-SNARK            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. LEDGER PART                     │
│  • Runs on-chain                    │
│  • Public operations                │
│  • State updates                    │
└─────────────────────────────────────┘
```

---

### Example: Factoring 35 → 12

**Scenario**: Factor current state (35) into 5 × 7, replace with 2 × 6 = 12

#### Off-Chain Code (Local)

```javascript
(a, b) = local.guess_factors(n1)  // Returns: (5, 7)
(a, b) = local.new_challenge()     // Returns: (2, 6)
```

**Private Transcript**:
```
a1 = 5
b1 = 7
a2 = 2
b2 = 6
```

**These values NEVER leave the user's machine!**

---

#### In-Circuit Code (Glue)

```javascript
def guess_number():
  assert(a != 1 and b != 1, "...")
  assert(a * b == n2, "...")
  assert(a != 1 and b != 1, "...")
  n3 = a * b
```

**Circuit Constraints**:
```
guess_number:
  inputs:
    public: n1, n2, n3, transcript_code
    private: a1, b1, a2, b2
  constraints:
    a1 != 1
    b1 != 1
    a1 * b1 = n2  // 5 × 7 = 35 ✓
    a2 != 1
    b2 != 1
    n3 = a2 * b2  // 2 × 6 = 12 ✓
    // Additional constraints enforcing
    // the shape of the public transcript
```

---

#### On-Chain Code (Ledger)

```javascript
n1 = number           // Read: 35
n2 = number           // Read: 35
number = n3           // Write: 12
```

**Public Transcript**:
```
n1 = 35
n2 = 35
n3 = 12

assert(n1 == number)  // Verify read
assert(n2 == number)  // Verify read
number = n3           // Apply write
```

---

### The Power of ZK-SNARKs

**The Proof Shows**:
- ✅ For public values n1=35, n2=35, n3=12
- ✅ We **know** private values a1, b1, a2, b2
- ✅ That satisfy all the constraints

**The Proof Does NOT Show**:
- ❌ What a1, b1, a2, b2 actually are
- ❌ How they were computed
- ❌ Anything beyond "constraints are satisfied"

**This is exactly what we want!**

---

## Midnight Transaction Structure

### On-Chain State

```yaml
contracts:
  "<contract address>":
    state:
      number: 35
    entryPoints:
      guess_number: "<verifier key>"  # NOT the code!
```

**Note**: Instead of storing code, we store a **cryptographic verifier key** that can verify ZK-SNARKs for this circuit.

---

### Transaction Example

```yaml
transaction:
  type: "call"
  address: "<contract address>"
  entryPoint: "guess_number"
  transcript: |
    n1 = 35
    n2 = 35
    n3 = 12
    assert(n1 == number)
    assert(n2 == number)
    number = n3
  proof: "<zero-knowledge proof>"
```

**Components**:
1. **Public transcript** - Bytecode of ledger operations
2. **Zero-knowledge proof** - Proves transcript is valid

---

### Verification Process

When transaction is processed:

1. **Load verifier key** from contract's `guess_number` entry point
2. **Verify proof** against verifier key
   - Cryptographically checks all circuit constraints
   - Does **NOT** require private values
3. **Run transcript**:
   - `assert(n1 == number)` - Check current state is 35
   - `assert(n2 == number)` - Check again
   - `number = n3` - Update to 12
4. **Success**: State updated to 12
5. **Failure**: If proof invalid or asserts fail

**Crucially**: No one learns the factors (5, 7, 2, 6)!

---

### Why Double-Check the Number?

**Question**: Why read `number` twice as n1 and n2?

**Answer**: In this simple example, it's redundant. But:
- ZK proof doesn't "know" what a read operation is
- Doesn't know n1 and n2 are necessarily the same
- This generality allows **arbitrary operations**:
  - `counter.increment()` - More complex than read+write
  - `map.insert()` - Has side effects
  - `merkleTree.checkRoot()` - Complex validation

**Benefit**: Operations like `increment` are **atomic** and less prone to failure than manual read-modify-write sequences.

---

## Public vs Private Transcripts

### Private Transcript

**Contains**:
- Witness values (from local machine)
- Intermediate computations
- Private data

**Example**:
```
a1 = 5
b1 = 7
a2 = 2
b2 = 6
```

**Never leaves user's machine!**

---

### Public Transcript

**Contains**:
- Ledger operations (reads, writes)
- Public values
- Encoded as bytecode

**Example**:
```
n1 = 35           // Read operation
n2 = 35           // Read operation
n3 = 12           // Result to write
assert(n1 == number)
assert(n2 == number)
number = n3       // Write operation
```

**Included in transaction, visible to all!**

---

### Circuit Constraints

**Enforces relationship** between public and private transcripts:

```
Public: n1, n2, n3
Private: a1, b1, a2, b2

Constraints:
  a1 * b1 = n2  // Private factors multiply to public number
  n3 = a2 * b2  // Public result from private factors
```

**The proof says**: "I know private values that satisfy these equations."

---

## Putting Value at Stake

### The Challenge

How do we transfer value in a privacy-preserving way?

**Traditional blockchains**: Easy - contracts have visible balances

**Midnight**: Need to preserve privacy of:
- ✅ Token values
- ✅ Token types
- ✅ Fund holders

---

### Zswap - Shielded Tokens

**Midnight's Solution**: Zswap (similar to UTXOs)

**Shielded Properties**:
- ✅ Token values - Hidden
- ✅ Token types - Hidden
- ✅ Holders - Hidden

**Exception**: Contract holdings are **linked to contract** (but still shielded)

---

### Coins in Contracts

**Represented as**: Individual coin data structures

**Lifecycle**:
1. **Created** - Just data
2. **Received** - `builtin.receive(coin)` - explicit action
3. **Stored** - In contract state (public, encrypted, or private)
4. **Sent** - `builtin.send(coin, recipient)` - explicit action

**Key Point**: Contract decides how to handle coins (public or private storage)

---

### Special Coin Semantics

**Receive and Send**:
- Recorded in **public transcript**
- **No effect** on contract state directly
- Require corresponding **inputs/outputs** in transaction

**Ensures**:
- ✅ Can't receive funds that don't exist
- ✅ Can't send funds you don't have
- ✅ Value conservation

---

### Enhanced Guessing Game with Wagers

**Pseudocode**:
```javascript
def guess_number(new_wager):
  // Get guess from local
  (a, b) = local.guess_factors(number)
  
  // Winner gets the wager!
  builtin.send(wager, local.self())
  
  // Validate guess
  assert(a != 1 and b != 1, "1 is too boring a factor")
  assert(a * b == number, "Guessed factors must be correct")
  
  // Set new challenge
  (a, b) = local.new_challenge()
  assert(a != 1 and b != 1, "1 is too boring a factor")
  number = a * b
  
  // Receive new wager
  builtin.receive(new_wager)
  wager = new_wager
```

**Flow**:
1. Correct guess → Send previous wager to winner
2. Set new number
3. Receive new wager for next round

---

## Factoring and Cryptography

### Why Factoring Matters

**The example is NOT arbitrary!**

**RSA Cryptography**:
- Based on difficulty of factoring large integers
- Knowing factors = knowing private key
- Public key = product of two large primes

**The Game**:
- Guessing factors = proving you know RSA private key
- Without revealing the key itself

---

### Zero-Knowledge Authentication

**Power of ZK Proofs**:
- ✅ Prove you know a secret key
- ✅ Prove same person did multiple actions
- ✅ Effectively "sign" transactions
- ✅ Without ever revealing the secret

**Alternative (More Efficient)**:
```compact
// Prove knowledge of hash preimage
// pk = H(sk)
// Prove you know sk such that hash(sk) == pk
```

This is **simpler** than factoring for most authentication use cases.

---

## Advanced Concepts

### Complex Programs

**Also translatable to circuits**:
- ✅ Function calls
- ✅ Conditionals (if/else)
- ✅ Iterations (loops)
- ✅ Complex primitives (hash functions)

**See**: Writing a contract section in MINOKAWA_LANGUAGE_REFERENCE.md

---

### Public Transcript Encoding

**Bytecode Format**:
- Operations encoded as bytecode
- Shape enforced by circuit constraints
- See Impact VM for detailed encoding

**Advanced Reading**: Impact (Midnight's on-chain VM)

---

### Why "Circuits"?

**Name Origin**: Compilation of zero-knowledge proofs has similarities with assembling **special-purpose logic circuits** in hardware.

**Circuit** = Mathematical constraints that can be verified

---

## Key Takeaways

### Privacy Through Computation

**Traditional**:
```
Inputs (public) → Program (public) → Outputs (public)
```

**Midnight**:
```
Inputs (PRIVATE) → Program (verified) → Outputs (SELECTIVE)
                        ↓
               Zero-Knowledge Proof
                  (public, verifiable)
```

---

### Three Transcripts

1. **Private Transcript**
   - Witness values
   - Never leaves user's machine
   - Example: `a1=5, b1=7, a2=2, b2=6`

2. **Public Transcript**
   - Ledger operations
   - Visible to all
   - Example: `n1=35, n2=35, n3=12`

3. **Circuit Constraints**
   - Mathematical relationships
   - Enforced by verifier key
   - Example: `a1 * b1 = n2`

---

### The Promise

**Zero-Knowledge Proof Says**:
> "I know private values that, when combined with public values, satisfy all the circuit's constraints."

**Skeptical Users Get**:
- ✅ Cryptographic guarantee of correctness
- ✅ No knowledge of private values
- ✅ Confidence in program execution
- ✅ Privacy preservation

---

## Practical Implications for Developers

### Design Pattern

When building Midnight contracts:

1. **Identify Private Data**
   - What must stay secret?
   - What witnesses do I need?

2. **Identify Public Data**
   - What must be visible?
   - What goes in ledger?

3. **Design Circuits**
   - How do private and public interact?
   - What constraints ensure correctness?

4. **Implement Witnesses**
   - How does user provide private data?
   - What validation is needed?

---

### Example: AgenticDID

**Private**:
- Agent's actual DID (can be)
- Secret keys
- Internal credentials

**Public**:
- Agent registrations (selective)
- Delegations
- Verification results

**Circuits**:
- `registerAgent` - Prove valid credential
- `verifyCredential` - Prove knowledge without revealing
- `createDelegation` - Prove authority

---

## Related Documentation

- **[HOW_MIDNIGHT_WORKS.md](HOW_MIDNIGHT_WORKS.md)** - High-level architecture
- **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - Language details
- **[MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md](MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)** - Privacy mechanism
- **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - API functions

---

## Summary

**Midnight Smart Contracts** = **Interactive Programs** with:
- 🔒 **Private local computation** (witnesses)
- 🔐 **Zero-knowledge proofs** (circuits)
- 📝 **Public ledger operations** (transcripts)

**Enables**:
- ✅ Privacy by default
- ✅ Selective disclosure
- ✅ Cryptographic guarantees
- ✅ Regulatory compliance
- ✅ Real-world applications

**The Future**: Privacy-preserving smart contracts for everyone! 🌙✨

---

**Status**: ✅ Complete Technical Deep-Dive  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025
