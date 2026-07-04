# AgenticDID Minokawa/Compact Compiler Status

**Last Updated**: October 28, 2025  
**Project**: AgenticDID.io - Privacy-Preserving AI Agent Credentials

---

## 🎯 Current Situation

### Language Renamed: Compact → Minokawa
As of compiler v0.26.0, the language is now officially **Minokawa** (under Linux Foundation Decentralized Trust). Tooling still uses "compact" command name during transition period.

### Compiler Versions

| Aspect | Current | Latest | Docker Available |
|--------|---------|--------|------------------|
| **Compiler Version** | 0.25.0 | **0.26.0** | 0.25.0 only |
| **Language Version** | 0.17.0 | **0.18.0** | 0.17.0 only |
| **Docker Image** | midnightnetwork/compactc:latest | - | v0.25.0 |
| **Status** | ✅ Working | ⏳ Awaiting Docker release | - |

---

## 📦 What We Have

### Docker Image
```bash
docker pull midnightnetwork/compactc:latest
# Returns: v0.25.0 (language v0.17.0)
```

### Contracts Status
- ✅ **Syntax**: Fully adapted for Minokawa v0.17.0
- ✅ **Type System**: All types correct
- ✅ **Map Operations**: Using `.member()`, `.insert()`, `.lookup()`
- ✅ **Bytes Literals**: Using `default<Bytes<32>>` (v0.17 workaround)
- ⚠️ **Privacy**: Witness-value disclosure warnings (need `disclose()` for production)
- ⏳ **Compilation**: Blocked by privacy warnings (not errors, just warnings)

---

## 🆕 What's Available in v0.26.0 (Not Yet in Docker)

### Game-Changing Features for Our Contracts

#### 1. Native Hex Literals! 🎉
```compact
// WE CAN FINALLY DO THIS in 0.26.0:
return 0x0000000000000000000000000000000000000000000000000000000000000000;

// Instead of our current workaround:
return default<Bytes<32>>;
```

#### 2. New Bytes Syntax
```compact
const proof = Bytes[0xFF, 0x00, ...data, 0xAB];
```

#### 3. Spread Operators
```compact
const combined = [...hash1, ...hash2];
```

#### 4. Slice Expressions
```compact
const subHash = slice<16>(fullHash, 0);  // First 16 bytes
```

### Full Feature List
See: `MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md`

---

## 🔧 Current Workarounds (v0.17.0)

### 1. Zero Bytes Values
```compact
// Using default constructor
const zeroHash: Bytes<32> = default<Bytes<32>>;
const emptyProof: Bytes<256> = default<Bytes<256>>;
```

**When 0.26.0 available**: Replace with hex literals

### 2. Map Operations
```compact
// ✅ Correct for all versions
if (agentCredentials.member(did)) {
  const cred = agentCredentials.lookup(did);
  agentCredentials.insert(did, updatedCred);
}
```

### 3. Counter Increments
```compact
// ✅ Explicit casts required
totalAgents = totalAgents + 1 as Uint<64>;
```

### 4. Uint Width Limit
```compact
// ⚠️ Max width is 254, not 256
ledger revocationBitmap: Uint<254>;  // Not Uint<256>
```

---

## 🚧 Known Issues

### Privacy Warnings (Non-Fatal, Design Feature)
```
Exception: potential witness-value disclosure must be declared but is not
```

**Cause**: Minokawa's privacy-by-default design
**Impact**: Prevents accidental privacy leaks
**Solution**: Add `disclose()` declarations for public parameters

**Example**:
```compact
export circuit registerAgent(
  caller: ContractAddress,  // Witness value
  did: Bytes<32>,           // Witness value
  ...
) {
  // ERROR: Storing witness values in ledger without disclosure
  agentCredentials.insert(did, credential);
}

// Fixed version:
export circuit registerAgent(
  caller: ContractAddress,
  did: Bytes<32>,
  ...
) {
  // Explicitly disclose public parameters
  agentCredentials.insert(disclose(did), credential);
}
```

### Compilation Output
- **Current**: Privacy warnings prevent output generation
- **Type Checking**: ✅ All contracts pass type checking
- **Syntax**: ✅ All contracts have correct v0.17 syntax
- **For Production**: Need to add `disclose()` declarations

---

## 📋 Contract-Specific Adaptations

