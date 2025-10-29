# Midnight Network - Complete Reference for AI Assistants

**Purpose**: Comprehensive quick-reference guide for AI assistants working with Midnight Network  
**Target**: NightAgent, Claude, GPT, and other AI development assistants  
**Status**: ✅ Complete - All documentation indexed and summarized  
**Last Updated**: October 28, 2025

---

## 🎯 Quick Access - Most Important Documents

### For Smart Contract Development
1. **[i_am_Midnight_LLM_ref.md](i_am_Midnight_LLM_ref.md)** - Compact Runtime API (70+ functions)
2. **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - Complete language guide
3. **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - Standard library (all functions)
4. **[MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md](MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)** - Privacy (`disclose()`)

### For Application Development
1. **[MIDNIGHT_JS_API_REFERENCE.md](MIDNIGHT_JS_API_REFERENCE.md)** - Framework (8 packages)
2. **[MIDNIGHT_JS_CONTRACTS_API.md](MIDNIGHT_JS_CONTRACTS_API.md)** - Contract interaction (20+ functions)
3. **[LEDGER_API_REFERENCE.md](LEDGER_API_REFERENCE.md)** - Transaction API (129 items)
4. **[DAPP_CONNECTOR_API_REFERENCE.md](DAPP_CONNECTOR_API_REFERENCE.md)** - Wallet integration

### For Architecture Understanding
1. **[HOW_MIDNIGHT_WORKS.md](HOW_MIDNIGHT_WORKS.md)** - Platform overview
2. **[PRIVACY_ARCHITECTURE.md](PRIVACY_ARCHITECTURE.md)** - Privacy model
3. **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction details

---

## 📚 Complete API Coverage Summary

### Compact Runtime API (i_am_Midnight_LLM_ref.md)
**70+ Functions Documented**:
- `persistentHash()`, `persistentCommit()` - Ledger hashing (auto-disclosed)
- `transientHash()`, `transientCommit()` - Non-ledger hashing
- `ecAdd()`, `ecMul()`, `ecMulGenerator()` - Elliptic curve ops
- `createZswapInput()`, `createZswapOutput()` - Coin operations
- `ownPublicKey()`, `burnAddress()` - Identity operations
- `blockTimeLt()`, `blockTimeGte()` - Time checks
- Plus 50+ more functions for types, Merkle trees, coin management

**Key Insight**: Hash functions are **auto-disclosed** - no `disclose()` wrapper needed!

---

### Ledger API (@midnight-ntwrk/ledger v3.0.2)
**129 Documented Items**:

**52 Classes**:
- Transaction lifecycle: Input, Output, Transient, Offer, Transaction
- Unproven variants: UnprovenInput, UnprovenOutput, etc.
- ProofErased variants: For testing
- State management: LedgerState, LocalState, ContractState
- Minting: AuthorizedMint variants
- Contract operations: ContractCall, ContractDeploy, Maintenance

**43 Utility Functions**:
- Encode/Decode (10): `encodeCoinInfo()`, `decodeCoinInfo()`, etc.
- Cryptographic (9): `persistentHash()`, `coinCommitment()`, EC ops
- Token/Coin (6): `createCoinInfo()`, `nativeToken()`, `tokenType()`
- Testing (5): `sampleCoinPublicKey()`, `dummyContractAddress()`, etc.
- VM/Advanced (4): `runProgram()`, `partitionTranscripts()`
- Signing (4): `signData()`, `verifySignature()`, keys
- Internal (5): Conversions, alignment, validation

**33 Type Aliases**:
- Zswap: CoinCommitment, CoinInfo, QualifiedCoinInfo, Nonce, Nullifier
- Signatures: Signature, SigningKey, SignatureVerifyingKey
- VM: Op<R>, Transcript<R>, Value, GatherResult
- Alignment: AlignedValue, Alignment, AlignmentAtom, AlignmentSegment
- Contract: ContractAction, ContractAddress, Effects
- Transaction: TransactionHash, TransactionId, TokenType

**1 Enumeration**:
- NetworkId: Undeployed (0), DevNet (1), TestNet (2), MainNet (3)

---

### Midnight.js Framework
**8 Packages**:

