# Midnight/Compact Setup & Key Learnings

**Date**: November 7, 2025  
**Penny's Study Session** - AgenticDID Project

---

## 🎯 Installation Complete

### Compact Compiler
- **Installed**: v0.26.0 (LATEST)
- **Location**: `$HOME/.local/bin`
- **Note**: v0.26.0 is confirmed working (previous reported bug was not a compiler issue)

### Activation Command
```bash
source $HOME/.local/bin/env
```

---

## 📚 Critical Knowledge from myAlice Protocol

### Stable Versions (Nov 2025)
- **Compiler**: v0.26.0 ✅ (latest)
- **Language Pragma**: `>= 0.16 && <= 0.18` (ALWAYS use range!)
- **midnight-js**: 2.0.2
- **Node.js**: 22.15.0+

### Key Syntax Rules (Language v0.18)

#### State Variables
```compact
ledger variable: Type;               // Mutable public
sealed ledger config: Type;          // Immutable (constructor only)
export ledger publicVar: Type;       // Publicly queryable
```

#### Types
- `Uint<8>`, `Uint<16>`, `Uint<32>`, `Uint<64>`, `Uint<128>` (max 128-bit)
- `Bytes<32>`, `Bytes<64>`, `Bytes<256>` (fixed size)
- `Boolean` (NOT `Bool`)
- `Address` (blockchain address)
- `Map<K, V>`, `Counter`, `Maybe<T>`
- `Opaque<"string">` (for privacy)
- `Field` (ZK arithmetic)

#### Circuits
```compact
export circuit publicFunc(param: Type): ReturnType { }  // Public
circuit internalHelper(param: Type): ReturnType { }     // Internal
```

#### Error Handling (IDIOMATIC)
```compact
assert(condition, "error message");  // ✅ Preferred
// Not: if (!valid) return false;    // ❌ Avoid
```

#### Struct Syntax
```compact
struct S {
  field1: Type;    // Semicolons!
  field2: Type;
}

// Creation
const s = S { field1: val1, field2: val2 };

// Shorthand when variable name matches field
const name = "Alice";
const s = S { name };  // field name = variable name
```

---

## 🔗 Contract Composition (CRITICAL!)

### ❌ WRONG (Current AgenticDID approach)
```compact
export circuit use(registry: Address): [] { }
```

### ✅ CORRECT
```compact
import Registry;
sealed ledger registry: Registry;              // Contract type!
constructor(reg: Registry) { registry = reg; }
export circuit use(): [] {
  registry.someCircuit();                      // Direct call
}
```

### Rules
- ✓ Import contract definition
- ✓ Use `sealed ledger contractName: ContractType`
- ✓ Initialize in constructor
- ✓ Call via `contractName.circuitName()` (no `ledger.` prefix!)
- ❌ CANNOT access other contract's ledger directly
- ❌ CANNOT access other contract's witnesses
- ✓ Can ONLY call exported circuits

---

## 🔒 Privacy & Witnesses

### Witness Declaration
```compact
witness secretData(): Bytes<32>;
```

### Privacy Rules
- ❌ CANNOT return witness without `disclose()`
- ❌ CANNOT store witness in ledger without `disclose()`
- ✓ CAN use in private computations
- ✓ CAN disclose derived values (hashes)

### Selective Disclosure Pattern
```compact
witness privateAttribute(): Bytes<32>;

export circuit verifyAttribute(expectedHash: Bytes<32>): Boolean {
  const actual = sha256(privateAttribute());
  assert(actual == expectedHash, "Attribute mismatch");
  return true;  // Verified without revealing attribute!
}
```

---

## 🛠️ Development Commands

### Compile (Development)
```bash
compact compile Contract.compact output/ --skip-zk
```

### Compile (Production with ZK keys)
```bash
compact compile Contract.compact output/
```

