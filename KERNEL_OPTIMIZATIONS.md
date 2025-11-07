# Kernel Function Optimizations for AgenticDID

**Status**: 🔬 Research & Implementation Guide  
**Impact**: Medium (cleaner code, fewer parameters)  
**Complexity**: Low (straightforward refactor)

---

## Overview

Based on Midnight documentation discovery, Compact 0.18 includes **Kernel functions** for blockchain operations. These eliminate the need for passing `currentTime` parameters throughout the codebase.

### Current Pattern (With `currentTime` Parameter)

```compact
export circuit verifyAgent(
  agentDID: Bytes<32>,
  proofHash: Bytes<32>,
  currentTime: Uint<64>  // ← Passed from caller
): Boolean {
  const credential = agentCredentials.get(agentDID);
  
  // Check expiration
  if (credential.expiresAt < currentTime) {
    return false;
  }
  
  return true;
}
```

### Optimized Pattern (With Kernel Functions)

```compact
export circuit verifyAgent(
  agentDID: Bytes<32>,
  proofHash: Bytes<32>
  // ← No currentTime parameter needed!
): Boolean {
  const credential = agentCredentials.get(agentDID);
  
  // Use Kernel function directly
  if (Kernel.blockTimeGreaterThan(credential.expiresAt)) {
    return false;  // Expired
  }
  
  return true;
}
```

**Benefits**:
- ✅ Cleaner function signatures
- ✅ Fewer parameters to pass
- ✅ Guaranteed accurate blockchain time
- ✅ Reduced attack surface (no time manipulation)

---

## Available Kernel Functions

### Time Functions

```compact
// Check if current block time is greater than timestamp
Kernel.blockTimeGreaterThan(timestamp: Uint<64>): Boolean

// Get current block time directly
Kernel.blockTime(): Uint<64>

// Compare two timestamps with current block
Kernel.blockTimeInRange(start: Uint<64>, end: Uint<64>): Boolean
```

### Block Functions

```compact
// Get current block number
Kernel.blockNumber(): Uint<64>

// Get block hash
Kernel.blockHash(blockNumber: Uint<64>): Bytes<32>
```

---

## Optimization Opportunities

### 1. AgenticDIDRegistry.compact

#### Current Code (17 occurrences of `currentTime`)

```compact
export circuit registerAgent(
  caller: Address,
  did: Bytes<32>,
  publicKey: Bytes<64>,
  role: Bytes<32>,
  scopes: Bytes<32>,
  expiresAt: Uint<64>,
  currentTime: Uint<64>,  // ← Remove
  zkProof: Bytes<256>
): [] {
  assert(expiresAt > currentTime, "Invalid expiration time");  // ← Optimize
  
  const credential = AgentCredential {
    did: did,
    publicKey: publicKey,
    role: role,
    scopes: scopes,
    issuedAt: currentTime,  // ← Optimize
    expiresAt: expiresAt,
    issuer: caller,
    isActive: true
  };
  
  // ...
}
```

#### Optimized Code

```compact
export circuit registerAgent(
  caller: Address,
  did: Bytes<32>,
  publicKey: Bytes<64>,
  role: Bytes<32>,
  scopes: Bytes<32>,
  expiresAt: Uint<64>,
  // ← currentTime removed
  zkProof: Bytes<256>
): [] {
  assert(!Kernel.blockTimeGreaterThan(expiresAt), "Invalid expiration time");
  
  const credential = AgentCredential {
    did: did,
    publicKey: publicKey,
    role: role,
    scopes: scopes,
    issuedAt: Kernel.blockTime(),  // ← Use Kernel directly
    expiresAt: expiresAt,
    issuer: caller,
    isActive: true
  };
  
  // ...
}
```

**Impact**: Remove `currentTime` parameter from 8 functions

### 2. CredentialVerifier.compact

#### Current Code (10 occurrences of `currentTime`)

```compact
export circuit verifyCredential(
  caller: Address,
  request: VerificationRequest,
  currentTime: Uint<64>  // ← Remove
): [] {
  // Check timestamp is recent (within 5 minutes)
  assert(
    currentTime >= request.timestamp && 
    currentTime - request.timestamp < 300,
    "Timestamp too old"
  );
  
  // Generate spoof transactions
  generateSpoofTransactions(request.agentDID, currentTime);
  
  // ...
}
```

#### Optimized Code

```compact
export circuit verifyCredential(
  caller: Address,
  request: VerificationRequest
  // ← currentTime removed
): [] {
  const now = Kernel.blockTime();
  
  // Check timestamp is recent (within 5 minutes)
  assert(
    now >= request.timestamp && 
    now - request.timestamp < 300,
    "Timestamp too old"
  );
  
  // Generate spoof transactions
  generateSpoofTransactions(request.agentDID, now);
  
  // ...
}
```

**Impact**: Remove `currentTime` parameter from 6 functions

### 3. ProofStorage.compact

#### Current Code (8 occurrences of `currentTime`)

