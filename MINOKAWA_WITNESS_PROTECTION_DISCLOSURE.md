# Minokawa Explicit Disclosure - The "Witness Protection Program"

**Official Documentation**  
**Language**: Minokawa (Compact) 0.18.0  
**Compiler**: 0.26.0  
**Critical Privacy Feature**  
**Updated**: October 28, 2025

> 🔒 **The Key to Privacy in Midnight**: Understanding `disclose()` and witness data protection

---

## Table of Contents

1. [Introduction to Selective Disclosure](#introduction-to-selective-disclosure)
2. [What is Witness Data?](#what-is-witness-data)
3. [The disclose() Wrapper](#the-disclose-wrapper)
4. [Compiler Enforcement](#compiler-enforcement)
5. [Indirect Disclosure Detection](#indirect-disclosure-detection)
6. [Best Practices](#best-practices)
7. [Safe Standard Library Functions](#safe-standard-library-functions)
8. [How It Works: The Abstract Interpreter](#how-it-works-the-abstract-interpreter)

---

## Introduction to Selective Disclosure

### The Privacy Spectrum

**Traditional Blockchains**: Everything is public  
**Strict Privacy Blockchains**: Everything is private  
**Midnight**: **Selective disclosure** - private by default, public when explicitly declared

### Why Selective Disclosure?

Enables real-world use cases like banking:
- ✅ **Regulatory compliance**: Disclose data required by law
- ✅ **Privacy preservation**: Keep other information private
- ✅ **Flexibility**: Application-specific disclosure decisions

### The Problem

**Private information should only be disclosed when necessary**, but it's easy to accidentally leak private data.

### The Solution: Explicit Disclosure

**Minokawa requires explicit declaration** before:
- Storing witness data in the public ledger
- Returning witness data from exported circuits
- Passing witness data to another contract

**Result**: Privacy is the default, disclosure is an explicit exception

---

## What is Witness Data?

### Definition

**Witness data** (or **witness values**) is data that:
1. Comes from external callback functions (declared as `witness`)
2. Comes from exported circuit arguments
3. Comes from constructor arguments
4. **Is derived from any of the above**

### Sources of Witness Data

```compact
// 1. From witness functions
witness getSecret(): Field;
const secret = getSecret();  // ← Witness data!

// 2. From exported circuit parameters
export circuit process(privateInput: Field): [] {
  // privateInput is witness data!
}

// 3. From constructor parameters
constructor(initialSecret: Field) {
  // initialSecret is witness data!
}

// 4. Derived from witness data
const derived = secret * 2;  // ← Also witness data!
const transformed = hash(secret);  // ← Still witness data!
```

### Zero-Knowledge Proofs

A zk-proof proves properties about witness data **without disclosing the data itself**.

**Example**: Prove you know a secret that hashes to X, without revealing the secret.

---

## The disclose() Wrapper

### Syntax

```compact
disclose(expression)
```

**Effect**: Tells the compiler it's okay to disclose the value of the expression.

**Important**: `disclose()` does NOT cause disclosure - it only **declares intent to allow it**.

### Basic Example

```compact
import CompactStandardLibrary;

witness getBalance(): Bytes<32>;
export ledger balance: Bytes<32>;

export circuit recordBalance(): [] {
  // ✅ CORRECT: Explicitly declare disclosure
  balance = disclose(getBalance());
}
```

### Without disclose() - Compiler Error

```compact
import CompactStandardLibrary;

witness getBalance(): Bytes<32>;
export ledger balance: Bytes<32>;

export circuit recordBalance(): [] {
  // ❌ ERROR: Undeclared disclosure!
  balance = getBalance();
}
```

**Error Message**:
```
Exception: line 6 char 11:
  potential witness-value disclosure must be declared but is not:
    witness value potentially disclosed:
      the return value of witness getBalance at line 2 char 1
    nature of the disclosure:
      ledger operation might disclose the witness value
    via this path through the program:
      the right-hand side of = at line 6 char 11
```

---

## Compiler Enforcement

### The "Witness Protection Program"

The compiler's **witness protection program** tracks witness data flow through the entire program and **detects undeclared disclosures**.

### Disclosure Points

The compiler checks for witness data at:

1. **Ledger Operations**
   ```compact
   export circuit store(secret: Field): [] {
     ledgerValue = disclose(secret);  // Must disclose!
   }
   ```

2. **Exported Circuit Returns**
   ```compact
   export circuit get(): Field {
     return disclose(witnessValue);  // Must disclose!
   }
   ```

3. **Cross-Contract Calls**
   ```compact
   export circuit callOther(secret: Field): [] {
     otherContract.method(disclose(secret));  // Must disclose!
   }
   ```

### What the Compiler Tracks

The compiler knows when data **contains** or **is derived from** witness values:

```compact
witness getSecret(): Field;

export circuit example(): [] {
  const a = getSecret();        // Witness data
  const b = a + 10;             // Derived from witness data
  const c = b * 2;              // Still derived from witness data
  
  // ❌ ERROR: All of these need disclose()
  // ledgerValue = c;
  
  // ✅ CORRECT:
  ledgerValue = disclose(c);
}
```

---

## Indirect Disclosure Detection

### Example 1: Through Structures and Functions

```compact
import CompactStandardLibrary;

struct S { x: Field }

witness getBalance(): Bytes<32>;
export ledger balance: Bytes<32>;

circuit obfuscate(x: Field): Field {
  return x + 73;  // "Obfuscation" doesn't fool the compiler!
}

export circuit recordBalance(): [] {
  const s = S { x: getBalance() as Field };
  const x = obfuscate(s.x);
  // ❌ ERROR: Witness data flows through struct and circuit
  balance = x as Bytes<32>;
}
```

**Error Message**:
```
Exception: line 13 char 11:
  potential witness-value disclosure must be declared but is not:
    witness value potentially disclosed:
      the return value of witness getBalance at line 3 char 1
    nature of the disclosure:
      ledger operation might disclose the result of an addition 
      involving the witness value
    via this path through the program:
      the binding of s at line 11 char 3
      the argument to obfuscate at line 12 char 13
      the computation at line 7 char 10
      the binding of x at line 12 char 3
      the right-hand side of = at line 13 char 11
```

**The compiler traces the entire path!**

### Fixing with disclose()

You can place `disclose()` anywhere along the path:

**Option 1: At the source**
```compact
const s = S { x: disclose(getBalance()) as Field };
```

**Option 2: In the function**
```compact
circuit obfuscate(x: Field): Field {
  return disclose(x) + 73;
}
```

**Option 3: At the destination (BEST PRACTICE)**
```compact
balance = disclose(x as Bytes<32>);
```

---

### Example 2: Conditional Expressions

Even **comparisons** can leak witness data!

```compact
import CompactStandardLibrary;

witness getBalance(): Uint<64>;

export circuit balanceExceeds(n: Uint<64>): Boolean {
  // ❌ ERROR: Comparison result reveals info about witness!
  return getBalance() > n;
}
```

**Error Message**:
```
Exception: line 5 char 3:
  potential witness-value disclosure must be declared but is not:
    witness value potentially disclosed:
      the return value of witness getBalance at line 2 char 1
    nature of the disclosure:
      the value returned from exported circuit balanceExceeds might 
      disclose the result of a comparison involving the witness value
    via this path through the program:
      the comparison at line 5 char 10
```

**Why is this a disclosure?**  
The boolean result reveals whether `getBalance() > n`, which leaks information about the witness value!

**Fixed version**:
```compact
export circuit balanceExceeds(n: Uint<64>): Boolean {
  return disclose(getBalance() > n);
}
```

---

## Best Practices

### 1. Place disclose() Close to Disclosure Point

✅ **GOOD**: Minimal disclosure scope
```compact
export circuit store(secret: Field): [] {
  const processed = process(secret);
  ledgerValue = disclose(processed);  // Clear what's disclosed
}
```

❌ **LESS IDEAL**: Wider disclosure scope
```compact
export circuit store(secret: Field): [] {
  const processed = process(disclose(secret));  // Entire path disclosed
  ledgerValue = processed;
}
```

---

### 2. Disclose Only Necessary Portions

For structured values, disclose only what needs to be public:

```compact
struct Data {
  publicId: Field;
  privateSecret: Field;
}

witness getData(): Data;

export circuit storePartial(): [] {
  const data = getData();
  
  // ✅ GOOD: Disclose only public portion
  publicLedger = disclose(data.publicId);
  
  // privateSecret never disclosed!
}
```

---

### 3. Wrap Witnesses Returning Non-Private Data

If a witness **always** returns non-private data:

```compact
// This witness returns public configuration
witness getPublicConfig(): Field;

export circuit useConfig(): [] {
  // ✅ Disclose at source - it's always public
  const config = disclose(getPublicConfig());
  ledgerValue = config;
}
```

---

### 4. Document Disclosure Decisions

```compact
export circuit storeBalance(): [] {
  const balance = getBalance();
  
  // DISCLOSURE DECISION: Balance must be public for regulatory compliance
  // Risk: Links this transaction to account
  // Mitigation: Use periodic aggregation
  publicBalance = disclose(balance);
}
```

---

### 5. Use Commitment Schemes

When you need to prove you know a value without revealing it:

```compact
witness getSecret(): Field;

export circuit commitSecret(): [] {
  const secret = getSecret();
  const nonce = randomNonce();
  
  // ✅ Commitment is safe to disclose (doesn't reveal secret)
  const commitment = persistentCommit(secret, nonce);
  ledgerCommitment = disclose(commitment);
}
```

---

## Safe Standard Library Functions

The compiler recognizes that certain functions **sufficiently disguise** witness data:

### Implicitly Disclosing Functions

These functions **automatically disclose** their results:

```compact
witness getSecret(): Field;

export circuit example(): [] {
  const secret = getSecret();
  
  // ✅ These are automatically disclosed (no disclose() needed)
  const hash = transientHash(secret);
  const commitment = transientCommit(secret, nonce);
  
  ledgerHash = hash;  // OK!
  ledgerCommitment = commitment;  // OK!
}
```

### Safe Hash Functions

| Function | Auto-Disclosed? | Use Case |
|----------|-----------------|----------|
| `transientHash<T>(value: T)` | ✅ Yes | Non-persisted values |
| `transientCommit<T>(value: T, rand: Field)` | ✅ Yes | Non-persisted commitments |
| `persistentHash<T>(value: T)` | ✅ Yes | Ledger state |
| `persistentCommit<T>(value: T, rand: Bytes<32>)` | ✅ Yes | Ledger commitments |

**Why safe?**: Hash preimage resistance prevents revealing the original witness value.

---

## How It Works: The Abstract Interpreter

### Implementation

The "witness protection program" is implemented as an **abstract interpreter**.

### What is Abstract Interpretation?

Instead of running the program with actual values, the compiler runs it with **abstract values** representing:
- ✅ "This contains witness data"
- ❌ "This does NOT contain witness data"

### Tracking Witness Data Flow

```compact
witness getSecret(): Field;

export circuit flow(): [] {
  const a = getSecret();        // Abstract value: "contains witness"
  const b = a + 10;             // Propagate: "contains witness"
  const c = hash(b);            // Hash: "does NOT contain witness"
  const d = c + 5;              // "does NOT contain witness"
  
  ledger1 = a;                  // ❌ ERROR: witness data
  ledger2 = b;                  // ❌ ERROR: witness data
  ledger3 = c;                  // ✅ OK: hash disguises
  ledger4 = d;                  // ✅ OK: derived from hash
}
```

### Operation Propagation

The abstract interpreter modifies operations to propagate (or not) witness information:

| Operation | Propagates Witness Info? |
|-----------|--------------------------|
| Arithmetic (`+`, `-`, `*`) | ✅ Yes |
| Comparison (`<`, `>`, `==`) | ✅ Yes |
| Type cast | ✅ Yes |
| Hash function | ❌ No |
| Commitment | ❌ No |
| `disclose()` | ❌ No (explicitly) |

### Error Detection

When the interpreter encounters an undeclared disclosure:
1. Halt compilation
2. Produce error message with:
   - Source of witness data
   - Nature of disclosure
   - Path through the program

---

## Real-World Examples

### Example 1: Banking Compliance

```compact
witness getAccountBalance(): Uint<64>;
witness getAccountOwner(): Bytes<32>;

// Public for regulatory compliance
export ledger reportedBalance: Uint<64>;

// Private (not disclosed)
ledger internalData: Map<Bytes<32>, Field>;

export circuit reportBalance(): [] {
  const balance = getAccountBalance();
  const owner = getAccountOwner();
  
  // DISCLOSURE: Required by regulation
  reportedBalance = disclose(balance);
  
  // NO DISCLOSURE: Internal data stays private
  const ownerHash = persistentHash(owner);
  internalData.insert(ownerHash, someData);  // ownerHash auto-disclosed
}
```

---

### Example 2: Voting System

```compact
witness getVote(): Uint<8>;
witness getVoterId(): Bytes<32>;

export ledger voteCount: Counter;
ledger commitments: Set<Bytes<32>>;

export circuit castVote(): [] {
  const vote = getVote();
  const voterId = getVoterId();
  
  // DISCLOSURE: Vote affects public count
  if (disclose(vote == 1)) {
    voteCount += 1;
  }
  
  // NO DISCLOSURE: Voter identity stays private
  const voterCommitment = persistentHash(voterId);
  commitments.insert(voterCommitment);  // Auto-disclosed hash
}
```

---

### Example 3: Age Verification

```compact
witness getBirthdate(): Uint<64>;

export circuit verifyAge(minimumAge: Uint<64>, currentTime: Uint<64>): Boolean {
  const birthdate = getBirthdate();
  const age = currentTime - birthdate;
  
  // DISCLOSURE: Result reveals if user meets age requirement
  // (but NOT the actual age or birthdate!)
  return disclose(age >= minimumAge);
}
```

---

## Common Patterns

### Pattern 1: Public Index, Private Data

```compact
witness getPrivateData(): Field;

export ledger index: Counter;
ledger commitments: Map<Uint<64>, Bytes<32>>;

export circuit store(): [] {
  const data = getPrivateData();
  const idx = index.read();
  
  // DISCLOSURE: Index is public
  index += 1;
  
  // NO DISCLOSURE: Store commitment, not data
  const commitment = persistentHash(data);
  commitments.insert(disclose(idx), commitment);
}
```

---

### Pattern 2: Aggregate Statistics

```compact
witness getUserValue(): Uint<64>;

export ledger total: Uint<64>;
export ledger count: Counter;

export circuit addValue(): [] {
  const value = getUserValue();
  
  // DISCLOSURE: Aggregate total (not individual values)
  total = disclose(total + value);
  count += 1;
}
```

---

### Pattern 3: Threshold Proof

```compact
witness getAmount(): Uint<64>;

export circuit proveAboveThreshold(threshold: Uint<64>): [] {
  const amount = getAmount();
  
  // DISCLOSURE: Only reveals boolean result
  assert(disclose(amount >= threshold), "Below threshold");
  
  // Amount itself never disclosed!
}
```

---

## Debugging Disclosure Errors

### Understanding Error Messages

Error messages have three parts:

1. **Witness value potentially disclosed**:
   - Shows where the witness data originated

2. **Nature of the disclosure**:
   - Describes how the disclosure happens

3. **Via this path through the program**:
   - Shows the data flow path

### Strategy for Fixing

1. **Identify the source**: Where does witness data come from?
2. **Trace the path**: How does it flow through the program?
3. **Decide**: Should this data be disclosed?
   - **Yes**: Add `disclose()` at appropriate point
   - **No**: Don't store in ledger or return from circuit
4. **Use alternatives**: Consider commitments or hashes

---

## Security Implications

### What disclose() DOES

✅ **Makes disclosure explicit and deliberate**  
✅ **Prevents accidental leaks**  
✅ **Documents disclosure decisions in code**  

### What disclose() DOES NOT DO

❌ **Does not encrypt data**  
❌ **Does not hide data on-chain**  
❌ **Does not provide anonymity by itself**  

### Complete Privacy Requires

1. ✅ **Avoid unnecessary disclosure** (use `disclose()` sparingly)
2. ✅ **Use commitments** when possible
3. ✅ **Hash sensitive data** before disclosure
4. ✅ **Consider timing** (when disclosures happen)
5. ✅ **Design for privacy** from the start

---

## Quick Reference

### Disclosure Required At

- Ledger operations: `ledgerField = disclose(witness)`
- Exported circuit returns: `return disclose(witness)`
- Cross-contract calls: `other.call(disclose(witness))`

### Auto-Disclosed (No disclose() needed)

- `transientHash(witness)`
- `transientCommit(witness, nonce)`
- `persistentHash(witness)`
- `persistentCommit(witness, nonce)`

### Best Practice Locations

```compact
// ✅ BEST: At disclosure point
ledgerValue = disclose(processedWitness);

// ✅ OK: In helper function
circuit helper(w: Field): Field {
  return disclose(w);
}

// ⚠️ LESS IDEAL: At source (wider scope)
const data = disclose(getWitness());
```

---

## Relationship to AgenticDID Contracts

### Our Current Warnings

The privacy warnings we're seeing in our contracts are the "Witness Protection Program" in action!

```compact
// Our contracts have these warnings:
export circuit registerAgent(
  caller: ContractAddress,  // Witness data!
  did: Bytes<32>,           // Witness data!
  ...
): [] {
  // ❌ WARNING: Storing witness without disclosure
  agentCredentials.insert(did, credential);
}
```

### How to Fix for Production

```compact
export circuit registerAgent(
  caller: ContractAddress,
  did: Bytes<32>,
  publicKey: Bytes<64>,
  ...
): [] {
  // ✅ CORRECT: Explicitly disclose public parameters
  agentCredentials.insert(
    disclose(did),
    AgentCredential {
      did: disclose(did),
      publicKey: disclose(publicKey),
      ...
    }
  );
}
```

---

## Conclusion

The `disclose()` mechanism in Minokawa enforces **deliberate programming decisions** when dealing with potentially sensitive private witness data.

### Key Principles

1. **Privacy by default**: Witness data is private unless explicitly disclosed
2. **Explicit disclosure**: Must use `disclose()` to allow disclosure
3. **Compiler enforcement**: "Witness Protection Program" detects violations
4. **Track derivation**: Compiler follows witness data through entire program
5. **Safe functions**: Hash/commit automatically disclose safely

### Benefits

✅ **Reduces accidental disclosure**  
✅ **Makes privacy decisions explicit**  
✅ **Documents disclosure reasons**  
✅ **Enables selective disclosure**  
✅ **Supports regulatory compliance**  

---

**Status**: ✅ Complete Witness Protection / Disclosure Reference  
**Source**: Official Midnight Documentation  
**Version**: Minokawa 0.18.0  
**Last Updated**: October 28, 2025

**Critical for**: Production deployment of privacy-preserving contracts
