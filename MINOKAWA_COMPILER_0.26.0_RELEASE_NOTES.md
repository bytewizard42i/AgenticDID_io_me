# Minokawa Compiler 0.26.0 Release Notes

**Date**: Official Release Notes
**Compiler Version**: 0.26.0  
**Language Version**: Minokawa 0.18.0 (formerly Compact 0.18.0)

---

## 🎯 CRITICAL: Language Renamed to Minokawa

The Compact language has been renamed to **Minokawa** as part of moving to the Linux Foundation Decentralized Trust (LFDT) for open-source development.

### What Changed
- **Language Name**: Compact → Minokawa
- **Tooling**: Still uses "compact" command (will update gradually)
- **Standard Library**: Still named `CompactStandardLibrary`
- **Version Numbering**: Continues from Compact sequence (0.17.0 → 0.18.0)

---

## 📋 Summary of Changes

This release has **breaking changes** and many new language features:

### Language Changes
- ✨ New syntax for bytes value creation
- ✨ Index bytes values like tuples/vectors
- ✨ Iterate over bytes with for/map/fold
- ✨ Hexadecimal, octal, and binary literals (TypeScript syntax)
- ✨ Spread expressions in tuple/bytes creation
- ⚠️ **BREAKING**: Slice expressions for extracting subparts
- ✨ Generic size parameters in expressions
- ✨ Non-literal vector/bytes indexes

### Runtime Changes
- ⚠️ **BREAKING**: Runtime v0.9.0 - Function renames

### Bug Fixes
- Fixed `transientCommit`/`persistentCommit` implicit disclosure
- Fixed Vector↔Bytes conversion proof bug
- Fixed nested ledger ADT proof bug
- Fixed MerkleTree/HistoricMerkleTree bugs
- Fixed pure circuit map/fold JavaScript bug
- Fixed rare circuit optimization crash

---

## 🆕 New Language Features

### 1. Bytes Value Creation Syntax

**NEW**: Create bytes values like tuples using `Bytes` keyword:

```compact
// Old way (still works)
const b1: Bytes<4> = default<Bytes<4>>;

// New way
const b2 = Bytes[0, x, y, 0];  // Type: Bytes<4>
const empty = Bytes[];          // Type: Bytes<0>
```

✅ **Non-breaking** - Bytes was already a reserved word

---

### 2. Hexadecimal, Octal, and Binary Literals

**NEW**: Use non-decimal bases (same syntax as TypeScript):

```compact
// Hexadecimal (0x or 0X)
const hex = 0xFF;        // 255
const addr = 0xDEADBEEF;

// Octal (0o or 0O)
const oct = 0o77;        // 63

// Binary (0b or 0B)
const bin = 0b1010;      // 10
```

**Typing**: For literal `N` in any base, type is `Uint<0..N>`

✅ **Non-breaking**

**🎯 IMPACT ON AGENTICDID**: Can now use `0x00` instead of `default<Bytes<32>>`!

---

### 3. Index Bytes Values

**NEW**: Index bytes like vectors:

```compact
const b: Bytes<10> = ...;
const byte = b[5];  // Type: Uint<8>
```

✅ **Non-breaking**

---

### 4. Iterate Over Bytes Values

**NEW**: Use for/map/fold with bytes:

```compact
const b: Bytes<10> = ...;

// For loop
for (const byte in b) {
  // byte has type Uint<8>
}

// Map (returns Vector, not Bytes)
const doubled = map((byte) => byte * 2, b);  // Vector<10, Uint<16>>

// Fold
const sum = fold((acc, byte) => acc + byte, 0, b);
```

**Note**: `map` returns `Vector`, not `Bytes` (to avoid expensive packing)

✅ **Non-breaking**

---

### 5. Spread Expressions

**NEW**: Concatenate tuples/vectors/bytes:

```compact
// Concatenate
const combined = [...x, ...y];

// Mix
const mixed = [a, ...middle, b];

// Bytes
const bytes = Bytes[0xFF, ...data, 0x00];
```

