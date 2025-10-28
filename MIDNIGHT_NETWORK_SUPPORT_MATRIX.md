# Midnight Network Support Matrix

**Last Updated**: October 28, 2025  
**Network**: Testnet_02  
**Source**: Official Midnight Network Documentation

> ⚠️ **Important**: This matrix reflects the latest TESTED versions only. Earlier versions may still work, but Midnight does not guarantee compatibility or provide support for them.

---

## 📊 Component Version Matrix

### Network Infrastructure

| Functional Area | Component | Version | Notes |
|----------------|-----------|---------|-------|
| **Network** | Testnet_02 | Current | Current testnet environment |
| **Node** | Midnight Node | **0.12.1** | Midnight testnet node |

---

### Runtime & Contracts

| Component | Version | Notes |
|-----------|---------|-------|
| **Compactc** | **0.26.0** | Contract compiler (Minokawa 0.18.0) |
| **Compact-runtime** | **0.9.0** | Runtime library for contracts |
| **Onchain-runtime** | **0.3.0** | On-chain runtime support |
| **Ledger** | **4.0.0** | Core ledger logic |

---

### SDKs & APIs

| Component | Version | Notes |
|-----------|---------|-------|
| **Wallet SDK** | **5.0.0** | JS SDK for building dApps |
| **Midnight.js** | **2.1.0** | JavaScript bindings for Midnight APIs |
| **DApp Connector API** | **3.0.0** | Web dApp session management & auth |
| **Wallet API** | **5.0.0** | API for wallet operations |
| **Midnight Lace** | **3.0.0** | Devnet-compatible wallet (formerly Lace) |

---

### Indexing & Data

| Component | Version | Notes |
|-----------|---------|-------|
| **Midnight Indexer** | **2.1.4** | Midnight-specific blockchain indexer |
| **db-sync** | **13.6.0.4** | Cardano db-sync compatibility |
| **Ogmios** | **6.11.0** | Lightweight JSON/WSP node interface |

---

### ZK & Proving Services

| Component | Version | Notes |
|-----------|---------|-------|
| **Proof Server** | **4.0.0** | Handles ZKP proof generation |

---

### Partner Chain Integration

| Component | Version | Notes |
|-----------|---------|-------|
| **Partner Chains Node** | **1.5** | Interop node with external chains |

---

### Cardano Base Layer

| Component | Version | Notes |
|-----------|---------|-------|
| **Cardano Node** | **10.1.4** | Required base layer sync |

---

## 🎯 AgenticDID Compatibility Status

### Current Development Environment

| Our Component | Version | Testnet_02 Support | Status |
|---------------|---------|-------------------|--------|
| **Minokawa Compiler** | 0.25.0 (Docker) | 0.26.0 required | ⏳ Awaiting Docker update |
| **Language Version** | 0.17.0 | 0.18.0 required | ⏳ Will update with compiler |
| **Compact-runtime** | - | 0.9.0 | ⏳ Need to integrate |
| **Proof Server** | 4.0.0 (local) | 4.0.0 | ✅ Compatible |
| **Midnight Node** | - | 0.12.1 | 📋 Need to install |

### Docker Images

| Image | Our Version | Testnet Version | Status |
|-------|-------------|-----------------|--------|
| `midnightnetwork/compactc` | latest (0.25.0) | 0.26.0 | ⏳ Awaiting update |
| `midnightnetwork/proof-server` | latest (4.0.0) | 4.0.0 | ✅ Compatible |
| `midnightnetwork/midnight-node` | - | 0.12.1 | 📋 Need to pull |

---

## 📋 Integration Checklist

### Immediate Actions
- [ ] Monitor Docker Hub for `compactc:0.26.0` release
- [ ] Pull `midnight-node:0.12.1` when needed
- [ ] Verify Proof Server 4.0.0 compatibility

### When Compiler 0.26.0 Available
- [ ] Update contracts to language version 0.18.0
- [ ] Replace `default<Bytes<32>>` with hex literals
- [ ] Test compilation with new compiler
- [ ] Integrate Compact-runtime 0.9.0

### SDK Integration (Future)
- [ ] Integrate Wallet SDK 5.0.0
- [ ] Integrate Midnight.js 2.1.0
- [ ] Implement DApp Connector API 3.0.0
- [ ] Test with Midnight Lace 3.0.0