1. **types** - Common types and interfaces
2. **contracts** - Contract interaction (20+ functions, 40+ types, 9 errors)
3. **indexer-public-data-provider** - Blockchain data queries
4. **node-zk-config-provider** - Node.js ZK artifacts (filesystem)
5. **fetch-zk-config-provider** - Cross-env ZK artifacts (HTTP)
6. **network-id** - Network configuration (MUST call first!)
7. **http-client-proof-provider** - Remote proof generation
8. **level-private-state-provider** - Private state persistence

**Key Functions in contracts package**:
- `deployContract()` - Deploy contracts
- `call()` - Call circuits
- `findDeployedContract()` - Find deployed contracts
- `getStates()` - Query public + private state
- `submitInsertVerifierKeyTx()` - Contract upgrades
- Plus 15+ more functions

**9 Error Classes** (fully documented):
- TxFailedError (base)
- CallTxFailedError
- DeployTxFailedError
- ContractTypeError
- Configuration errors (2)
- Maintenance errors (3)

---

## 🔑 Critical Concepts for AI Assistants

### 1. Privacy Model - Witness Protection

**The Rule**: Use `disclose()` before storing witness data in ledger or returning from circuits.

```compact
witness getSecret(): Field;
export ledger secretHash: Bytes<32>;

// ❌ WRONG: Undeclared disclosure
export circuit wrong(): [] {
  secretHash = persistentHash(getSecret());  // Error!
}

// ✅ CORRECT: Use disclose()
export circuit correct(): [] {
  secretHash = persistentHash(disclose(getSecret()));
}
```

**Auto-Disclosed Functions** (no `disclose()` needed):
- `persistentHash()`
- `persistentCommit()`
- `transientHash()`
- `transientCommit()`

**Why**: Hash preimage resistance protects privacy!

---

### 2. Three-Part Architecture

```
┌─────────────────────────┐
│   Local (Private)       │
│   witness functions     │ ← Stays on user's machine
│   Private computations  │
└───────────┬─────────────┘
            │
            ↓ Generate ZK Proof
┌─────────────────────────┐
│   Circuit (Proves)      │
│   export circuit        │ ← Executes locally
│   ZK proof generation   │
└───────────┬─────────────┘
            │
            ↓ Submit proof + public outputs
┌─────────────────────────┐
│   Ledger (Public)       │
│   export ledger         │ ← On-chain, replicated
│   Public state          │
└─────────────────────────┘
```

---

### 3. Transaction Flow

1. **Local Execution** - Circuit runs with witnesses (private)
2. **Proof Generation** - ZK proof created (1-60 seconds)
3. **Submission** - Proof + public outputs sent to network
4. **Verification** - Network verifies proof (50-200ms)
5. **State Update** - Ledger state updated
6. **Settlement** - Finalized on Cardano

**Key**: Witnesses never leave user's machine!

---

### 4. Type Conversion (Compact ↔ Ledger)

**5 Bidirectional Pairs**:

| Type | Decode (Compact → Ledger) | Encode (Ledger → Compact) |
|------|---------------------------|---------------------------|
| CoinInfo | `decodeCoinInfo()` | `encodeCoinInfo()` |
| QualifiedCoinInfo | `decodeQualifiedCoinInfo()` | `encodeQualifiedCoinInfo()` |
| CoinPublicKey | `decodeCoinPublicKey()` | `encodeCoinPublicKey()` |
| ContractAddress | `decodeContractAddress()` | `encodeContractAddress()` |
| TokenType | `decodeTokenType()` | `encodeTokenType()` |

**Memory Aid**:
- **Decode** = Compact OUT → Ledger (data from contract)
- **Encode** = Ledger IN → Compact (data to contract)

---

### 5. State Management

**Three Types of State**:

1. **Public Ledger State** - On-chain, everyone sees
   ```compact
   export ledger counter: Field;
   ```

2. **Private Witness State** - Local, only user sees
   ```compact
   witness getSecret(): Bytes<32>;
   ```

3. **Transient Circuit State** - Temporary, computed during execution
   ```compact
   export circuit compute(): Field {
     let temp = x + y;  // Transient
     return temp;
   }
   ```

---

### 6. Network Configuration

**CRITICAL**: Always call `setNetworkId()` first!

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';

// MUST be first operation
setNetworkId(NetworkId.TestNet);