**Rules**:
- Spreading vector in tuple requires all elements have related types
- Spreading in bytes requires elements be `Uint<8>` subtypes

✅ **Non-breaking**

---

### 6. Slice Expressions ⚠️ BREAKING

**NEW**: Extract contiguous subparts:

```compact
const v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const sub = slice<4>(v, 2);  // [2, 3, 4, 5]
```

**Syntax**: `slice<SIZE>(value, index)`
- `SIZE`: Numeric literal or generic size parameter (slice length)
- `value`: Tuple, vector, or bytes value
- `index`: Start index (can be non-literal if compile-time constant)

⚠️ **BREAKING**: `slice` is now a keyword - rename if used as identifier

---

### 7. Generic Size Parameters in Expressions

**NEW**: Use generic sizes in expression contexts:

```compact
circuit add<#N>(x: Uint<32>): Field {
  return N + x;  // N usable as value
}

add<3>(5);  // Returns 8
```

**Limitation**: Cannot do arithmetic on generic sizes in types yet:
```compact
// ❌ Does not work yet
circuit double<#N>(v: Vector<N, Field>): Vector<2 * N, Field>
```

✅ **Non-breaking**

---

### 8. Non-Literal Vector/Bytes Indexes

**NEW**: Use expressions as indexes (if compile-time constant):

```compact
export circuit foo(v: Vector<10, Uint<8>>): Uint<8> {
    const i = 4;
    return v[2 * i];  // Constant folding → v[8]
}

circuit eight(): Uint<0..8> { return 8; }

export circuit bar(v: Vector<8, Uint<8>>): Uint<8> {
    return v[eight()];  // Inlining → v[8]
}
```

**Compiler techniques**:
- Loop unrolling
- Circuit inlining  
- Copy propagation
- Constant folding

**Constraint**: If index not literal/generic, value must be vector/bytes (not tuple)

✅ **Non-breaking**

---

## 🔄 Enhanced Type Casts

Many new casts added. Generally: cast to supertype always works, and many casts now work in both directions.

### New Casts

| From | To | Can Fail? | Cost |
|------|----|-----------| -----|
| `Boolean` | `Boolean` | No | None |
| `Opaque<s>` | `Opaque<s>` | No | None |
| Struct S | Struct S | No | None |
| Enum E | Enum E | No | None |
| `Vector<n,T>` | `Vector<n,S>` (S supertype of T) | No | None |
| `[T1..Tn]` | `[S1..Sn]` (each Si supertype of Ti) | No | None |
| `Vector<n,T>` | `[S1..Sn]` (each Si supertype of T) | No | None |
| `[T1..Tn]` | `Vector<n,S>` (S supertype of all Ti) | No | None |
| `Bytes<n>` | `Vector<n,T>` (T supertype of Uint<8>) | No | O(n) |
| `Bytes<n>` | `[T1..Tn]` (each Ti supertype of Uint<8>) | No | O(n) |
| `Uint` | `Bytes` | Yes (size check) | O(size) |
| `Bytes` | `Uint` | Yes | O(size) |
| `Field` | Enum | Yes | None (JS repr change) |
| Enum | `Uint` | Maybe (depends on sizes) | Maybe |
| `Uint` | Enum | Maybe (depends on sizes) | Maybe |

✅ **Non-breaking** - Only added new casts, didn't change existing

---

## ⚠️ Breaking Changes

### 1. `slice` is now a keyword
- **Impact**: If you used `slice` as identifier, rename it
- **Reason**: New slice expression feature

### 2. Runtime Function Renames
**Runtime Version**: 0.8.0 → 0.9.0

| Old Name | New Name |
|----------|----------|
| `convert_bigint_to_Uint8Array` | `convertFieldToBytes` |
| `convert_Uint8Array_to_bigint` | `convertBytesToField` |

**Changes**:
- Adopted JavaScript naming conventions
- Renamed to mention Minokawa types (not JS types)
- Added 3rd argument: source position string

**Impact**: Only affects DApps directly importing Compact runtime

---

## 🐛 Bug Fixes

