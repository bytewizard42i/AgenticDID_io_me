# How Midnight Works

**Overview of Midnight's Architecture and Approach**  
**Network**: Testnet_02  
**Status**: Testnet (features may change)  
**Updated**: October 28, 2025

> 🌙 **Understanding Midnight's unique approach to privacy-preserving smart contracts**

---

## Introduction

This document provides an overview of how Midnight functions, covering:

1. **Midnight's approach to smart contracts** - Why it's different
2. **Why this approach is useful** - Benefits of selective disclosure
3. **How to make it work for you** - Practical development patterns
4. **Technical details** - Blockchain, transactions, and ledger states

---

## ⚠️ Important Notice

**Midnight currently functions on Testnet.**

Features may be:
- ✅ Added
- ⚠️ Removed
- 🔄 Revised

**At any time** without prior notice.

**Always refer to**: Latest documentation at docs.midnight.network

---

## Midnight's Approach to Smart Contracts

### The Traditional Blockchain Problem

**Traditional Blockchains** (e.g., Bitcoin, Ethereum):
- ❌ Everything is **public**
- ❌ All transaction details visible
- ❌ All contract state visible
- ❌ No privacy by default

**Privacy Blockchains** (e.g., Zcash, Monero):
- ✅ Everything is **private**
- ❌ But **no flexibility**
- ❌ Can't selectively disclose
- ❌ Compliance challenges

---

### Midnight's Solution: Selective Disclosure

**The Best of Both Worlds**:

```
Traditional        Privacy         Midnight
Blockchain         Blockchain      
    ↓                  ↓               ↓
[Public]          [Private]    [Privacy by Default]
                                      +
                               [Selective Disclosure]
```

**Key Innovation**: 
- 🔒 **Privacy by default** - Everything is private
- 🔓 **Selective disclosure** - Choose what to make public
- ⚖️ **Compliance-ready** - Meet regulatory requirements
- 🎯 **Application-specific** - Each DApp decides

---

## Why This Approach is Useful

### Real-World Use Cases

#### 1. Banking & Finance

**Problem**: Need to comply with regulations while protecting customer privacy

**Midnight Solution**:
```compact
// Private by default
witness getAccountBalance(): Uint<64>;
witness getAccountOwner(): Bytes<32>;

// Selectively disclose for compliance
export ledger reportedBalance: Uint<64>;  // Public for regulators

export circuit reportBalance(): [] {
  const balance = getAccountBalance();
  const owner = getAccountOwner();
  
  // DISCLOSED: Required by regulation
  reportedBalance = disclose(balance);
  
  // PRIVATE: Customer identity stays confidential
  const ownerHash = persistentHash(owner);
  internalData.insert(ownerHash, someData);
}
```

**Benefits**:
- ✅ Regulatory compliance (disclose required data)
- ✅ Customer privacy (everything else private)
- ✅ Audit trail (cryptographic proofs)

---

#### 2. Voting Systems

**Problem**: Need verifiable elections while protecting voter privacy

**Midnight Solution**:
```compact
witness getVote(): Uint<8>;
witness getVoterId(): Bytes<32>;

export ledger voteCount: Counter;  // Public tally
ledger voterCommitments: Set<Bytes<32>>;  // Private voters

export circuit castVote(): [] {
  const vote = getVote();
  const voterId = getVoterId();
  
  // DISCLOSED: Vote affects public count
  if (disclose(vote == 1)) {
    voteCount += 1;
  }
  
  // PRIVATE: Voter identity hidden
  const commitment = persistentHash(voterId);
  voterCommitments.insert(commitment);
}
```

**Benefits**:
- ✅ Transparent vote counts
- ✅ Anonymous voters
- ✅ Verifiable results

---

#### 3. Supply Chain

**Problem**: Share necessary data with partners while protecting trade secrets