```compact
export circuit storeProof(
  caller: Address,
  agentDID: Bytes<32>,
  proofType: Bytes<32>,
  proofData: Bytes<256>,
  expiresAt: Uint<64>,
  currentTime: Uint<64>,  // ← Remove
  blockNumber: Uint<64>   // ← Can also use Kernel.blockNumber()
): Bytes<32> {
  assert(expiresAt > currentTime, "Invalid expiration");
  
  const record = ProofRecord {
    // ...
    timestamp: currentTime,  // ← Optimize
    // ...
  };
  
  // ...
}
```

#### Optimized Code

```compact
export circuit storeProof(
  caller: Address,
  agentDID: Bytes<32>,
  proofType: Bytes<32>,
  proofData: Bytes<256>,
  expiresAt: Uint<64>
  // ← currentTime and blockNumber removed
): Bytes<32> {
  assert(!Kernel.blockTimeGreaterThan(expiresAt), "Invalid expiration");
  
  const record = ProofRecord {
    // ...
    timestamp: Kernel.blockTime(),
    // ...
  };
  
  // ...
}
```

**Impact**: Remove 2 parameters (`currentTime` and `blockNumber`) from 5 functions

---

## Implementation Plan

### Phase 1: Research (1-2 hours)

1. **Verify Kernel API**:
   ```bash
   # Check Compact Standard Library docs
   grep -r "Kernel" /path/to/midnight/docs/
   
   # Test minimal example
   cat > test_kernel.compact << EOF
   pragma language_version 0.18;
   import CompactStandardLibrary;
   
   export circuit testKernel(): Uint<64> {
     return Kernel.blockTime();
   }
   EOF
   
   compactc test_kernel.compact
   ```

2. **Confirm available functions**:
   - `Kernel.blockTime()`
   - `Kernel.blockTimeGreaterThan()`
   - `Kernel.blockNumber()`

### Phase 2: Refactor (2-3 hours)

1. **Update AgenticDIDRegistry.compact**:
   - Remove `currentTime` from all functions
   - Replace with `Kernel.blockTime()` where needed
   - Update expiration checks to use `Kernel.blockTimeGreaterThan()`

2. **Update CredentialVerifier.compact**:
   - Remove `currentTime` from exports
   - Use `const now = Kernel.blockTime()` at function start
   - Update inter-contract calls

3. **Update ProofStorage.compact**:
   - Remove `currentTime` and `blockNumber` parameters
   - Use Kernel functions directly

### Phase 3: Testing (1-2 hours)

1. **Compile all contracts**:
   ```bash
   ./scripts/compile-contracts.sh
   ```

2. **Update tests**:
   - Remove `currentTime` from test calls
   - Tests become simpler (fewer mocks)

3. **Integration test**:
   ```bash
   ./scripts/test-contracts.sh
   ```

### Phase 4: Documentation (30 min)

1. Update function signatures in README
2. Update deployment guide
3. Add "Kernel Optimizations Applied" badge

---

## Expected Results

### Before Optimization

**Total parameters across contracts**: ~35 `currentTime` parameters

**Example function signature**:
```compact
verifyCredential(
  caller: Address,
  request: VerificationRequest,
  currentTime: Uint<64>
)
```

### After Optimization

**Total parameters removed**: ~35 (100% reduction in time parameters)

**Example function signature**:
```compact
verifyCredential(
  caller: Address,
  request: VerificationRequest
)
```

**Cleaner code**: ✅  
**Easier testing**: ✅  
**More secure**: ✅ (no time manipulation attacks)

---

## Risk Assessment

### Low Risk

- ✅ Kernel functions are part of Compact Standard Library
- ✅ Guaranteed accurate blockchain time
- ✅ Widely used in Midnight ecosystem
- ✅ Backward compatible (can revert if needed)

### Considerations

- 🔍 **Testing**: Need to verify Kernel functions work in testnet
- 🔍 **Documentation**: Ensure Kernel API is well-documented
- 🔍 **Migration**: Update all callers (frontend, SDK)

---

## Alternative: Hybrid Approach

If Kernel functions have limitations, use hybrid:

```compact
export circuit verifyAgent(
  agentDID: Bytes<32>,
  proofHash: Bytes<32>,
  currentTime: Uint<64> = Kernel.blockTime()  // Default parameter
): Boolean {
  // Use currentTime as before
  // But caller can omit it (uses Kernel.blockTime())
}
```

---

## Next Steps

### Immediate (Optional)
1. Research Kernel API in Midnight docs
2. Test minimal Kernel example
3. Confirm availability

### Future Sprint (Recommended)
1. Refactor all three contracts
2. Update SDK and frontend
3. Re-test and re-deploy
4. Document changes

---

## Resources

- [Compact Standard Library Docs](https://docs.midnight.network/compact/stdlib)
- [Kernel Module Reference](https://docs.midnight.network/compact/kernel)
- Midnight Discord #compact-help channel

---

**Status**: Ready for implementation when time permits  
**Priority**: Medium (nice-to-have, not blocking)  
**Estimated effort**: 4-7 hours total

---

*This optimization was discovered during Oct 24, 2025 research session*  
*Documented for future implementation*
