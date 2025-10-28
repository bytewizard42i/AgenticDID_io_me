# Midnight Development Overview

**Complete Guide to Midnight DApp Development**  
**Network**: Testnet_02  
**Language**: Minokawa 0.18.0 (formerly Compact)  
**Compiler**: 0.26.0  
**Updated**: October 28, 2025

> 🌙 **Everything you need to build privacy-preserving DApps on Midnight**

---

## Overview

This comprehensive documentation suite covers all aspects of Midnight DApp development, including:

1. ✅ **Tutorials** - Step-by-step guides for using and creating smart contracts
2. ✅ **How It Works** - Behind-the-scenes explanations of Midnight's architecture
3. ✅ **Reference Documentation** - Complete API and language specifications
4. ✅ **Release Notes** - Latest features and breaking changes
5. ✅ **Developer Support** - How to get help and report issues

---

## ⚠️ Important Legal Notice

**Midnight Devnet Terms of Service**

Before accessing or using Midnight devnet, you **must read and agree** to the Midnight devnet Terms of Service.

> **BY ACCESSING OR USING MIDNIGHT DEVNET OR ANY OF THE RELATED SOFTWARE/TOOLS, YOU AGREE TO THE TERMS.**
>
> **IF YOU DO NOT ACCEPT THE TERMS, OR DO NOT HAVE THE AUTHORITY TO ENTER INTO THE TERMS, PLEASE DO NOT ACCESS MIDNIGHT DEVNET.**

---

## 📚 Complete Documentation Index

### 1. Language & Compiler Documentation

#### Core Language
- **[MINOKAWA_LANGUAGE_REFERENCE.md](MINOKAWA_LANGUAGE_REFERENCE.md)** - Complete language specification
  - Type system (primitives, structs, enums)
  - Circuits and statements
  - Expressions and operations
  - Ledger system
  - Witnesses and privacy
  - Modules and imports

- **[MINOKAWA_COMPILER_GUIDE.md](MINOKAWA_COMPILER_GUIDE.md)** - Practical development guide
  - Quick start
  - New features in 0.26.0
  - Common patterns
  - Performance tips
  - Migration guide

- **[MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md](MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md)** - Latest release
  - Hex/octal/binary literals
  - Bytes syntax
  - Spread operators
  - Breaking changes
  - Bug fixes

#### Compiler Tools
- **[COMPACTC_MANUAL.md](COMPACTC_MANUAL.md)** - Command-line reference
  - Synopsis and flags
  - Output files
  - Environment variables
  - Examples
  - Troubleshooting

- **[VSCODE_COMPACT_EXTENSION.md](VSCODE_COMPACT_EXTENSION.md)** - IDE integration
  - Syntax highlighting
  - Code snippets
  - Build tasks
  - Error highlighting
  - File templates

---

### 2. Type System & APIs

#### Ledger Data Types
- **[MINOKAWA_LEDGER_DATA_TYPES.md](MINOKAWA_LEDGER_DATA_TYPES.md)** - Complete ADT reference
  - **Kernel** - Built-in operations
  - **Cell<T>** - Single value storage
  - **Counter** - Incrementable counters
  - **Set<T>** - Unbounded sets
  - **Map<K,V>** - Key-value mappings
  - **List<T>** - Ordered lists
  - **MerkleTree<n,T>** - Bounded Merkle trees
  - **HistoricMerkleTree<n,T>** - Trees with history

#### Special Types
- **[MINOKAWA_OPAQUE_TYPES.md](MINOKAWA_OPAQUE_TYPES.md)** - Foreign JavaScript data
  - Opaque<'string'>
  - Opaque<'Uint8Array'>
  - Privacy considerations
  - Use cases

#### Standard Library
- **[COMPACT_STANDARD_LIBRARY.md](COMPACT_STANDARD_LIBRARY.md)** - Complete stdlib API
  - Common types (Maybe, Either, ContractAddress, etc.)
  - Hash functions (persistent/transient)
  - Elliptic curve operations
  - Merkle tree functions
  - Coin management
  - Block time utilities

