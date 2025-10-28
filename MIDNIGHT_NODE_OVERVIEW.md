# Midnight Node Overview

**Foundational Infrastructure**  
**Network**: Testnet_02  
**Updated**: October 28, 2025

> 🌐 **The backbone of the Midnight network**

---

## What is the Midnight Node?

The **Midnight Node** provides foundational infrastructure for operating on the Midnight network.

**Built on**: Polkadot SDK  
**Type**: Cardano Partnerchain node  
**Purpose**: Protocol implementation, P2P networking, decentralization

---

## Core Functions

### 1. Run the Midnight Ledger

**Responsibility**: Execute and enforce protocol rules

**Components**:
- Separate ledger component
- Internal state integrity maintenance
- Transaction validation

---

### 2. Peer-to-Peer Capabilities

**Enables**:
- ✅ Node discovery
- ✅ Connection establishment
- ✅ State gossip
- ✅ Network synchronization

---

### 3. Decentralization Support

**Node Types**:
- **Trustless nodes** - Open participation
- **Permissioned nodes** - Authorized validators

**Partnerchain Requirements**:
- Integration with Cardano
- Defined connection mechanisms
- Consensus participation

---

## Architecture

**Technology Stack**: Polkadot SDK

**Components**:
- Partnerchain integration
- Midnight Ledger implementation
- Consensus mechanisms
- Network layer

---

## Core Parameters

| Parameter | Value |
|-----------|-------|
| **Block Time** | 6 seconds |
| **Session Length** | 1200 slots |
| **Ledger Transactions per Block** | TBD |
| **Hash Function** | blake2_256 |
| **Account Type** | sr25519 public key |

---

## Genesis Configuration

### Ledger (Testnet)

**Initial Supply**: 100,000,000,000,000,000 units

**Distribution**:
- Split into 5 outputs each
- Across 4 wallets
- 4 × 5 × 5,000,000,000,000,000

⚠️ **Testnet only**: Does NOT reflect mainnet supply

---

### Consensus

**Initial Validator Set**:
- 12 trusted nodes (operated by Shielded)
- Many registered community nodes

**'D' Parameter**: Controls permissioned vs registered node split

---

### Onchain Governance

**Current**: Master ("sudo") key with elevated privileges

**Purpose**: Temporary placeholder for future governance

**tx-pause Functionality**:
- Governance-authorized transactions
- Can pause specific transaction types
- Emergency mechanism

---

## Signature Schemes

Different cryptographic schemes for different operations:

| Scheme | Purpose |
|--------|---------|
| **ECDSA** | Partnerchain consensus message signing |
| **ed25519** | Finality-related message signing |
| **sr25519** | AURA block authorship signing (Schnorrkel/Ristretto/x25519) |

**See**: Cryptography section for details

---

## Cardano Integration

**As a Partnerchain**:
- Defined connection to Cardano
- Settlement on base layer
- Consensus coordination
- Cross-chain communication

---

## Node Types

### Validator Nodes

**Function**: Block production and consensus

**Requirements**:
- Authorized (permissioned) or registered
- Sufficient stake
- Reliable uptime

---

### Full Nodes

**Function**: Network participation, state synchronization

**Requirements**:
- No stake needed
- Sync with network
- Participate in P2P

---

## Related Documentation

- **[MIDNIGHT_NETWORK_SUPPORT_MATRIX.md](MIDNIGHT_NETWORK_SUPPORT_MATRIX.md)** - Component versions
- **[HOW_MIDNIGHT_WORKS.md](HOW_MIDNIGHT_WORKS.md)** - Architecture
- **[MIDNIGHT_TRANSACTION_STRUCTURE.md](MIDNIGHT_TRANSACTION_STRUCTURE.md)** - Transaction details

---

**Status**: ✅ Midnight Node Overview  
**Version**: Testnet_02  
**Last Updated**: October 28, 2025
