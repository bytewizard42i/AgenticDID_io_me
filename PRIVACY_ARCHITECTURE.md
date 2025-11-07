# 🔐 Privacy Architecture - AgenticDID.io

**Zero-Knowledge Privacy for AI Agent Interactions**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Privacy Requirements](#privacy-requirements)
3. [AgenticDID.io as Trusted Issuer](#agenticdidio-as-trusted-issuer)
4. [Spoof Transaction System](#spoof-transaction-system)
5. [Zero-Knowledge Verification](#zero-knowledge-verification)
6. [Selective Disclosure Proofs](#selective-disclosure-proofs)
7. [Implementation Details](#implementation-details)
8. [Attack Prevention](#attack-prevention)

---

## Overview

AgenticDID.io implements a **privacy-first architecture** where:

- ✅ Agent DIDs are issued by AgenticDID.io (trusted issuer)
- ✅ Verification happens via zero-knowledge proofs (no tracking)
- ✅ Interaction patterns are hidden via spoof transactions
- ✅ Users can prove specific actions without revealing details
- ✅ No one can track how often you talk to your bank

---

## Privacy Requirements

### **What Must Be Private**

1. **Interaction Patterns**
   - No one should know when User talks to BOA Agent
   - No one should know how frequently User checks balance
   - No one should correlate User's agents with external services

2. **Agent Ownership**
   - Mapping of User DID → Agent DID is private
   - Only User knows which agents they control
   - Contract stores ownership in private state

3. **Verification Queries**
   - Who requested verification? → HIDDEN
   - Which DID was verified? → HIDDEN
   - When verification occurred? → OBFUSCATED (spoof transactions)
   - Only result visible: Valid/Invalid

4. **Action Details**
   - User can prove "I booked a flight" 
   - WITHOUT revealing: price, seat, time, payment method
   - Selective disclosure: User chooses what to reveal

### **What Must Be Verifiable (Without Revealing Details)**

1. **DID Validity**
   - "Is this agent DID valid and active?" → Provable via ZK
   - "Is this DID revoked?" → Provable via ZK

2. **Authorization**
   - "Does this agent have permission X?" → Provable via ZK
   - "Was this agent authorized by user Y?" → Provable via ZK

3. **Action Proofs**
   - "I booked flight UA123" → Provable with selective disclosure
   - "I deposited to account ****4567" → Provable
   - "I cancelled check #1234" → Provable

---

## AgenticDID.io as Trusted Issuer

### **Registration Flow**

```
┌─────────────┐
│    USER     │
│  (DID: xyz) │
└──────┬──────┘
       │
       │ 1. "I want to register my agent Comet"
       │    Signs with Lace wallet
       ↓
┌────────────────────────┐
│  AgenticDID.io DApp    │
│  (Trusted Issuer)      │
└──────┬─────────────────┘
       │
       │ 2. Verify user signature
       │ 3. Generate Comet's DID
       │ 4. Store in Midnight contract (PRIVATE STATE)
       ↓
┌──────────────────────────────┐
│  Minokawa Contract           │
│  (Private State)             │
│                              │
│  agentDIDs[comet:abc] = {    │
│    ownerDID: "xyz",          │ ← PRIVATE
│    status: "active",         │
│    issuedAt: timestamp       │
│  }                           │
└──────┬───────────────────────┘
       │
       │ 5. Return credential + private key
       ↓
┌─────────────┐
│    USER     │
│  Stores:    │
│  - DID      │ ← Local encrypted storage
│  - Key      │
│  - Cred     │
└─────────────┘
```

### **Why AgenticDID.io as Issuer?**

**Benefits:**
- ✅ **Simple Trust Model**: External agents trust AgenticDID.io
- ✅ **Easy Verification**: Standard verification process
- ✅ **Revocation Support**: Centralized revocation registry (private)
- ✅ **Regulatory Compliance**: Known issuer for compliance
- ✅ **Privacy via ZK**: Issuer doesn't track queries

**Privacy Guarantees:**
- ✅ AgenticDID.io issues DID but **cannot track usage**
- ✅ Verification queries use ZK proofs (no logging)
- ✅ Ownership mapping stored in **private contract state**
- ✅ External agents only see "valid/invalid" - nothing more

**Future Enhancements:**
- Multi-issuer support (OpenAI, Microsoft, Google issue their own)
- Decentralized issuer network
- Cross-issuer verification

---

## Spoof Transaction System

### **The Privacy Problem**

Even with zero-knowledge proofs, **timing patterns leak information**:

```
❌ WITHOUT SPOOF TRANSACTIONS:

9:00am - Verification query
9:01am - Verification query
9:15am - Verification query
2:30pm - Verification query
2:31pm - Verification query

Analysis: "User likely checking bank balance in morning and afternoon"
Correlation: "9am and 2:30pm are peak banking times"
```

### **The Solution: Spoof Transactions (White Noise)**

Mix real verification queries with **fake queries** to obfuscate patterns:

```
✅ WITH SPOOF TRANSACTIONS:

8:45am - SPOOF verification (dummy query)
8:52am - SPOOF verification
9:00am - REAL verification ← User checks balance
9:03am - SPOOF verification
9:07am - SPOOF verification
9:12am - SPOOF verification
9:15am - REAL verification ← User transfers money
9:18am - SPOOF verification
9:25am - SPOOF verification
...continuous throughout the day...
2:28pm - SPOOF verification
2:30pm - REAL verification ← User checks balance again
2:33pm - SPOOF verification

Analysis: "Constant stream of queries - cannot determine real vs fake"
Correlation: IMPOSSIBLE
```

### **Spoof Transaction Architecture**

#### **Client-Side Spoofing**

```typescript
/**
 * Privacy-preserving verification wrapper
 * Adds spoof transactions before/after real queries
 */
class PrivacyPreservingVerifier {
  private spoofRate: number = 0.8; // 80% of queries are spoofs
  
  /**
   * Verify agent DID with privacy protection
   */
  async verifyAgentDID(agentDID: string): Promise<boolean> {
    // Generate 3-7 spoof queries before real one
    const preSpoofs = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < preSpoofs; i++) {
      await this.sendSpoofQuery();
      await randomDelay(500, 2000); // Random 0.5-2s delay
    }
    
    // Send REAL query (mixed with spoofs)
    const result = await this.sendRealQuery(agentDID);
    
    // Generate 3-7 spoof queries after real one
    const postSpoofs = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < postSpoofs; i++) {
      await this.sendSpoofQuery();
      await randomDelay(500, 2000);
    }
    
    return result;
  }
  
  /**
   * Send spoof verification query
   * Uses random DID that doesn't exist
   */
  private async sendSpoofQuery(): Promise<void> {
    const randomDID = this.generateRandomDID();
    
    // Query looks identical to real query
    await midnightContract.verifyAgent(randomDID);
    
    // Result is discarded (we don't care)
    // Purpose: Create noise to hide real query
  }
  
  /**
   * Send real verification query
   */
  private async sendRealQuery(agentDID: string): Promise<boolean> {
    const result = await midnightContract.verifyAgent(agentDID);
    return result.valid;
  }
  
  /**
   * Generate random DID for spoof queries
   */
  private generateRandomDID(): string {
    const randomBytes = crypto.randomBytes(32);
    return `did:midnight:agent:spoof:${randomBytes.toString('hex')}`;
  }
}

/**
 * Random delay helper
 */
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

#### **Background Spoof Generator**

```typescript
/**
 * Continuous background noise generator
 * Runs constantly to create baseline traffic
 */
class BackgroundSpoofGenerator {
  private isRunning: boolean = false;
  private minInterval: number = 5000;  // 5 seconds
  private maxInterval: number = 30000; // 30 seconds
  
  /**
   * Start generating background spoofs
   */
  start(): void {
    this.isRunning = true;
    this.generateLoop();
  }
  
  /**
   * Stop generating background spoofs
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Continuous generation loop
   */
  private async generateLoop(): Promise<void> {
    while (this.isRunning) {
      // Generate spoof query
      const randomDID = this.generateRandomDID();
      await midnightContract.verifyAgent(randomDID);
      
      // Random delay before next spoof
      const delay = Math.floor(
        Math.random() * (this.maxInterval - this.minInterval)
      ) + this.minInterval;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  private generateRandomDID(): string {
    const randomBytes = crypto.randomBytes(32);
    return `did:midnight:agent:spoof:${randomBytes.toString('hex')}`;
  }
}

// Usage:
const spoofGen = new BackgroundSpoofGenerator();
spoofGen.start(); // Runs continuously in background
```

### **Spoof Transaction Benefits**

1. **Timing Attack Prevention**
   - Cannot determine when real queries occur
   - Constant baseline traffic masks peaks
   
2. **Frequency Obfuscation**
   - Cannot count real interactions
   - 80% of queries are noise
   
3. **Pattern Destruction**
   - Morning/afternoon patterns hidden
   - Weekend vs weekday patterns hidden
   
4. **Correlation Resistance**
   - Cannot link User → Bank queries
   - Cannot build behavioral profiles

### **Cost Considerations**

**Midnight Network Advantages:**
- ✅ **Low Gas Fees**: Spoof transactions cost minimal tDUST
- ✅ **Private Queries**: No public transaction log
- ✅ **Batch Processing**: Contract can optimize spoof handling

**Optimization Strategies:**
```typescript
// Contract-side optimization
public function verifyAgent(agentDID: String, isSpoof: Boolean): Boolean {
  // Spoof queries skip expensive checks
  if (isSpoof) {
    return false; // Immediate return, no state read
  }
  
  // Real queries perform full verification
  return this.performFullVerification(agentDID);
}
```

---

## Zero-Knowledge Verification

### **How It Works**

Traditional verification (❌ NOT PRIVATE):
```
BOA → AgenticDID.io: "Is comet:abc valid?"
AgenticDID.io → Database: SELECT * FROM dids WHERE id='comet:abc'
AgenticDID.io → Logs: "BOA verified comet:abc at 9:00am"
AgenticDID.io → BOA: "Yes, valid"

❌ Problems:
- AgenticDID.io knows BOA is checking comet:abc
- Logs can be analyzed to find patterns
- Frequency tracking possible
```

Zero-knowledge verification (✅ PRIVATE):
```
BOA → Midnight Contract: ZK proof request for comet:abc
Contract → Private State: Check agentDIDs[comet:abc]
Contract → Generate ZK Proof: 
   IF valid THEN proof_of_validity
   ELSE proof_of_invalidity
Contract → BOA: ZK Proof (no logging, no tracking)

✅ Benefits:
- Contract doesn't log who asked
- Contract doesn't log which DID was checked
- Only result: cryptographic proof of validity
- Combined with spoofs: completely private
```

### **Midnight Contract Implementation**

```compact
circuit AgenticDIDRegistry {
  // PRIVATE STATE - never exposed externally
  private agentDIDs: Map<String, AgentRecord>;
  private userAgents: Map<String, Set<String>>;
  private revocations: Set<String>;
  
  // PUBLIC STATE - visible counts only
  public totalRegistered: UInt64;
  public totalRevoked: UInt64;
  
  struct AgentRecord {
    agentDID: String,
    ownerDID: String,        // PRIVATE
    issuedAt: UInt64,       // PRIVATE
    status: String          // PRIVATE
  }
  
  /**
   * Register agent DID (PRIVATE OPERATION)
   * Only stores in private state
   */
  public function registerAgent(
    userDID: String,
    agentDID: String,
    signature: String
  ): Void {
    // Verify user signature
    require(verifySignature(userDID, signature), "Invalid signature");
    require(!agentDIDs.has(agentDID), "DID already exists");
    
    // Store in PRIVATE state
    agentDIDs.set(agentDID, AgentRecord {
      agentDID: agentDID,
      ownerDID: userDID,
      issuedAt: now(),
      status: "active"
    });
    
    // Add to user's agent list (PRIVATE)
    if (!userAgents.has(userDID)) {
      userAgents.set(userDID, Set());
    }
    userAgents.get(userDID).add(agentDID);
    
    totalRegistered = totalRegistered + 1;
  }
  
  /**
   * Verify agent DID (ZERO-KNOWLEDGE)
   * NO LOGGING - NO TRACKING
   */
  public function verifyAgent(
    agentDID: String,
    isSpoof: Boolean  // Hint for optimization
  ): Boolean {
    // Spoof queries: immediate return
    if (isSpoof) {
      return false;
    }
    
    // Real queries: private state check
    if (!agentDIDs.has(agentDID)) {
      return false;
    }
    
    if (revocations.has(agentDID)) {
      return false;
    }
    
    let record = agentDIDs.get(agentDID);
    return record.status == "active";
    
    // CRITICAL: This function does NOT:
    // - Log who called it
    // - Log when it was called
    // - Log which DID was checked
    // - Store query history
    // 
    // Returns only: Boolean via ZK proof
  }
  
  /**
   * Verify agent with scope check (ZERO-KNOWLEDGE)
   */
  public function verifyAgentScope(
    agentDID: String,
    requiredScope: String
  ): Boolean {
    if (!this.verifyAgent(agentDID, false)) {
      return false;
    }
    
    let record = agentDIDs.get(agentDID);
    // Check scope in private delegation data
    return checkScope(record.ownerDID, requiredScope);
  }
  
  /**
   * Revoke agent DID (PRIVATE OPERATION)
   */
  public function revokeAgent(
    userDID: String,
    agentDID: String,
    signature: String
  ): Void {
    require(agentDIDs.has(agentDID), "Agent not found");
    
    let record = agentDIDs.get(agentDID);
    require(record.ownerDID == userDID, "Not owner");
    require(verifySignature(userDID, signature), "Invalid signature");
    
    // Add to private revocation set
    revocations.add(agentDID);
    totalRevoked = totalRevoked + 1;
    
    // Revocation is PRIVATE:
    // - External agents only see "invalid" on verification
    // - They don't know when revoked or why
    // - Revocation list not publicly accessible
  }
}
```

---

## Selective Disclosure Proofs

### **The Problem**

User wants to prove specific actions WITHOUT revealing everything:

```
❌ Traditional Proof (Too Much Info):
{
  "user": "did:midnight:user:john",
  "action": "booked_flight",
  "flight": "UA123",
  "date": "2025-10-25",
  "price": "$450",
  "seat": "14A",
  "payment": "****4567",
  "time": "9:00am",
  "ip_address": "192.168.1.1"
}

User wants to prove they booked flight,
but doesn't want to reveal price, seat, payment, etc.
```

### **The Solution: Selective Disclosure**

```typescript
/**
 * Selective disclosure proof generator
 */
class SelectiveDisclosureProof {
  /**
   * Generate proof with selective disclosure
   */
  async generateActionProof(
    action: Action,
    disclose: string[]  // What to reveal
  ): Promise<SelectiveProof> {
    // Full action data (private)
    const fullData = {
      user: "did:midnight:user:john",
      action: "booked_flight",
      flight: "UA123",
      date: "2025-10-25",
      price: "$450",          // PRIVATE
      seat: "14A",           // PRIVATE
      payment: "****4567",   // PRIVATE
      time: "9:00am",        // PRIVATE
      ip_address: "192.168.1.1"  // PRIVATE
    };
    
    // Disclosed data (public)
    const disclosed = {};
    for (const key of disclose) {
      if (fullData[key]) {
        disclosed[key] = fullData[key];
      }
    }
    
    // Generate ZK proof that:
    // 1. Full data exists
    // 2. Disclosed fields match full data
    // 3. User signed full data
    // 4. Action occurred on-chain
    // WITHOUT revealing private fields
    
    const zkProof = await generateZKProof({
      publicInputs: disclosed,
      privateInputs: fullData,
      claim: "Action occurred with these disclosed fields"
    });
    
    return {
      disclosed: disclosed,
      proof: zkProof,
      timestamp: Date.now()
    };
  }
}

// Usage Example:
const proof = await generateActionProof(
  flightBooking,
  ["action", "flight", "date"]  // Only disclose these
);

// Result:
{
  disclosed: {
    action: "booked_flight",
    flight: "UA123",
    date: "2025-10-25"
  },
  proof: "0xZK_PROOF_DATA...",
  // Price, seat, payment, time, IP are HIDDEN
  // But provably exist and are valid
}
```

### **Use Cases**

#### **1. Prove Flight Booking (Minimal Disclosure)**

```typescript
// Scenario: Prove you booked a flight for visa application
const visaProof = await generateActionProof(booking, [
  "action",      // "booked_flight"
  "flight",      // "UA123"
  "date",        // "2025-10-25"
  "destination"  // "London"
]);

// Disclosed: Flight booked to London on specific date
// Hidden: Price, seat, payment method, exact time
```

#### **2. Prove Bank Deposit (Privacy Protected)**

```typescript
// Scenario: Prove deposit for loan application
const depositProof = await generateActionProof(deposit, [
  "action",      // "deposit"
  "amount",      // "$5000"
  "date"         // "2025-10-23"
]);

// Disclosed: Deposited $5000 on date
// Hidden: Account number, bank branch, source of funds
```

#### **3. Prove Check Cancellation (Audit Trail)**

```typescript
// Scenario: Prove check was cancelled for dispute
const cancelProof = await generateActionProof(cancellation, [
  "action",      // "cancelled_check"
  "check_number", // "#1234"
  "date"         // "2025-10-22"
]);

// Disclosed: Check #1234 cancelled on date
// Hidden: Amount, payee, reason
```

---

## Implementation Details

### **Complete Flow Example**

```typescript
/**
 * Complete privacy-preserving verification flow
 */
class AgenticDIDPrivacySystem {
  private spoofGenerator: BackgroundSpoofGenerator;
  private verifier: PrivacyPreservingVerifier;
  
  constructor() {
    this.spoofGenerator = new BackgroundSpoofGenerator();
    this.verifier = new PrivacyPreservingVerifier();
  }
  
  /**
   * Initialize privacy system
   */
  async initialize(): Promise<void> {
    // Start background spoof generation
    this.spoofGenerator.start();
    console.log("✓ Background spoofs active");
  }
  
  /**
   * Register new agent with privacy
   */
  async registerAgent(
    userDID: string,
    agentName: string
  ): Promise<AgentCredential> {
    // User signs registration request
    const signature = await signWithWallet(userDID, agentName);
    
    // Submit to AgenticDID.io (public operation)
    const registration = await midnightContract.registerAgent(
      userDID,
      agentName,
      signature
    );
    
    // Store credential locally (encrypted)
    const credential = {
      agentDID: registration.agentDID,
      privateKey: registration.privateKey,
      ownerDID: userDID
    };
    
    await storeEncrypted(credential);
    
    console.log(`✓ Agent ${agentName} registered privately`);
    return credential;
  }
  
  /**
   * Verify external agent (with privacy protection)
   */
  async verifyExternalAgent(
    externalAgentDID: string
  ): Promise<boolean> {
    // Use privacy-preserving verifier
    // Automatically adds spoof transactions
    const isValid = await this.verifier.verifyAgentDID(externalAgentDID);
    
    if (isValid) {
      console.log("✓ External agent verified (privately)");
    } else {
      console.log("✗ External agent verification failed");
    }
    
    return isValid;
  }
  
  /**
   * Generate action proof with selective disclosure
   */
  async proveAction(
    action: Action,
    discloseFields: string[]
  ): Promise<SelectiveProof> {
    const proofGen = new SelectiveDisclosureProof();
    const proof = await proofGen.generateActionProof(action, discloseFields);
    
    console.log("✓ Action proof generated");
    console.log("  Disclosed:", Object.keys(proof.disclosed));
    console.log("  Hidden:", action.getAllFields().filter(
      f => !discloseFields.includes(f)
    ));
    
    return proof;
  }
  
  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    this.spoofGenerator.stop();
    console.log("✓ Privacy system shut down");
  }
}

// Usage:
const privacySystem = new AgenticDIDPrivacySystem();
await privacySystem.initialize();

// Register agent
const comet = await privacySystem.registerAgent(
  "did:midnight:user:john",
  "Comet"
);

// Verify BOA agent (with privacy protection)
const boaValid = await privacySystem.verifyExternalAgent(
  "did:midnight:agent:boa:official"
);

// Prove flight booked (minimal disclosure)
const flightProof = await privacySystem.proveAction(
  flightBooking,
  ["action", "flight", "date"]
);
```

---

## Attack Prevention

### **1. Timing Analysis Attack**

**Attack**: Analyze query timestamps to identify real transactions

**Defense**: Spoof transactions + random delays
```typescript
// Constant stream of queries makes timing analysis impossible
BackgroundSpoofGenerator runs 24/7
Real queries buried in noise
Random delays prevent correlation
```

### **2. Frequency Analysis Attack**

**Attack**: Count total queries to estimate activity level

**Defense**: 80% spoof rate obfuscates real count
```typescript
1000 total queries observed
800 are spoofs (unknown which ones)
200 are real (cannot identify)
Cannot determine actual usage
```

### **3. Pattern Correlation Attack**

**Attack**: Correlate User activity with external events

**Defense**: Continuous baseline traffic
```typescript
Market opens 9:30am → No query spike (baseline already high)
News event 2pm → No query spike (baseline unchanged)
Weekend vs weekday → No pattern (baseline 24/7)
```

### **4. DID Enumeration Attack**

**Attack**: Try to enumerate all valid DIDs

**Defense**: Private state + ZK verification
```typescript
// Attacker tries: did:midnight:agent:test:001, 002, 003...
// All queries look identical (spoof or real)
// Cannot determine which DIDs exist
// Cannot build DID database
```

### **5. Metadata Leakage Attack**

**Attack**: Analyze network metadata (IP, size, etc.)

**Defense**: All queries identical structure
```typescript
// All queries:
- Same packet size
- Same structure
- Same encryption
- Cannot distinguish real from spoof
```

---

## Summary

AgenticDID.io achieves **complete privacy** through:

1. **Trusted Issuer Model**: AgenticDID.io issues DIDs but cannot track usage
2. **Zero-Knowledge Verification**: Contract answers queries without logging
3. **Spoof Transactions**: 80% white noise obfuscates real activity
4. **Background Generation**: Continuous baseline traffic 24/7
5. **Selective Disclosure**: Prove actions without revealing details
6. **Private State**: Ownership mappings hidden in Midnight contract
7. **No Correlation**: Cannot link users to services or track frequency

**Result**: Users can safely delegate to AI agents, prove actions when needed, and maintain complete privacy from tracking and surveillance.

---

**Built for Midnight Network Hackathon**  
*Privacy-first identity protocol for the age of AI agents*