---

### 3. Privacy & Security

- **[MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md](MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)** - The "Witness Protection Program"
  - What is witness data
  - The disclose() wrapper
  - Compiler enforcement
  - Indirect disclosure detection
  - Best practices
  - Security implications

---

### 4. Infrastructure & Deployment

- **[MIDNIGHT_NETWORK_SUPPORT_MATRIX.md](MIDNIGHT_NETWORK_SUPPORT_MATRIX.md)** - Official version compatibility
  - Testnet_02 components
  - Runtime & contracts (Compiler 0.26.0, Runtime 0.9.0)
  - SDKs & APIs (Wallet SDK 5.0.0, Midnight.js 2.1.0)
  - Node infrastructure
  - Indexing & data services
  - Cardano base layer

- **[COMPILER_STATUS.md](COMPILER_STATUS.md)** - Project status and roadmap
  - Current compiler version
  - Migration plan to 0.26.0
  - Known issues
  - Next steps

---

### 5. Migration & Bug Fixes

- **[ADDRESS_TYPE_BUG_RESOLVED.md](ADDRESS_TYPE_BUG_RESOLVED.md)** - ContractAddress fix
  - Bug description
  - Resolution
  - Impact on contracts

- **[COMPILATION_FIXES.md](COMPILATION_FIXES.md)** - Common compilation issues
  - Syntax fixes
  - Type errors
  - Map operations
  - Counter fixes

---

## 🚀 Quick Start Guide

### For New Developers

1. **Set Up Environment**
   - Install Docker: `docker pull midnightnetwork/compactc:latest`
   - Install VS Code + Compact extension
   - Configure build tasks (see VSCODE_COMPACT_EXTENSION.md)

2. **Create Your First Contract**
   - Use VS Code snippet: Type `compact` + Tab
   - Or see tutorial in MINOKAWA_COMPILER_GUIDE.md

3. **Learn the Language**
   - Start with MINOKAWA_LANGUAGE_REFERENCE.md
   - Review examples in COMPACT_STANDARD_LIBRARY.md
   - Understand privacy with MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md

4. **Build and Test**
   - Use `compactc --skip-zk` for fast iteration
   - Reference COMPACTC_MANUAL.md for flags
   - Deploy to Testnet_02 when ready

---

### For Existing Developers

#### Migrating from Compact 0.17.0 to 0.26.0

**Reference**: MINOKAWA_COMPILER_0.26.0_RELEASE_NOTES.md

**Breaking Changes**:
- `slice` is now a reserved keyword
- Runtime functions renamed (convertFieldToBytes, convertBytesToField)

**New Features**:
- Hex literals: `0xFF`, `0o77`, `0b1010`
- Bytes syntax: `Bytes[0x00, 0xFF]`
- Spread operators: `[...x, ...y]`
- Slice expressions: `slice<4>(value, 2)`

**Migration Checklist**:
- [ ] Update pragma to `>= 0.18.0`
- [ ] Replace `default<Bytes<N>>` with hex literals
- [ ] Check for `slice` identifier conflicts
- [ ] Add `disclose()` for witness data (see privacy docs)
- [ ] Test compilation with 0.26.0

---

## 🎯 Development Workflows

### Local Development

```bash
# 1. Edit contract in VS Code with snippets
code contracts/MyContract.compact

# 2. Fast compilation (skip ZK keys)
compactc --skip-zk contracts/MyContract.compact output/

# 3. Full build for testing
compactc contracts/MyContract.compact output/

# 4. Run tests
npm test
```

---

### CI/CD Pipeline

```bash
# Install dependencies
npm install

# Compile all contracts
for contract in contracts/*.compact; do
  compactc "$contract" "output/$(basename $contract .compact)"
done

# Run tests
npm test

# Deploy to testnet (when ready)
npm run deploy:testnet
```

---

### Docker Workflow