**Midnight Solution**:
```compact
witness getProductDetails(): ProductInfo;

export ledger shipmentStatus: Map<Bytes<32>, Status>;  // Public
ledger internalCosts: Map<Bytes<32>, Uint<64>>;  // Private

export circuit updateShipment(id: Bytes<32>): [] {
  const details = getProductDetails();
  
  // DISCLOSED: Partners see shipment status
  shipmentStatus.insert(disclose(id), Status.SHIPPED);
  
  // PRIVATE: Costs stay confidential
  const costHash = persistentHash(details.cost);
  internalCosts.insert(id, costHash);
}
```

**Benefits**:
- ✅ Transparent to partners
- ✅ Trade secrets protected
- ✅ Competitive advantage maintained

---

## How to Make It Work for You

### The Three-Part Architecture

Every Midnight smart contract has **three components**:

```
┌─────────────────────────────────────────┐
│  1. PUBLIC LEDGER (On-Chain)            │
│  • Replicated across network            │
│  • Visible to everyone                  │
│  • Declared with `ledger` keyword       │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  2. ZERO-KNOWLEDGE CIRCUIT (Proof)      │
│  • Proves correctness                   │
│  • WITHOUT revealing private data       │
│  • Compiled from `circuit` definitions  │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  3. LOCAL STATE (Off-Chain)             │
│  • Runs on user's machine               │
│  • Completely private                   │
│  • Accessed via `witness` functions     │
└─────────────────────────────────────────┘
```

---

### Development Pattern

#### Step 1: Design Your Privacy Model

**Ask yourself**:
- What **must** be public? (regulatory, transparency)
- What **should** be private? (user data, business logic)
- What **can** be selectively disclosed? (case-by-case)

---

#### Step 2: Implement with Minokawa

```compact
pragma language_version >= 0.17.0;
import CompactStandardLibrary;

// PUBLIC: Visible to all
export ledger publicData: Uint<64>;

// PRIVATE: Never disclosed
ledger privateData: Map<Bytes<32>, Bytes<32>>;

// WITNESS: User provides privately
witness getUserSecret(): Field;

// CIRCUIT: Proves correctness
export circuit processData(): [] {
  const secret = getUserSecret();
  
  // Disclose what's necessary
  publicData = disclose(computePublicValue(secret));
  
  // Keep the rest private
  const secretHash = persistentHash(secret);
  privateData.insert(secretHash, someValue);
}
```

---

#### Step 3: Test Privacy Properties

**Verify**:
- ✅ Private data never leaks to ledger
- ✅ Witness data properly protected
- ✅ Disclosure is intentional and documented
- ✅ Zero-knowledge proofs work correctly

**Tools**:
- Compiler warnings (witness-value disclosure)
- Test framework
- Proof verification

---

## Technical Details

### Midnight Blockchain Architecture

#### Layer Structure

```
┌────────────────────────────────────────┐
│  Midnight Layer (Smart Contracts)      │
│  • Minokawa contracts                  │
│  • Zero-knowledge proofs               │
│  • Privacy-preserving state            │
└────────────────────────────────────────┘
              ↕
┌────────────────────────────────────────┐
│  Cardano Base Layer                    │
│  • Settlement & finality               │
│  • Consensus (Ouroboros)               │
│  • Native token (ADA)                  │
└────────────────────────────────────────┘
```

**Why Cardano?**
- ✅ Proven security (peer-reviewed)
- ✅ Sustainability (energy-efficient)
- ✅ Scalability (Ouroboros protocol)
- ✅ Interoperability (partner chains)

---

### Transaction Structure

A Midnight transaction contains:

1. **Zero-Knowledge Proof**
   - Proves transaction is valid
   - WITHOUT revealing private inputs
   - Generated from circuit execution

2. **Public State Updates**
   - Changes to ledger fields
   - Visible to all nodes
   - Verified against proof

3. **Shielded Coin Operations** (Optional)
   - Private value transfers
   - Zswap protocol
   - Coin commitments & nullifiers

---

### Ledger State

The Midnight ledger maintains:

```compact
// Contract State (per contract)
{
  contractAddress: ContractAddress,
  ledgerFields: {
    publicData: Value,
    counters: Map<Name, Uint<64>>,
    maps: Map<Name, Map<K,V>>,
    ...
  }
}

// Global State
{
  contracts: Map<ContractAddress, ContractState>,
  coinCommitments: MerkleTree,
  nullifiers: Set<Bytes<32>>,
  blockHeight: Uint<64>,
  blockTime: Uint<64>
}
```

---

### Transaction Semantics

#### Execution Flow

1. **User submits transaction**
   - Calls exported circuit
   - Provides witness data locally
   
2. **Circuit executes**
   - Computes using witnesses
   - Updates ledger fields
   - Generates proof
   
3. **Network validates**
   - Verifies zero-knowledge proof
   - Checks state transitions
   - Updates ledger
   
4. **Finality**
   - Transaction settled on Cardano
   - Permanent and irreversible

---

#### Proof Generation

```
User Machine                Network Nodes
     │                           │
     │  1. Execute circuit       │
     │     (with witnesses)      │
     │                           │
     │  2. Generate ZK proof     │
     │                           │
     │  3. Submit tx + proof ──→ │
     │                           │
     │                     4. Verify proof
     │                        (no witnesses!)
     │                           │
     │                     5. Apply state
     │                        updates
     │                           │
     │  ←─── 6. Confirmation ─── │
```

**Key Points**:
- 🔒 Witnesses **never leave** user's machine
- ✅ Proof is **publicly verifiable**
- 🚀 Verification is **fast** (constant time)
- 🔐 Privacy is **cryptographically guaranteed**

---

## Privacy Guarantees

### What's Private

**Guaranteed Private** (Never Disclosed):
- ✅ Witness function outputs
- ✅ Circuit parameters (if not exported)
- ✅ Intermediate computations
- ✅ Data NOT in ledger fields
- ✅ Data NOT in circuit returns

**Example**:
```compact
witness getSecret(): Field;

circuit processSecret(): Field {
  const secret = getSecret();
  const intermediate = secret * 2;  // Private!
  const result = intermediate + 10; // Private!
  return result;  // Only result leaves circuit
}
```

---

### What's Public

**Always Public**:
- ❌ Ledger field values
- ❌ Exported circuit return values
- ❌ Block height, block time
- ❌ Transaction existence
- ❌ Contract address

**Disclosed with `disclose()`**:
- ⚠️ Explicitly disclosed witness data
- ⚠️ Derived values marked for disclosure

---

### Selective Disclosure Mechanism

**Compiler Enforcement**:
```compact
witness getBalance(): Uint<64>;
export ledger balance: Uint<64>;

// ❌ COMPILER ERROR
export circuit wrong(): [] {
  balance = getBalance();  // Missing disclose()!
}

// ✅ CORRECT
export circuit correct(): [] {
  balance = disclose(getBalance());  // Explicit!
}
```

**See**: MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md

---

## Performance Characteristics

### Proof Generation

**Factors**:
- Circuit complexity (operations)
- Ledger operations (reads/writes)
- Witness data size

**Typical Times** (on modern hardware):
- Simple circuits: < 1 second
- Medium circuits: 1-10 seconds
- Complex circuits: 10-60 seconds

**Optimization**:
- Use `--skip-zk` during development
- Minimize ledger operations
- Batch updates when possible

---

### Proof Verification

**Constant Time**: ~50-200ms regardless of circuit complexity

**Why?** 
- ZK proofs have **constant size**
- Verification is **not dependent** on circuit size
- Makes blockchain scalable

---

### State Size

**On-Chain Storage**:
- Ledger fields (per contract)
- Coin commitments (Merkle tree)
- Nullifiers (set)