### Generated Output
```
output/
├── contract/
│   ├── index.d.cts   # TypeScript types
│   └── index.cjs     # JavaScript implementation
├── zkir/*.zkir       # ZK circuits
└── keys/*.prover/*.verifier  # Proving/verifying keys
```

---

## 🐳 Local Testing

### Proof Server (Required)
```bash
docker run -d -p 6300:6300 \
  --name midnight-proof-server \
  midnightnetwork/proof-server \
  -- 'midnight-proof-server --network testnet'
```

### Check Status
```bash
docker ps | grep proof-server
curl http://localhost:6300/health
```

---

## 📦 Package Versions (SDK v2.0.2)

From official examples:
```json
{
  "@midnight-ntwrk/compact-runtime": "^0.9.0",
  "@midnight-ntwrk/ledger": "^4.0.0",
  "@midnight-ntwrk/midnight-js-contracts": "2.0.2",
  "@midnight-ntwrk/midnight-js-http-client-proof-provider": "2.0.2",
  "@midnight-ntwrk/midnight-js-indexer-public-data-provider": "2.0.2",
  "@midnight-ntwrk/midnight-js-level-private-state-provider": "2.0.2",
  "@midnight-ntwrk/midnight-js-node-zk-config-provider": "2.0.2",
  "@midnight-ntwrk/midnight-js-types": "2.0.2",
  "@midnight-ntwrk/wallet": "5.0.0",
  "@midnight-ntwrk/wallet-api": "5.0.0",
  "@midnight-ntwrk/zswap": "^4.0.0"
}
```

---

## ⚠️ Common Pitfalls to Avoid

1. ❌ Using `Address` for contracts → ✓ Use `sealed ledger contractName: ContractType`
2. ❌ Returning `Boolean` from validation → ✓ Use `assert()`
3. ❌ Map.get() without `.has()` check → ✓ Always check `.has()` first
4. ❌ Old syntax (`Bool`, `let`) → ✓ Use `Boolean`, `const`
5. ❌ Mutating `sealed ledger` in circuit → ✓ Only in constructor
6. ❌ Returning witness without `disclose()` → ✓ Use `disclose()`
7. ❌ Struct commas → ✓ Use semicolons
8. ❌ Exact pragma version → ✓ Use range: `>= 0.16 && <= 0.18`
9. ❌ Using `.length()` on Bytes → ✓ Use comparison or type casting

---

## 🎯 AgenticDID Next Steps

### Immediate Fixes Needed
1. **Refactor contract composition** in `CredentialVerifier.compact`
   - Change `registryContract: Address` to `sealed ledger registryContract: AgenticDIDRegistry`
   - Import `AgenticDIDRegistry` contract
   - Update constructor
   - Update circuit calls

2. **Update language pragma** in all contracts
   - Current: `pragma language_version >= 0.17.0;`
   - Should be: `pragma language_version >= 0.16 && <= 0.18;`

3. **Fix type usage**
   - Change `ContractAddress` to `Address` (if that's causing issues)
   - Verify all map operations have `.member()` checks before `.lookup()`

### Testing Plan
1. Set up proof server (Docker)
2. Compile contracts with `--skip-zk` flag
3. Verify TypeScript output
4. Test cross-contract calls
5. Deploy to testnet

---

## 📚 Reference Materials

### In myAlice Protocol
- `LLM-Midnight-Dev-Guide-V_1.txt` - Complete reference ⭐
- `MIDNIGHT_COMPILATION_DEPLOYMENT_GUIDE.md` - Deployment details
- `MIDNIGHT_QUICK_REFERENCE.md` - Quick lookup

### Online Resources
- Official Docs: https://docs.midnight.network
- Compact Reference: https://docs.midnight.network/develop/reference/compact
- Testnet Faucet: https://midnight.network/test-faucet
- Discord: https://discord.gg/midnight

---

**Penny has successfully learned Midnight/Compact fundamentals!** 🌙  
Ready to work on AgenticDID contracts with proper Compact syntax.