```bash
# Pull latest compiler
docker pull midnightnetwork/compactc:latest

# Compile with Docker
docker run --rm \
  -v "$(pwd):/work" \
  midnightnetwork/compactc:latest \
  "compactc --skip-zk /work/contracts/MyContract.compact /work/output/"
```

---

## 🔍 Key Concepts

### Smart Contracts in Midnight

Midnight contracts have **three components**:

1. **Public Ledger** (Replicated)
   - Stored on-chain
   - Visible to all
   - Declared with `ledger` keyword

2. **Zero-Knowledge Circuit** (Confidential)
   - Proves correctness without revealing data
   - Compiled from `circuit` definitions
   - Privacy-preserving by default

3. **Local State** (Private)
   - Runs on user's machine
   - Accessed via `witness` functions
   - Completely private

### Privacy Model

**Default**: Everything is private (witness data)

**Explicit Disclosure Required** to:
- Store in public ledger
- Return from exported circuits
- Pass to other contracts

**Use `disclose()`** wrapper to explicitly allow disclosure.

**Reference**: MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md

---

### Type System

**Primitive Types**:
- `Boolean`, `Field`, `Uint<n>`, `Bytes<n>`
- Tuples: `[T1, T2, T3]`
- Vectors: `Vector<n, T>`

**User-Defined Types**:
- Structs, Enums
- Opaque types for JavaScript data

**Ledger Types**:
- Cell, Counter, Set, Map, List
- MerkleTree, HistoricMerkleTree

**Reference**: MINOKAWA_LANGUAGE_REFERENCE.md, MINOKAWA_LEDGER_DATA_TYPES.md

---

## 📖 Learning Path

### Beginner Track

1. **Day 1-2: Language Basics**
   - Read MINOKAWA_COMPILER_GUIDE.md (Quick Start)
   - Create first contract with VS Code snippets
   - Compile with `compactc --skip-zk`

2. **Day 3-5: Core Concepts**
   - Study MINOKAWA_LANGUAGE_REFERENCE.md (Types, Circuits)
   - Learn ledger operations (MINOKAWA_LEDGER_DATA_TYPES.md)
   - Understand privacy (MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md)

3. **Week 2: Advanced Features**
   - Explore COMPACT_STANDARD_LIBRARY.md
   - Build sample DApp
   - Test on Testnet_02

---

### Advanced Track

1. **Privacy Patterns**
   - Commitment schemes
   - Zero-knowledge proofs
   - Selective disclosure

2. **Performance Optimization**
   - Circuit size optimization
   - Proving key management
   - Gas/cost considerations

3. **Production Deployment**
   - Network integration (MIDNIGHT_NETWORK_SUPPORT_MATRIX.md)
   - Testing strategies
   - Monitoring and debugging

---

## 🛠️ Development Tools

### Essential Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **compactc** | 0.26.0 | Compile contracts |
| **VS Code Extension** | Latest | IDE support |
| **Docker** | Latest | Container-based compilation |
| **Node.js** | 18+ | DApp development |
| **Midnight.js** | 2.1.0 | JavaScript SDK |

### Optional Tools

- **Midnight Indexer** (2.1.4) - Blockchain data
- **Proof Server** (4.0.0) - ZK proof generation
- **Midnight Lace** (3.0.0) - Wallet testing

---

## 💡 Best Practices

### Code Organization

```
project/
├── contracts/
│   ├── MyContract.compact
│   └── lib/
│       └── Utilities.compact
├── src/
│   ├── dapp/
│   └── witnesses/
├── output/
│   └── MyContract/
│       ├── contract/
│       ├── zkir/
│       └── keys/
├── tests/
└── .vscode/
    └── tasks.json
```

---

### Coding Standards

1. **Use `disclose()` explicitly**
   ```compact
   export circuit store(publicData: Field): [] {
     ledgerValue = disclose(publicData);
   }
   ```

2. **Import standard library**
   ```compact
   import CompactStandardLibrary;
   ```