**Off-Chain Storage**:
- Witness data (user's machine)
- Historical proofs (optional)
- Merkle tree paths (for coins)

---

## Security Model

### Threat Model

**Protected Against**:
- ✅ **Eavesdropping**: Private data encrypted
- ✅ **Inference**: Zero-knowledge proofs reveal nothing
- ✅ **Tampering**: Cryptographic integrity
- ✅ **Replay**: Nullifiers prevent reuse

**Assumptions**:
- User's machine is secure
- Witnesses are implemented correctly
- Cryptographic primitives are sound

---

### Best Practices

1. **Never trust witness data**
   ```compact
   witness untrustedInput(): Field;
   
   export circuit process(): [] {
     const input = untrustedInput();
     // ALWAYS validate!
     assert(input < 1000, "Invalid input");
   }
   ```

2. **Use commitments for deferred disclosure**
   ```compact
   const commitment = persistentCommit(secret, nonce);
   ledgerCommitment = disclose(commitment);
   // Later: reveal secret and nonce
   ```

3. **Minimize ledger operations**
   - Fewer operations = smaller proofs
   - Batch updates when possible

4. **Test privacy properties**
   - Verify no unintended disclosure
   - Review compiler warnings
   - Audit code

---

## Interoperability

### Cross-Contract Calls

Contracts can call other contracts:

```compact
// Contract A
export circuit callContractB(addr: ContractAddress): [] {
  // Secure cross-contract communication
  kernel.claimContractCall(addr, entryPoint, commitment);
}
```

**Features**:
- ✅ Data integrity (communications commitment)
- ✅ Atomic execution (all or nothing)
- ✅ Privacy preservation (selective disclosure)

---

### Cardano Integration

**Base Layer Benefits**:
- Settlement finality
- Native token support
- Existing infrastructure
- Proven security

**Midnight Benefits**:
- Privacy-preserving contracts
- Zero-knowledge proofs
- Selective disclosure
- Programmable privacy

---

## Comparison with Other Platforms

| Feature | Ethereum | Zcash | Midnight |
|---------|----------|-------|----------|
| **Privacy** | None | Full | Selective |
| **Smart Contracts** | Yes | Limited | Yes |
| **Compliance** | Hard | Hard | Easy |
| **Disclosure** | All | None | Configurable |
| **Programmability** | High | Low | High |
| **Proof Type** | None | ZK-SNARK | ZK-SNARK |
| **Performance** | Fast | Slow | Medium |

---

## Future Development

### Testnet Phase

**Current Status**: Testnet_02
- Features may change
- Breaking changes possible
- Testing and feedback encouraged

**Goals**:
- Validate architecture
- Gather developer feedback
- Optimize performance
- Improve developer experience

---

### Mainnet Readiness

**Before Mainnet**:
- [ ] Security audits
- [ ] Performance optimization
- [ ] API stabilization
- [ ] Documentation completion
- [ ] Tooling maturity
- [ ] Community testing

---

## Related Documentation

### Essential Reading

- **[MIDNIGHT_DEVELOPMENT_OVERVIEW.md](MIDNIGHT_DEVELOPMENT_OVERVIEW.md)** - Master index
- **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - Language specification
- **[MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md](MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)** - Privacy mechanism
- **[MIDNIGHT_NETWORK_SUPPORT_MATRIX.md](MIDNIGHT_NETWORK_SUPPORT_MATRIX.md)** - Component versions

---

## Summary

### Key Takeaways

1. **Selective Disclosure** = Privacy + Flexibility
   - Private by default
   - Public by choice
   - Compliance-ready

2. **Three-Part Architecture**
   - Public ledger (on-chain)
   - Zero-knowledge proofs (verification)
   - Local state (private)

3. **Developer Control**
   - You decide what's public
   - Compiler enforces privacy
   - Cryptography guarantees security

4. **Real-World Ready**
   - Banking, voting, supply chain
   - Regulatory compliance
   - Business confidentiality

---

**Status**: ✅ Complete "How Midnight Works" Overview  
**Network**: Testnet_02  
**Last Updated**: October 28, 2025

**Ready to build the future of privacy-preserving applications!** 🌙✨