### Testnet Deployment (Future)
- [ ] Connect to Testnet_02
- [ ] Deploy contracts to testnet
- [ ] Test ZKP generation with Proof Server 4.0.0
- [ ] Verify indexer compatibility (2.1.4)

---

## 🔗 Component Dependencies

### Contract Development Stack
```
Compactc 0.26.0 (Minokawa 0.18.0)
    ├── Compact-runtime 0.9.0
    ├── Onchain-runtime 0.3.0
    └── Ledger 4.0.0
```

### DApp Development Stack
```
Wallet SDK 5.0.0
    ├── Midnight.js 2.1.0
    ├── DApp Connector API 3.0.0
    └── Wallet API 5.0.0
```

### Node Infrastructure Stack
```
Midnight Node 0.12.1
    ├── Cardano Node 10.1.4 (base layer)
    ├── Proof Server 4.0.0
    └── Midnight Indexer 2.1.4
            ├── db-sync 13.6.0.4
            └── Ogmios 6.11.0
```

---

## ⚠️ Version Compatibility Notes

### Critical Pairings

1. **Compiler + Runtime**
   - Compactc 0.26.0 **requires** Compact-runtime 0.9.0
   - Runtime breaking changes in 0.9.0 (function renames)

2. **Node + Cardano**
   - Midnight Node 0.12.1 **requires** Cardano Node 10.1.4
   - Must sync base layer for testnet participation

3. **Wallet + APIs**
   - Midnight Lace 3.0.0 compatible with Wallet API 5.0.0
   - DApp Connector API 3.0.0 matches SDK versions

4. **Indexer Stack**
   - Midnight Indexer 2.1.4 tested with db-sync 13.6.0.4
   - Ogmios 6.11.0 provides WebSocket interface

### Breaking Changes

- **Compact-runtime 0.8.0 → 0.9.0**:
  - `convert_bigint_to_Uint8Array` → `convertFieldToBytes`
  - `convert_Uint8Array_to_bigint` → `convertBytesToField`
  - Added source position parameter

- **Compactc 0.25.0 → 0.26.0**:
  - `slice` is now a reserved keyword
  - Hex literal syntax support added
  - Many new type casts available

---

## 📊 Installation Commands

### Docker Images
```bash
# Compiler (when 0.26.0 available)
docker pull midnightnetwork/compactc:0.26.0

# Proof Server
docker pull midnightnetwork/proof-server:4.0.0

# Midnight Node
docker pull midnightnetwork/midnight-node:0.12.1
```

### NPM Packages (when available)
```bash
# Wallet SDK
npm install @midnight-ntwrk/wallet-sdk@5.0.0

# Midnight.js
npm install @midnight-ntwrk/midnight-js@2.1.0

# DApp Connector
npm install @midnight-ntwrk/dapp-connector-api@3.0.0
```

---

## 🔄 Update Strategy

### Monthly Checks
- Monitor Midnight releases for version updates
- Check Docker Hub for new image releases
- Review release notes for breaking changes

### Before Major Updates
1. Review compatibility matrix
2. Check breaking changes
3. Test in development environment
4. Update documentation
5. Deploy to testnet
6. Verify all integrations

---

## 📞 Support Resources

- **Documentation**: https://docs.midnight.network/
- **Discord**: Midnight Network Community
- **GitHub**: Linux Foundation Decentralized Trust (LFDT)
- **Testnet**: Testnet_02 explorer and tools

---

## ✅ Quick Reference

### Current Testnet_02 Versions (One-Liner)
```
Node:0.12.1 | Compiler:0.26.0 | Runtime:0.9.0 | Ledger:4.0.0 | 
Proof:4.0.0 | Wallet:5.0.0 | Midnight.js:2.1.0 | Indexer:2.1.4
```

### Minimum Required for Contract Development
- Compactc: 0.26.0
- Compact-runtime: 0.9.0
- Proof Server: 4.0.0

### Minimum Required for Full DApp
- All contract requirements +
- Wallet SDK: 5.0.0
- Midnight.js: 2.1.0
- Midnight Node: 0.12.1

---

**Note**: Always verify against official Midnight documentation for the latest compatibility information.

**Matrix Source**: https://docs.midnight.network/  
**Testnet**: Testnet_02  
**Last Verified**: October 28, 2025