// Now initialize everything else
const providers = { /* ... */ };
```

**Networks**:
- Undeployed (0) - Local dev
- DevNet (1) - Developer testing
- TestNet (2) - Public testnet (Testnet_02)
- MainNet (3) - Production

---

## 🎨 Common Patterns for AI to Recommend

### Pattern 1: Deploy and Call Contract

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
import { deployContract, call } from '@midnight-ntwrk/midnight-js-contracts';

// 1. Set network
setNetworkId(NetworkId.TestNet);

// 2. Deploy
const deployed = await deployContract({
  contract: compiledContract,
  initialState: { counter: 0n },
  privateState: myPrivateState,
  providers
});

// 3. Call circuit
const result = await call(
  deployed.contractAddress,
  'increment',
  {
    arguments: { amount: 5n },
    witnesses: { secretKey: mySecret },
    providers
  }
);
```

---

### Pattern 2: Privacy-Preserving Computation

```compact
// Store hash on ledger (public)
export ledger secretHash: Bytes<32>;

// Keep secret private (witness)
witness getSecret(): Bytes<32>;

// Verify secret without revealing it
export circuit verifySecret(providedSecret: Bytes<32>): Bytes<1> {
  let actualSecret = getSecret();
  
  // Hash for comparison (auto-disclosed)
  let actualHash = persistentHash(actualSecret);
  let providedHash = persistentHash(providedSecret);
  
  if (actualHash == providedHash) {
    return Bytes([1]);
  } else {
    return Bytes([0]);
  }
}
```

---

### Pattern 3: Coin Management

```typescript
import { 
  createCoinInfo, 
  nativeToken, 
  UnprovenOutput 
} from '@midnight-ntwrk/ledger';

// Create coin with native token
const coin = createCoinInfo(nativeToken(), 1000n);

// Create output for user
const output = UnprovenOutput.new(coin, recipientPublicKey);

// Or for contract
const contractOutput = UnprovenOutput.newContractOwned(
  coin, 
  contractAddress
);
```

---

### Pattern 4: Error Handling

```typescript
import { 
  call, 
  CallTxFailedError, 
  ContractTypeError 
} from '@midnight-ntwrk/midnight-js-contracts';

try {
  const result = await call(address, 'circuit', options);
} catch (error) {
  if (error instanceof CallTxFailedError) {
    // Circuit call failed
    console.error(`Circuit ${error.circuitId} failed`);
    console.error(`TX: ${error.finalizedTxData.transactionHash}`);
    // Check: proof, gas, state, balance, logic
  } else if (error instanceof ContractTypeError) {
    // Wrong contract type
    console.error(`Mismatched: ${error.circuitIds.join(', ')}`);
    // Verify address, check upgrades, update types
  }
}
```

---

## 📋 Quick Reference Tables

### Ledger ADT Types (v0.18.0)

| Type | Key Operations | Use Case |
|------|----------------|----------|
| Cell<T> | `read()`, `write(v)` | Single value storage |
| Counter | `increment(n)`, `lessThan(n)` | Counters |
| Set<T> | `insert()`, `member()`, `size()` | Unique elements |
| Map<K,V> | `insert()`, `lookup()`, `member()` | Key-value pairs |
| List<T> | `pushFront()`, `popFront()`, `head()` | Ordered list |
| MerkleTree<n,T> | `insert()`, `checkRoot()` | Bounded tree |
| HistoricMerkleTree<n,T> | All MerkleTree + history | Tree with history |

### Standard Library Types

| Type | Constructors | Use Case |
|------|--------------|----------|
| Maybe<T> | `some(value)`, `none()` | Optional values |
| Either<L,R> | `left(val)`, `right(val)` | Sum types |
| CoinInfo | Created by `createCoinInfo()` | Coin data |
| QualifiedCoinInfo | CoinInfo + mt_index | Spending coins |

---

## 🚨 Common Issues and Solutions

### Issue 1: "Undeclared disclosure" Error

**Cause**: Witness data stored in ledger without `disclose()`

**Solution**:
```compact
// ❌ WRONG
ledgerField = witnessValue;

// ✅ CORRECT
ledgerField = disclose(witnessValue);
```

---

### Issue 2: Private State Not Saved