### 1. `transientCommit`/`persistentCommit` Now Implicitly Disclosing
**Was**: Required explicit `disclose()` despite documentation
**Now**: Automatically disclosing as documented

### 2. Vector ↔ Bytes Conversion Proof Bug
**Was**: Endianness bug caused proof failures
**Now**: Fixed - conversions work correctly

### 3. Nested Ledger ADT Proof Bug
**Was**: Incorrect paths for Map lookup of nested ADTs caused proof failures
**Now**: Fixed

### 4. MerkleTree/HistoricMerkleTree Bugs
**MerkleTree.insertIndexDefault**: Missing Impact instruction → JS type error
**HistoricMerkleTree.insertIndexDefault**: Incorrect index → proof failure
**Now**: Both fixed

### 5. Pure Circuit map/fold JavaScript Bug  
**Was**: Wrong calling convention in 0.25.0 → JS type error
**Now**: Fixed

### 6. Circuit Optimization Crash
**Was**: Rare crash with "identifier not bound" error
**Now**: Fixed

### 7. Better Error Messages for Coin Commitment
**Before**:
```
Error: expected a cell
```

**After**:
```
line 6 char 3: Coin commitment not found. Check the coin has been received (or call 'createZswapOutput')
```

---

## 🚀 Migration Guide for AgenticDID

### Current Status
- **Using**: Compiler 0.25.0 (language 0.17.0)
- **Latest**: Compiler 0.26.0 (language 0.18.0)
- **Docker**: midnightnetwork/compactc:latest still at 0.25.0

### When 0.26.0 Docker Image Available

#### 1. Update Pragma
```compact
// Change from:
pragma language_version >= 0.17.0;

// To:
pragma language_version >= 0.18.0;
```

#### 2. Use Hex Literals Directly
```compact
// Before (0.17.0 workaround):
return default<Bytes<32>>;

// After (0.18.0 native):
return 0x0000000000000000000000000000000000000000000000000000000000000000;

// Or even better:
const ZERO_HASH: Bytes<32> = 0x0000000000000000000000000000000000000000000000000000000000000000;
return ZERO_HASH;
```

#### 3. Check for `slice` Identifier
```bash
# Search for slice usage
grep -r "slice" contracts/*.compact
```
If found and not using the new keyword, rename it.

#### 4. Leverage New Features
- Use spread for bytes concatenation
- Use new bytes literal syntax
- Use slice for extracting subranges

### Example Updates

**Before**:
```compact
const emptyProof = default<Bytes<256>>;
const zeroHash = default<Bytes<32>>;
```

**After**:
```compact
const emptyProof: Bytes<256> = 0x00...00;  // 256 bytes
const zeroHash: Bytes<32> = 0x0000000000000000000000000000000000000000000000000000000000000000;

// Or use new syntax:
const combinedHash = Bytes[...hash1, ...hash2];
```

---

## 📊 Performance Notes

### Bytes vs Vector
- **Bytes**: Packed representation (31 bytes per field)
  - More expensive operations
  - Smaller on-chain storage
  - Better for persistence

- **Vector**: Unpacked representation (≥1 field per element)
  - Cheaper operations
  - Larger proof size
  - Better for computation

**Recommendation**: Use Vector for computation, cast to Bytes for storage

---

## 🔗 Resources

- **Documentation**: https://docs.midnight.network/
- **LFDT Project**: Linux Foundation Decentralized Trust
- **Compiler**: Still named `compact` (gradual migration)
- **Docker**: midnightnetwork/compactc (awaiting 0.26.0 release)

---

## ✅ Action Items for AgenticDID

- [ ] Wait for Docker image midnightnetwork/compactc:0.26.0
- [ ] Update pragma to `>= 0.18.0`
- [ ] Replace `default<Bytes<32>>` with hex literals
- [ ] Check for `slice` identifier conflicts
- [ ] Test compilation with 0.26.0
- [ ] Update documentation to mention Minokawa
- [ ] Add `disclose()` declarations for privacy warnings

---

**Saved**: October 28, 2025  
**Status**: Awaiting Docker image release  
**Contacts**: Midnight Network Team, LFDT Community
