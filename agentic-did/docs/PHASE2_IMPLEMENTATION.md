# 🚀 AgenticDID.io - Phase 2 Implementation Guide

**Real Midnight Network Integration**  
**Updated**: October 17, 2025 - Based on comprehensive research

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Contract Development](#contract-development)
5. [SDK Integration](#sdk-integration)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Guide](#deployment-guide)

---

## Overview

### Current State (Phase 1 - MVP)
```
Frontend → Mock Adapter → Verifier API
           (Hardcoded responses)
```

### Target State (Phase 2)
```
Frontend → Midnight Adapter → AgenticDIDRegistry Contract → Midnight Devnet
           (Real ZK proofs)     (Compact language)            (tDUST tokens)
```

### Success Criteria

- ✅ Real ZK proofs generated for credential verification
- ✅ On-chain credential registry deployed to devnet
- ✅ Lace wallet integration working in frontend
- ✅ End-to-end demo functional with real blockchain
- ✅ Documentation complete for devnet deployment

---

## Prerequisites

### Tools & Accounts

```bash
# 1. Node.js & Package Manager
node --version  # >=18.0.0
npm --version   # >=9.0.0

# 2. Install Lace Beta Wallet
# Visit: https://www.lace.io/
# Install browser extension
# Create Midnight devnet account

# 3. Get tDUST tokens
# Use devnet faucet (link in Lace wallet)
# Confirm tokens received

# 4. Docker (for Compact compiler)
docker --version  # >=20.0.0
```

### Knowledge Requirements

- ✅ TypeScript proficiency
- ✅ React familiarity
- ✅ Basic blockchain concepts
- ⚠️ Compact language (learn from MIDNIGHT_FOUNDATIONS.md)
- ⚠️ ZK proofs basics (covered in docs)

---

## Step-by-Step Implementation

### Phase 2.1: Setup & Dependencies (Week 1)

#### 1.1 Install Midnight SDK

```bash
# Navigate to AgenticDID root
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me

# Install Midnight setup package
npm install @meshsdk/midnight-setup

# Install type definitions
npm install --save-dev @types/node

# Verify installation
npm list @meshsdk/midnight-setup
```

#### 1.2 Setup Docker for Compact Compiler

```bash
# Pull Midnight development image
docker pull ghcr.io/midnightntwrk/compact:latest

# Verify image
docker images | grep compact

# Create alias for convenience
echo 'alias compact="docker run --rm -v \$(pwd):/workspace ghcr.io/midnightntwrk/compact:latest"' >> ~/.bashrc
source ~/.bashrc
```

#### 1.3 Project Structure Updates

```bash
# Create new directories
mkdir -p contracts/compiled
mkdir -p src/midnight
mkdir -p scripts/midnight

# Update .gitignore
cat >> .gitignore << EOF

# Midnight
contracts/compiled/
.env.midnight
tDUST-wallet.json
EOF
```

### Phase 2.2: Contract Development (Week 1-2)

#### 2.1 Write Compact Contract

Create `contracts/AgenticDIDRegistry.compact`:

```compact
/**
 * AgenticDIDRegistry - Privacy-Preserving Credential Registry
 * 
 * Manages verifiable credentials for AI agents with:
 * - Private credential storage
 * - Zero-knowledge verification
 * - Revocation support
 * - Role-based access
 */

circuit AgenticDIDRegistry {
  // ========== STATE ==========
  
  // Private state (hidden from public queries)
  private credentials: Map<Bytes32, Credential>;
  private revocations: Set<Bytes32>;
  private issuers: Set<Address>;
  
  // Public state (visible on-chain)
  public owner: Address;
  public totalIssued: UInt64;
  public totalRevoked: UInt64;
  public contractVersion: String;
  
  // ========== DATA STRUCTURES ==========
  
  struct Credential {
    credHash: Bytes32,
    issuer: Address,
    subject: Bytes32,          // Agent DID
    role: String,              // "Banker", "Traveler", etc.
    scopes: Array<String>,     // ["bank:transfer", "bank:view"]
    issuedAt: UInt64,
    expiresAt: UInt64,
    metadata: String           // JSON-encoded additional data
  }
  
  // ========== INITIALIZATION ==========
  
  /**
   * Initialize contract with owner
   * Called once during deployment
   */
  public function initialize(ownerAddress: Address): Void {
    require(owner == Address(0), "Already initialized");
    
    owner = ownerAddress;
    totalIssued = 0;
    totalRevoked = 0;
    contractVersion = "1.0.0";
    
    // Owner is automatically an issuer
    issuers.add(ownerAddress);
  }
  
  // ========== ISSUER MANAGEMENT ==========
  
  /**
   * Add authorized credential issuer
   * Only owner can add issuers
   */
  public function addIssuer(
    caller: Address,
    newIssuer: Address
  ): Void {
    require(caller == owner, "Only owner can add issuers");
    require(!issuers.has(newIssuer), "Already an issuer");
    
    issuers.add(newIssuer);
  }
  
  /**
   * Remove issuer
   * Only owner can remove issuers
   */
  public function removeIssuer(
    caller: Address,
    issuer: Address
  ): Void {
    require(caller == owner, "Only owner can remove issuers");
    require(issuer != owner, "Cannot remove owner");
    require(issuers.has(issuer), "Not an issuer");
    
    issuers.remove(issuer);
  }
  
  /**
   * Check if address is authorized issuer
   * ZK proof - doesn't reveal issuer list
   */
  public function isIssuer(address: Address): Boolean {
    return issuers.has(address);
  }
  
  // ========== CREDENTIAL ISSUANCE ==========
  
  /**
   * Issue new credential
   * Only authorized issuers can call
   */
  public function issueCredential(
    caller: Address,
    credHash: Bytes32,
    subject: Bytes32,
    role: String,
    scopes: Array<String>,
    expiresAt: UInt64,
    metadata: String
  ): Void {
    // Validation
    require(issuers.has(caller), "Not authorized issuer");
    require(!credentials.has(credHash), "Credential already exists");
    require(expiresAt > now(), "Expiration must be in future");
    require(scopes.length() > 0, "Must have at least one scope");
    
    // Store credential
    credentials.set(credHash, Credential {
      credHash: credHash,
      issuer: caller,
      subject: subject,
      role: role,
      scopes: scopes,
      issuedAt: now(),
      expiresAt: expiresAt,
      metadata: metadata
    });
    
    totalIssued = totalIssued + 1;
  }
  
  // ========== VERIFICATION ==========
  
  /**
   * Verify credential is valid
   * ZK proof - reveals only validity status
   */
  public function verifyCredential(credHash: Bytes32): Boolean {
    // Check existence
    if (!credentials.has(credHash)) {
      return false;
    }
    
    // Check revocation
    if (revocations.has(credHash)) {
      return false;
    }
    
    // Check expiration
    let cred = credentials.get(credHash);
    if (now() >= cred.expiresAt) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Verify credential with role check
   * ZK proof - reveals only match status
   */
  public function verifyCredentialRole(
    credHash: Bytes32,
    expectedRole: String
  ): Boolean {
    if (!verifyCredential(credHash)) {
      return false;
    }
    
    let cred = credentials.get(credHash);
    return cred.role == expectedRole;
  }
  
  /**
   * Verify credential has scope
   * ZK proof - reveals only if scope exists
   */
  public function verifyCredentialScope(
    credHash: Bytes32,
    requiredScope: String
  ): Boolean {
    if (!verifyCredential(credHash)) {
      return false;
    }
    
    let cred = credentials.get(credHash);
    
    // Check if scope exists in array
    for (let i = 0; i < cred.scopes.length(); i = i + 1) {
      if (cred.scopes[i] == requiredScope) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Verify subject owns credential
   * ZK proof - proves ownership without revealing subject
   */
  public function verifyCredentialOwnership(
    credHash: Bytes32,
    claimedSubject: Bytes32
  ): Boolean {
    if (!verifyCredential(credHash)) {
      return false;
    }
    
    let cred = credentials.get(credHash);
    return cred.subject == claimedSubject;
  }
  
  // ========== REVOCATION ==========
  
  /**
   * Revoke credential
   * Only issuer can revoke
   */
  public function revokeCredential(
    caller: Address,
    credHash: Bytes32
  ): Void {
    require(credentials.has(credHash), "Credential does not exist");
    
    let cred = credentials.get(credHash);
    require(
      cred.issuer == caller || caller == owner,
      "Only issuer or owner can revoke"
    );
    require(!revocations.has(credHash), "Already revoked");
    
    revocations.add(credHash);
    totalRevoked = totalRevoked + 1;
  }
  
  /**
   * Check if credential is revoked
   * ZK proof - reveals only revocation status
   */
  public function isRevoked(credHash: Bytes32): Boolean {
    return revocations.has(credHash);
  }
  
  // ========== QUERIES ==========
  
  /**
   * Get credential info
   * Only issuer, subject, or owner can view
   */
  public function getCredentialInfo(
    caller: Address,
    credHash: Bytes32
  ): Credential {
    require(credentials.has(credHash), "Credential not found");
    
    let cred = credentials.get(credHash);
    
    // Access control
    require(
      caller == cred.issuer || caller == owner,
      "Not authorized to view credential"
    );
    
    return cred;
  }
  
  /**
   * Get contract statistics
   * Public information
   */
  public function getStats(): (UInt64, UInt64, UInt64) {
    let activeCount = totalIssued - totalRevoked;
    return (totalIssued, totalRevoked, activeCount);
  }
}
```

#### 2.2 Compile Contract

```bash
# Compile Compact to TypeScript
cd contracts
compact compile AgenticDIDRegistry.compact --out compiled/

# Verify output
ls -la compiled/
# Should see:
# - contract-api.ts    (TypeScript API)
# - contract.json      (Contract metadata)
```

### Phase 2.3: Provider Setup (Week 2)

Create `src/midnight/providers.ts`:

```typescript
/**
 * Midnight Network Provider Setup
 * Configures wallet, fetcher, and submitter
 */

import { MidnightSetupContractProviders } from '@meshsdk/midnight-setup';

export interface MidnightConfig {
  network: 'devnet' | 'testnet' | 'mainnet';
  indexerUrl?: string;
  nodeUrl?: string;
}

/**
 * Setup providers using Lace Wallet
 */
export async function setupMidnightProviders(
  config: MidnightConfig = { network: 'devnet' }
): Promise<MidnightSetupContractProviders> {
  // Check for Lace Wallet
  const wallet = window.midnight?.mnLace;
  
  if (!wallet) {
    throw new Error(
      'Lace Wallet for Midnight is required. Please install from https://www.lace.io'
    );
  }

  try {
    console.log('[Midnight] Connecting to Lace Wallet...');
    
    // Enable wallet (user approves connection)
    const walletAPI = await wallet.enable();
    
    // Get wallet state
    const walletState = await walletAPI.state();
    console.log('[Midnight] Connected:', walletState.address);
    
    // Get service URIs
    const uris = await wallet.serviceUriConfig();
    console.log('[Midnight] Service URIs:', uris);

    // Return provider configuration
    return {
      wallet: walletAPI,
      fetcher: config.indexerUrl || uris.indexer,
      submitter: config.nodeUrl || uris.node,
    };
  } catch (error) {
    console.error('[Midnight] Failed to setup providers:', error);
    throw new Error(`Provider setup failed: ${error.message}`);
  }
}

/**
 * Check if Lace Wallet is installed
 */
export function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.midnight?.mnLace;
}

/**
 * Get wallet address without connecting
 */
export async function getWalletAddress(): Promise<string | null> {
  if (!isWalletInstalled()) {
    return null;
  }
  
  try {
    const wallet = window.midnight!.mnLace!;
    const api = await wallet.enable();
    const state = await api.state();
    return state.address || null;
  } catch {
    return null;
  }
}
```

Continue with complete implementation? I can create deployment scripts, testing framework, and frontend integration next.