**Cause**: `privateStateId` provided without `privateStateProvider`

**Solution**:
```typescript
// ✅ Provide both
providers: {
  zkConfigProvider,
  proofProvider,
  indexer,
  privateStateProvider  // Don't forget!
}
```

---

### Issue 3: Contract Type Mismatch

**Cause**: Wrong contract at address or outdated verifier keys

**Solution**:
- Verify contract address is correct
- Check if contract was upgraded
- Update your compiled contract code
- Ensure contract type definition matches

---

### Issue 4: Network Configuration

**Cause**: Forgot to call `setNetworkId()`

**Solution**:
```typescript
// ALWAYS first!
import { setNetworkId, NetworkId } from '@midnight-ntwrk/network-id';
setNetworkId(NetworkId.TestNet);
```

---

## 📊 Documentation Coverage Summary

**Total Documents**: 60+
**Total API Items**: 250+

### By Category:
- **API References**: 7 docs (250+ items)
- **Language & Compiler**: 6 docs
- **Architecture**: 7 docs
- **Development Guides**: 7 docs
- **Project-Specific**: 8 docs
- **Logs & Sessions**: 7 docs
- **Specialized**: 9 docs

### Key Numbers:
- Ledger API: 129 items
- Runtime Functions: 70+
- Midnight.js: 8 packages + 60+ items
- Type Aliases: 33 documented
- Error Classes: 9 with examples
- Utility Functions: 43 in ledger alone

---

## 🎯 AI Assistant Guidelines

### When Helping with Smart Contracts:
1. **Always check for `disclose()` usage**
2. **Reference `persistentHash()` for security**
3. **Use proper ledger ADT types**
4. **Follow privacy-first patterns**

### When Helping with Applications:
1. **Start with `setNetworkId()`**
2. **Use high-level APIs (`call()`, `deployContract()`)**
3. **Handle errors with specific error classes**
4. **Manage private state properly**

### When Explaining Architecture:
1. **Emphasize three-part model** (ledger/circuit/witness)
2. **Explain proof generation** (local, ZK, no witnesses on-chain)
3. **Clarify privacy guarantees** (what's public vs private)
4. **Reference Cardano settlement layer**

### When Debugging:
1. **Check network configuration first**
2. **Verify private state provider setup**
3. **Inspect error types carefully**
4. **Reference common issues section**

---

## 🔗 Cross-Reference Guide

### For Concept X, Reference:

**Privacy** → HOW_TO_KEEP_DATA_PRIVATE.md, PRIVACY_ARCHITECTURE.md, MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md

**Transactions** → LEDGER_API_REFERENCE.md, MIDNIGHT_TRANSACTION_STRUCTURE.md

**Contracts** → MINOKAWA_LANGUAGE_REFERENCE.md, COMPACT_STANDARD_LIBRARY.md

**Deployment** → DEPLOYMENT_GUIDE.md, QUICKSTART_DEPLOYMENT.md

**Integration** → MIDNIGHT_INTEGRATION_GUIDE.md, MIDNIGHT_JS_API_REFERENCE.md

**Errors** → MIDNIGHT_JS_CONTRACTS_API.md (Error Classes section)

**Types** → LEDGER_API_REFERENCE.md (Type Aliases section)

**State** → MINOKAWA_LEDGER_DATA_TYPES.md

---

## 🎊 Summary for AI Assistants

You now have access to:
- ✅ **Complete API documentation** (250+ items)
- ✅ **All language features** (Minokawa 0.18.0)
- ✅ **Framework guides** (Midnight.js v2.0.2)
- ✅ **Common patterns** (privacy, deployment, errors)
- ✅ **Error handling** (9 classes fully documented)
- ✅ **Cross-references** (easy navigation)

**Use this document as your primary reference** when:
- Writing smart contracts
- Building applications
- Debugging issues
- Explaining concepts
- Providing code examples

**Master Index**: [MIDNIGHT_DOCUMENTATION_MASTER_INDEX.md](MIDNIGHT_DOCUMENTATION_MASTER_INDEX.md)

---

**Status**: ✅ Complete Reference for AI Assistants  
**Coverage**: 60+ documents, 250+ API items  
**Purpose**: Enable AI to provide accurate Midnight development assistance  
**Last Updated**: October 28, 2025