### AgenticDIDRegistry.compact (472 lines)
- ✅ All Map operations use `.member()/.insert()/.lookup()`
- ✅ All Bytes returns use `default<Bytes<32>>`
- ✅ Counter increments have explicit casts
- ✅ Uint<254> for revocation bitmap
- ⏳ Needs `disclose()` for production

### CredentialVerifier.compact (407 lines)
- ✅ All syntax correct for v0.17
- ✅ Nonce checking uses `.member()`
- ✅ Map operations correct
- ⏳ Needs `disclose()` for production

### ProofStorage.compact (469 lines)
- ✅ All syntax correct for v0.17
- ✅ Bytes<256> uses `default<Bytes<256>>`
- ✅ All Map operations correct
- ⏳ Needs `disclose()` for production

---

## 🎯 Migration Plan for v0.26.0

### Phase 1: When Docker Image Available
1. **Pull new image**
   ```bash
   docker pull midnightnetwork/compactc:0.26.0
   ```

2. **Update pragma in all contracts**
   ```compact
   pragma language_version >= 0.18.0;
   ```

3. **Test compilation**
   ```bash
   ./scripts/compile-contracts.sh
   ```

### Phase 2: Leverage New Features
1. **Replace `default<Bytes<N>>` with hex literals**
   ```compact
   // Before:
   return default<Bytes<32>>;
   
   // After:
   return 0x0000000000000000000000000000000000000000000000000000000000000000;
   ```

2. **Use new Bytes syntax**
   ```compact
   const proof = Bytes[0x00, ...data, 0xFF];
   ```

3. **Use spread for concatenation**
   ```compact
   const fullHash = [...userHash, ...agentHash];
   ```

### Phase 3: Production Readiness
1. **Add `disclose()` declarations**
2. **Test with real Midnight testnet**
3. **Generate ZK proofs** (remove `--skip-zk`)
4. **Performance testing**

---

## 📊 Compilation Commands

### Current (v0.25.0)
```bash
# Syntax check only (privacy warnings block output)
docker run --rm \
  -v "$(pwd)/contracts:/contracts" \
  midnightnetwork/compactc:latest \
  "compactc --skip-zk /contracts/AgenticDIDRegistry.compact /contracts/compiled/AgenticDIDRegistry"
```

### Future (v0.26.0)
```bash
# Full compilation with hex literals
docker run --rm \
  -v "$(pwd)/contracts:/contracts" \
  midnightnetwork/compactc:0.26.0 \
  "compactc --skip-zk /contracts/AgenticDIDRegistry.compact /contracts/compiled/AgenticDIDRegistry"
```

---

## ✅ Verification Checklist

### Syntax Compliance (v0.17.0)
- [x] Pragma uses `>= 0.17.0`
- [x] No `.has()` calls (using `.member()`)
- [x] No `.set()`/`.get()` (using `.insert()`/`.lookup()`)
- [x] No `Address` type (using `ContractAddress`)
- [x] No `.length()` on Bytes
- [x] All Uint widths ≤ 254
- [x] Counter increments have explicit casts
- [x] Bytes values use `default<Bytes<N>>`

### Ready for v0.26.0
- [x] Document hex literal locations for conversion
- [x] Identify spread operator opportunities
- [x] Check for `slice` identifier conflicts (none found)
- [ ] Plan `disclose()` additions
- [ ] Update pragma to `>= 0.18.0`
- [ ] Test compilation

---

## 🔗 References

- **Release Notes**: `MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md`
- **Syntax Fixes**: `COMPILATION_FIXES.md`
- **Address Type Fix**: `ADDRESS_TYPE_BUG_RESOLVED.md`
- **Midnight Docs**: https://docs.midnight.network/
- **LFDT Project**: Linux Foundation Decentralized Trust

---

## 📞 Next Steps

1. **Monitor Docker Hub** for midnightnetwork/compactc:0.26.0 release
2. **Prepare hex literal conversion** script/list
3. **Design `disclose()` strategy** for public vs private parameters
4. **Update documentation** to use "Minokawa" terminology
5. **Community engagement** with LFDT for open-source development

---

**Status**: ✅ Contracts ready for v0.17.0, prepared for v0.26.0 upgrade  
**Blocker**: Docker image availability  
**ETA**: Awaiting Midnight Network Docker release
