# Midnight Network - Complete Reference

**Canonical Source**: `/home/js/PixyPi/myAlice/midnight-docs/`  
**Updated**: October 29, 2025

---

## 📚 Quick Navigation

All Midnight documentation is consolidated in the **PixyPi reference workspace**. This prevents duplication and ensures a single source of truth.

### Essential References

#### Getting Started
- **[MIDNIGHT_QUICKSTART.md](../../PixyPi/myAlice/midnight-docs/MIDNIGHT_QUICKSTART.md)** - Quick start guide
- **[MIDNIGHT_INDEX.md](../../PixyPi/myAlice/midnight-docs/MIDNIGHT_INDEX.md)** - Complete navigation

#### Language & Compiler
- **Minokawa Language v0.18.0** - Compact language reference
- **Compiler**: compactc v0.26.0
- **Standard Library** - Built-in functions and types
- **Witness Protection** - `disclose()` and privacy patterns

#### APIs & SDKs
- **Ledger API** - @midnight-ntwrk/ledger v3.0.2 (129 items)
- **Midnight.js** - Framework API (8 packages)
- **Contracts API** - Contract interaction layer
- **DApp Connector** - Wallet integration

#### Architecture
- **How Midnight Works** - Platform architecture
- **Transaction Structure** - TX details and flow
- **Zswap** - Shielded token mechanism
- **Privacy Model** - Selective disclosure patterns

#### Development
- **[MIDNIGHT_COMPILATION_DEPLOYMENT_GUIDE.md](../../PixyPi/myAlice/MIDNIGHT_COMPILATION_DEPLOYMENT_GUIDE.md)** - Compilation & deployment
- **Patterns** - Production patterns (credentials, access control, etc.)
- **Examples** - Smart contract examples

---

## 🔗 Key Links

### Official Midnight Documentation
- [Midnight Network](https://midnight.network)
- [Official Docs](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/)
- [GitHub Organization](https://github.com/midnightntwrk)

### AgenticDID-Specific
- **[contracts/](./contracts/)** - Our Minokawa smart contracts
  - `AgenticDIDRegistry.compact` - Agent registration & delegation
  - `CredentialVerifier.compact` - ZKP verification + spoof transactions
  - `ProofStorage.compact` - Merkle proofs & audit logs

- **[MIDNIGHT_INTEGRATION_PLAN.md](./MIDNIGHT_INTEGRATION_PLAN.md)** - Our deployment plan (keep this one)

### Development Guides (Our Project)
- **[AGENT_DELEGATION_WORKFLOW.md](./AGENT_DELEGATION_WORKFLOW.md)** - Multi-party auth workflow
- **[PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md)** - Spoof transactions & privacy

---

## 📖 Reference Lookup

Need specific Midnight API details? Check PixyPi:

```bash
cd /home/js/PixyPi/myAlice/midnight-docs/

# View index
cat MIDNIGHT_INDEX.md

# Search for specific topic
grep -r "persistentHash" .
grep -r "ledger state" .
grep -r "ZK proof" .
```

---

## 🎯 For Development

### Compiling Contracts

```bash
cd contracts/
compactc AgenticDIDRegistry.compact
compactc CredentialVerifier.compact
compactc ProofStorage.compact
```

See: `/home/js/PixyPi/myAlice/MIDNIGHT_COMPILATION_DEPLOYMENT_GUIDE.md`

### API References

**When coding**, reference PixyPi docs for:
- Function signatures
- Type definitions
- Circuit patterns
- Privacy best practices

**Don't copy docs** - keep PixyPi as canonical source to avoid version drift.

---

## 📝 Notes

**Why consolidate?**
1. **Single source of truth** - PixyPi is the canonical reference
2. **Avoid version drift** - Updates happen in one place
3. **Cleaner repo** - Focus on our code, not duplicated docs
4. **Faster updates** - No need to sync 28 files

**What about offline access?**
- PixyPi workspace is always available locally
- Official Midnight docs are online
- Our contract code has inline documentation

---

**Last Updated**: October 29, 2025  
**Consolidated from**: 28 individual Midnight documentation files