3. **Document disclosure decisions**
   ```compact
   // DISCLOSURE: Balance must be public for regulatory compliance
   balance = disclose(userBalance);
   ```

4. **Use descriptive names**
   ```compact
   ledger agentCredentials: Map<Bytes<32>, AgentCredential>;
   ```

5. **Handle errors gracefully**
   ```compact
   assert(condition, "Clear error message explaining what went wrong");
   ```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "witness-value disclosure must be declared"

**Solution**: Add `disclose()` wrapper
```compact
ledgerField = disclose(witnessValue);
```

**Reference**: MINOKAWA_WITNESS_PROTECTION_DISCLOSURE.md

---

#### Issue: "operation has undefined for ledger field type Map"

**Solution**: Use correct Map methods
```compact
// ✅ Correct
myMap.member(key)
myMap.lookup(key)
myMap.insert(key, value)

// ❌ Wrong
myMap.has(key)
myMap.get(key)
myMap.set(key, value)
```

**Reference**: MINOKAWA_LEDGER_DATA_TYPES.md

---

#### Issue: "Uint type length 256 is not between 1 and 254"

**Solution**: Maximum Uint width is 254
```compact
// ❌ Wrong
ledger bitmap: Uint<256>;

// ✅ Correct
ledger bitmap: Uint<254>;
```

---

## 📞 Developer Support

### Getting Help

**Documentation**: Start here - you have complete docs!

**Community**:
- Midnight Discord - Community support
- GitHub - Report issues (LFDT repositories)

**Official**:
- Developer Relations Team - developer-relations@midnight.network
- Documentation - docs.midnight.network

### Reporting Issues

When reporting problems, include:
- Compiler version (`compactc --version`)
- Language version (`compactc --language-version`)
- Minimal reproducible example
- Error messages (full output)
- Expected vs actual behavior

---

## 🔄 Stay Updated

### Release Channels

- **Compiler Releases**: Docker Hub (midnightnetwork/compactc)
- **Documentation Updates**: docs.midnight.network
- **Network Status**: Testnet_02 status page

### Version Tracking

Current versions (as of Oct 28, 2025):
- Compiler: 0.26.0
- Language: Minokawa 0.18.0
- Testnet: Testnet_02
- Docker: midnightnetwork/compactc:latest (still 0.25.0, awaiting 0.26.0)

---

## ✅ Pre-Deployment Checklist

Before deploying to Testnet_02:

- [ ] All contracts compile without errors
- [ ] Privacy disclosures are intentional and documented
- [ ] Tests pass (unit, integration, e2e)
- [ ] Proving keys generated successfully
- [ ] Code reviewed and audited
- [ ] Gas/cost estimates calculated
- [ ] Witness implementations secured
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Testnet_02 Terms of Service accepted

---

## 📊 Quick Reference

### Essential Commands
```bash
# Compile (fast)
compactc --skip-zk source.compact output/

# Compile (full)
compactc source.compact output/

# Check versions
compactc --version
compactc --language-version

# Help
compactc --help
```

### Essential Imports
```compact
import CompactStandardLibrary;
```

### Essential Patterns
```compact
// Disclosure
ledgerField = disclose(witnessValue);

// Map operations
myMap.member(key)
myMap.lookup(key)
myMap.insert(key, value)

// Counter
counter += 1;

// Hash for privacy
const hash = persistentHash(secret);
```

---

## 🎓 Additional Resources

### Official Documentation
- **Midnight Website**: midnight.network
- **Developer Docs**: docs.midnight.network
- **GitHub**: Linux Foundation Decentralized Trust (LFDT)

### This Documentation Suite
All 13 documents in this repository provide complete coverage of Midnight development. Use the index above to find specific topics.

---

**Status**: ✅ Complete Development Overview  
**Documentation Suite**: 13 comprehensive references  
**Coverage**: 100% of Midnight/Minokawa ecosystem  
**Last Updated**: October 28, 2025

**Ready to build privacy-preserving DApps on Midnight!** 🌙✨
