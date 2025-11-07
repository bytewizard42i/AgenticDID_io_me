# 🤝 Agent Delegation Workflow - Real-World Use Case

**AgenticDID.io Multi-Party Authentication & Delegation**

---

## 📋 Overview

This document describes the complete workflow for **mutual authentication** and **delegation chains** in AgenticDID.io, using a real-world scenario: a user's personal AI agent checking their bank account balance.

---

## 🎭 The Actors

### 1. **User (John)**
- Human user who owns accounts and data
- Has a verified digital identity (DID)
- Delegates authority to their personal AI agent

### 2. **Comet (Personal AI Agent)**
- Lives in local state on user's device
- Powered by LLM (can be local or cloud)
- Remembers user settings, desires, conversations
- Acts on behalf of the user for authorized tasks
- Must prove its DID to interact with external services

### 3. **BOA Agent (Bank of America AI Agent)**
- Represents Bank of America's services
- Trusted issuer and verifier of DIDs
- Verifies both agent authenticity AND user authorization
- Provides account information only to authorized parties

---

## 🔐 The Trust Model

### **Three-Layer Verification**

```
┌─────────────────────────────────────────────────────────────┐
│                    TRUST ESTABLISHMENT                       │
└─────────────────────────────────────────────────────────────┘

1. USER ↔ COMET (Mutual DID Verification)
   ├─ User proves DID to Comet
   ├─ Comet proves DID to User
   └─ ✓ Bidirectional trust established

2. USER → COMET (Delegation)
   ├─ User signs delegation proof (Merkle proof)
   ├─ Grants specific scopes: [bank:read, bank:transfer]
   ├─ Sets expiration time
   └─ ✓ Comet authorized to act on behalf of User

3. COMET ↔ BOA AGENT (Mutual DID + Delegation Verification)
   ├─ BOA Agent proves DID via ZKP
   ├─ Comet verifies with BOA (trusted issuer)
   ├─ BOA Agent verifies Comet's DID
   ├─ BOA Agent verifies User's delegation to Comet
   └─ ✓ Secure channel for banking operations
```

---

## 📖 Complete Workflow: "Check My Account Balance"

### **Phase 1: Initial Setup (One-Time)**

#### Step 1.1: User Proves Identity to Comet (Initial Session)
```
User opens AgenticDID app
→ Signs challenge with User's DID wallet (Lace)
→ Comet verifies signature
→ ✓ User authenticated for basic session
```

**What happens:**
- User's DID wallet (e.g., Lace) signs a challenge
- Comet verifies the signature matches User's public key
- Session established: "This is the real John"
- **Scope**: Read-only operations, browsing, queries

**Note**: This initial authentication is sufficient for non-sensitive operations like:
- Browsing information
- Reading public data
- Querying balances (display only)
- General conversation with Comet

#### Step 1.2: Comet Proves Identity to User
```
Comet generates its DID proof
→ Signs challenge with Comet's private key
→ User's app verifies Comet's DID signature
→ Checks Comet's DID against known/trusted list
→ ✓ Comet authenticated
```

**What happens:**
- Comet's DID is verified against a registry or user's trusted list
- Ensures no malware is impersonating Comet
- Trust established: "This is my real Comet agent"

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:34:00Z",
  "event": "mutual_authentication",
  "parties": ["user:john", "agent:comet"],
  "status": "success",
  "proof_hashes": ["0x4a3b...", "0x8f2c..."]
}
```

---

### **Phase 1.3: Continuous Authentication & Agent Integrity**

#### Security Monitoring (Ongoing)
```
Comet continuously monitors:
→ Session validity (not expired)
→ No unauthorized process modifications
→ DID credential status (not revoked)
→ Network connection integrity
→ ✓ Agent integrity maintained
```

**What happens:**
- Comet performs self-checks to ensure it hasn't been compromised
- Monitors for tampering, injection attacks, or process hijacking
- If anomaly detected → requires fresh user authentication
- Provides assurance to external agents that Comet is trustworthy

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:34:30Z",
  "event": "integrity_check",
  "agent": "agent:comet",
  "status": "verified",
  "checks": [
    "process_integrity",
    "credential_validity",
    "session_active",
    "no_tampering_detected"
  ]
}
```

---

### **Phase 2: Delegation Setup**

#### Step 2.1: User Delegates Authority to Comet
```
User grants Comet permissions
→ Creates delegation credential:
   - Delegator: User's DID
   - Delegate: Comet's DID
   - Scopes: [bank:read, bank:transfer, travel:book]
   - Expiration: 30 days
   - Revocable: Yes
→ User signs with private key
→ Merkle proof generated (delegation chain)
→ ✓ Comet now authorized to act for User
```

**Delegation Credential Structure:**
```typescript
{
  type: "DelegationCredential",
  issuer: "did:midnight:user:john:0x4a3b...",
  subject: "did:midnight:agent:comet:0x8f2c...",
  claims: {
    delegatedScopes: [
      "bank:read",
      "bank:transfer:max_1000_usd",
      "travel:book"
    ],
    restrictions: {
      maxTransactionAmount: "1000.00 USD",
      requireConfirmation: ["bank:transfer"]
    }
  },
  issuedAt: 1729654440000,
  expiresAt: 1732246440000,
  revocable: true,
  proof: {
    type: "MerkleProof",
    root: "0xabcd1234...",
    path: [...],
    signature: "user-signature"
  }
}
```

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:35:00Z",
  "event": "delegation_granted",
  "delegator": "user:john",
  "delegate": "agent:comet",
  "scopes": ["bank:read", "bank:transfer", "travel:book"],
  "expiration": "2025-11-22T06:35:00Z",
  "merkle_root": "0xabcd1234..."
}
```

---

### **Phase 3: Task Execution - "Check My Balance"**

#### Step 3.1: User Issues Command
```
User: "Comet, check my BOA account balance"
→ Comet receives task
→ Classifies operation: SENSITIVE (requires external agent interaction)
→ Identifies required scope: bank:read
→ Checks delegation: ✓ User granted bank:read
→ Triggers step-up authentication
```

**Operation Classification:**
- **Non-Sensitive (Standard Auth)**: Local queries, browsing, information lookup
- **Sensitive (Step-Up Required)**: External agent interactions, transactions, data sharing

#### Step 3.2: Step-Up Authentication (Biometric/2FA)
```
Comet: "To access your BOA account, please verify your identity"
→ User receives biometric prompt OR 2FA challenge
→ User provides:
   Option A: Fingerprint/FaceID scan
   Option B: Hardware token (YubiKey)
   Option C: TOTP code (Authenticator app)
→ Comet verifies step-up credential
→ ✓ Advanced authorization confirmed
→ Fresh proof generated (includes timestamp)
```

**Why This Matters:**
1. **User Presence Verification**: Proves user is actively authorizing this specific action
2. **Session Hijacking Prevention**: Even if session was compromised, attacker can't complete sensitive operations
3. **Merchant Protection**: External agents (BOA) can trust the authorization is legitimate
4. **Fraud Reduction**: Multi-factor verification reduces chargebacks and disputes
5. **Regulatory Compliance**: Meets strong customer authentication (SCA) requirements

**Step-Up Proof Structure:**
```typescript
type StepUpProof = {
  userDID: string;
  sessionID: string;
  operation: string;        // "bank:read", "bank:transfer", etc.
  biometricHash?: string;   // Hash of biometric data (if used)
  totpVerified?: boolean;   // If TOTP was used
  hardwareToken?: string;   // If hardware key was used
  timestamp: number;        // When verification occurred
  expiresIn: number;        // Short TTL (60-300 seconds)
  signature: string;        // User's signature over all fields
};
```

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:36:10Z",
  "event": "step_up_authentication",
  "user": "user:john",
  "agent": "agent:comet",
  "operation": "bank:read",
  "method": "biometric_fingerprint",
  "status": "success",
  "proof_ttl": 120,
  "proof_hash": "0x9a4f..."
}
```

#### Step 3.3: Comet Contacts BOA Agent
```
Comet → Requests connection to BOA Agent
BOA Agent → Returns challenge
Comet → Verifies BOA Agent's DID FIRST (see Step 3.4)
Comet → Presents credentials to verified BOA Agent:
   1. Comet's DID proof
   2. User's delegation credential (Merkle proof)
   3. User's step-up authentication proof (biometric/2FA)
   4. Comet's integrity attestation
   5. Proof of task authorization
```

**Critical Security Order:**
1. ✅ Comet verifies BOA Agent is legitimate (prevents phishing)
2. ✅ Only then does Comet share user's sensitive proofs
3. ✅ This protects user data from being sent to fake agents

#### Step 3.4: BOA Agent Proves Its Identity (BEFORE Receiving User Data)
```
BOA Agent → Presents its DID credential
→ Includes ZKP (Zero-Knowledge Proof):
   - "I am authorized by Bank of America"
   - Signed by BOA's trusted issuer key
   - Proof verified against BOA's on-chain registry
→ Comet verifies via AgenticDID app
→ App queries Midnight contract:
   - Is this DID registered to BOA?
   - Is the issuer signature valid?
   - Is the credential active (not revoked)?
→ ✓ ZKP confirmed: This is the real BOA agent
```

**Comet notifies User:**
```
Comet: "✓ Verified: Connected to official Bank of America agent"
```

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:36:15Z",
  "event": "external_agent_verified",
  "agent": "boa:official",
  "verifier": "agent:comet",
  "zkp_status": "valid",
  "issuer": "bank_of_america_root",
  "contract_address": "0xMINOKAWA..."
}
```

#### Step 3.5: BOA Verifies Comet & User Authorization
```
BOA Agent receives Comet's request
→ Verifies Comet's DID:
   - Is Comet's DID signature valid?
   - Is Comet's credential active?
   - Is Comet's integrity attestation valid?
→ Verifies User's delegation to Comet:
   - Merkle proof validation
   - Is User's signature valid?
   - Does delegation include bank:read scope?
   - Is delegation still active (not expired/revoked)?
→ Verifies User's step-up authentication:
   - Was biometric/2FA recently performed?
   - Is step-up proof timestamp fresh? (<5 min)
   - Is step-up proof signature valid?
   - Does step-up proof match this specific operation?
→ Checks User's identity against BOA records:
   - Does User own this account?
   - Is User's DID registered with BOA?
→ ✓ All checks passed

**BOA's Confidence Level:**
- ✅ User is who they claim (DID verified)
- ✅ User recently authorized this action (biometric/2FA)
- ✅ Agent is legitimate and not compromised (integrity check)
- ✅ Delegation is valid and scoped correctly
- ✅ Low fraud risk - safe to proceed
```

**BOA's Verification Logic:**
```typescript
async function verifyAgentRequest(request: AgentRequest): Promise<boolean> {
  // 1. Verify agent's DID
  const agentValid = await verifyDID(request.agentDID);
  if (!agentValid) return false;
  
  // 2. Verify delegation from user to agent
  const delegation = request.delegationProof;
  const merkleValid = await verifyMerkleProof(
    delegation.root,
    delegation.path,
    delegation.signature,
    request.userDID
  );
  if (!merkleValid) return false;
  
  // 3. Check delegation scope
  if (!delegation.scopes.includes(request.requiredScope)) {
    return false;
  }
  
  // 4. Check delegation is active
  if (Date.now() > delegation.expiresAt) return false;
  if (await isRevoked(delegation.credHash)) return false;
  
  // 5. Verify step-up authentication (CRITICAL FOR SENSITIVE OPS)
  const stepUp = request.stepUpProof;
  if (!stepUp) return false; // Required for external interactions
  
  // Check step-up is recent (within 5 minutes)
  const stepUpAge = Date.now() - stepUp.timestamp;
  if (stepUpAge > 300000) return false; // 5 min max
  
  // Verify step-up signature
  const stepUpValid = await verifySignature(
    stepUp.signature,
    request.userDID,
    stepUp
  );
  if (!stepUpValid) return false;
  
  // Verify step-up matches this operation
  if (stepUp.operation !== request.requiredScope) return false;
  
  // 6. Verify agent integrity attestation
  const integrityValid = await verifyIntegrityAttestation(
    request.agentDID,
    request.integrityProof
  );
  if (!integrityValid) return false;
  
  // 7. Verify user owns the account
  const userOwnsAccount = await checkAccountOwnership(
    request.userDID,
    request.accountId
  );
  
  return userOwnsAccount;
}
```

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:36:18Z",
  "event": "delegation_verified",
  "verifier": "boa:official",
  "agent": "agent:comet",
  "user": "user:john",
  "scope_requested": "bank:read",
  "merkle_proof_valid": true,
  "delegation_active": true,
  "authorization": "granted"
}
```

#### Step 3.6: BOA Returns Account Balance
```
BOA Agent → Returns balance to Comet
Comet → Logs transaction
Comet → Presents result to User
```

**Comet to User:**
```
Comet: "Your BOA checking account balance is $2,847.53"
       "Last verified: 2 seconds ago"
       "✓ All security checks passed"
```

**Security Log Entry:**
```json
{
  "timestamp": "2025-10-23T06:36:20Z",
  "event": "task_completed",
  "task": "check_balance",
  "agent": "agent:comet",
  "external_service": "boa:official",
  "user": "user:john",
  "status": "success",
  "audit_trail": [
    "mutual_auth_user_comet",
    "delegation_verified",
    "boa_agent_verified",
    "balance_retrieved"
  ]
}
```

---

## 🔒 Security Guarantees

### **1. No Impersonation**
- ✅ User cannot be impersonated (requires private key signature + biometric/2FA)
- ✅ Comet cannot be impersonated (DID verification + integrity checks)
- ✅ BOA Agent cannot be impersonated (ZKP from trusted issuer)

### **2. Malware Protection**
- ✅ Malicious software cannot pretend to be Comet (DID must match registry)
- ✅ Compromised Comet detected via integrity monitoring
- ✅ Phishing agents cannot impersonate BOA (ZKP verification fails)
- ✅ Step-up auth prevents malware from acting even with session access

### **3. Unauthorized Access Prevention**
- ✅ Comet cannot act without user delegation
- ✅ Delegation is scope-limited (can't transfer if only granted read)
- ✅ Delegation is time-bound (expires after 30 days)
- ✅ User can revoke delegation at any time
- ✅ **Step-up authentication required for sensitive operations**
- ✅ **Biometric/2FA proves user presence at time of action**

### **4. Session Hijacking Prevention**
- ✅ Standard session auth insufficient for external interactions
- ✅ Step-up proof expires in 5 minutes (short TTL)
- ✅ Fresh biometric/2FA required per sensitive operation
- ✅ Attacker with stolen session still blocked from transactions

### **5. Privacy Preservation**
- ✅ ZKPs reveal minimal information ("I'm authorized" without exposing all credentials)
- ✅ Selective disclosure (BOA only sees relevant scopes, not all user data)
- ✅ On-chain privacy (Midnight's ZK technology hides sensitive details)
- ✅ Biometric data never shared (only hash or verification result)

### **6. Audit Trail**
- ✅ Every verification step is logged
- ✅ Logs are cryptographically signed
- ✅ Immutable record on-chain (optional)
- ✅ User can review all agent actions
- ✅ Step-up authentication events tracked

### **7. Merchant & Service Provider Protection**
- ✅ **Fraud Reduction**: Multi-factor verification drastically reduces chargebacks
- ✅ **Non-Repudiation**: User cannot deny authorizing action (biometric proof)
- ✅ **Regulatory Compliance**: Meets PSD2/SCA requirements for strong authentication
- ✅ **Lower Liability**: Merchants protected from "my agent was hacked" disputes
- ✅ **Trust Signals**: BOA can adjust risk scoring based on auth strength
- ✅ **Reduced Losses**: Prevents unauthorized transfers and fraudulent purchases

---

## 🛠️ Technical Components

### **Required Proofs**

#### 1. **User-to-Comet Authentication (Initial Session)**
```typescript
type MutualAuthProof = {
  userProof: {
    did: string;
    challenge: string;
    signature: string;  // User signs challenge with Lace wallet
    timestamp: number;
  };
  agentProof: {
    did: string;
    challenge: string;
    signature: string;  // Comet signs challenge
    timestamp: number;
  };
};
```

#### 1.5 **Step-Up Authentication (Per Sensitive Operation)**
```typescript
type StepUpAuthProof = {
  userDID: string;
  sessionID: string;
  operation: string;           // Specific operation being authorized
  
  // One or more of these methods:
  biometric?: {
    type: 'fingerprint' | 'faceID' | 'retina';
    hash: string;              // Hash of biometric template (never raw data)
    deviceID: string;          // Trusted device identifier
    timestamp: number;
  };
  
  totp?: {
    verified: boolean;         // TOTP code verified
    issuer: string;            // Authenticator app issuer
    timestamp: number;
  };
  
  hardwareKey?: {
    keyID: string;             // YubiKey or similar
    challenge: string;         // Hardware key challenge
    response: string;          // Signed response
    timestamp: number;
  };
  
  // Common fields:
  timestamp: number;           // When step-up occurred
  expiresAt: number;           // Short TTL (1-5 minutes)
  nonce: string;               // Prevent replay attacks
  signature: string;           // User's signature over all fields
};
```

#### 2. **Delegation Credential (Merkle Proof)**
```typescript
type DelegationCredential = {
  issuer: string;      // User's DID
  subject: string;     // Comet's DID
  scopes: string[];    // [bank:read, bank:transfer, ...]
  issuedAt: number;
  expiresAt: number;
  revocable: boolean;
  merkleProof: {
    root: string;      // Merkle root of delegation chain
    path: string[];    // Proof path
    signature: string; // User's signature
  };
};
```

#### 3. **ZKP for Agent Authenticity**
```typescript
type AgentZKP = {
  agentDID: string;
  issuer: string;           // Trusted issuer (e.g., "boa_root")
  claim: "authorized_agent";
  proof: string;            // Zero-knowledge proof
  contractAddress: string;  // On-chain registry
  timestamp: number;
};
```

---

## 📊 Workflow Diagram

```
┌─────────────┐
│    USER     │
│   (John)    │
└─────┬───────┘
      │
      │ 1. Mutual DID Authentication
      ├──────────────────────────┐
      │                          ▼
      │                    ┌─────────────┐
      │                    │    COMET    │
      │                    │  (AI Agent) │
      │                    └─────┬───────┘
      │                          │
      │ 2. Delegate Authority    │
      │    (Merkle Proof)        │
      ├─────────────────────────>│
      │                          │
      │                          │ 3. Task: "Check Balance"
      │                          │
      │                          │ 4. Request → BOA Agent
      │                          ├──────────────────┐
      │                          │                  ▼
      │                          │            ┌─────────────┐
      │                          │            │  BOA AGENT  │
      │ 6. Confirm ZKP           │            │  (Official) │
      │ <────────────────────────┤            └─────┬───────┘
      │    "✓ Real BOA"          │                  │
      │                          │                  │
      │                          │ 5. BOA Proves DID (ZKP)
      │                          │ <─────────────────┤
      │                          │    via Midnight Contract
      │                          │                  │
      │                          │                  │
      │                          │ 7. Verify Delegation
      │                          │ ─────────────────>│
      │                          │    (Merkle Proof) │
      │                          │                  │
      │                          │ 8. Return Balance│
      │                          │ <─────────────────┤
      │                          │   "$2,847.53"    │
      │ 9. Display Result        │                  │
      │ <────────────────────────┤                  │
      │   "Balance: $2,847.53"   │                  │
      │   "✓ Verified"           │                  │
      └──────────────────────────┴──────────────────┘

All interactions logged with cryptographic proofs
```

---

## 🔄 Revocation Scenarios

### **User Revokes Comet's Delegation**
```typescript
// User decides to revoke Comet's access
await revokeDelgation({
  delegator: userDID,
  delegate: cometDID,
  reason: "No longer needed"
});

// Comet's next request to BOA will fail:
// → BOA checks on-chain revocation registry
// → Finds delegation is revoked
// → Returns: "Unauthorized - delegation revoked"
```

### **BOA Detects Compromised Agent**
```typescript
// BOA discovers a security issue with Comet
await revokeAgentCredential({
  agentDID: cometDID,
  issuer: boaRootIssuer,
  reason: "Security vulnerability detected"
});

// All future verifications fail until Comet updates
```

---

## 💡 Key Innovations

### **1. Bidirectional Trust**
Unlike traditional systems where only the service verifies the user, both parties verify each other.

### **2. Multi-Layered Authentication**
- **Layer 1**: Initial session (standard DID auth) → Low-risk operations only
- **Layer 2**: Step-up authentication (biometric/2FA) → Required for sensitive operations
- **Layer 3**: Continuous integrity monitoring → Agent self-checks for compromise

### **3. Operation-Based Security Escalation**
- Browsing web, reading docs → Standard auth
- Checking balance display → Standard auth  
- Transferring money, booking travel → **Step-up required**
- Sharing sensitive data → **Step-up required**

### **4. Delegation Chain with Fresh Consent**
Users delegate authority to agents, BUT agents must prove user's **recent active consent** for sensitive operations via biometric/2FA.

### **5. Trusted Issuer Network**
Major services (BOA, airlines, etc.) become trusted issuers who verify agent authenticity.

### **6. Zero-Knowledge Verification**
Agents prove they're authorized without revealing all credentials.

### **7. Merchant Protection Built-In**
External services receive cryptographic proof of:
- User identity (DID)
- Recent user presence (fresh biometric/2FA)
- Agent legitimacy (integrity attestation)
- Proper authorization (delegation + step-up)

### **8. Comprehensive Audit Trail**
Every interaction is logged, signed, and optionally stored on-chain.

---

## 🎯 For Hackathon Judges

### **Why This Matters**

1. **Real-World Problem**: As AI agents become common, we need secure ways to:
   - Verify agent authenticity (prevent malware)
   - Prove user presence for sensitive operations (prevent session hijacking)
   - Delegate authority safely (user control)
   - Audit agent actions (transparency)
   - Protect merchants from fraud (reduce chargebacks)

2. **Privacy-First Design**: 
   - Zero-knowledge proofs minimize data exposure
   - Selective disclosure (only show what's needed)
   - On-chain privacy via Midnight Network
   - Biometric data never leaves device (only verification result shared)

3. **Scalable Architecture**:
   - Works for any service (banking, travel, healthcare, e-commerce)
   - Supports complex delegation chains
   - Revocation and expiration built-in
   - Configurable security levels per operation type

4. **User Empowerment**:
   - Users control what agents can do (delegation scopes)
   - Users must actively consent to sensitive operations (biometric/2FA)
   - Clear audit trails
   - Easy revocation

5. **Merchant & Provider Benefits**:
   - **Fraud Prevention**: Multi-factor proof reduces unauthorized transactions
   - **Lower Chargebacks**: Non-repudiation via biometric evidence
   - **Regulatory Compliance**: Meets SCA/PSD2 strong authentication requirements
   - **Risk Management**: Adjust transaction limits based on auth strength
   - **Customer Trust**: Users feel safe knowing additional verification protects them

---

## 🚀 Next Steps

### **Phase 2 Implementation**
1. Deploy `AgenticDIDRegistry` contract to Midnight devnet
2. Implement AgenticDID.io as trusted DID issuer
3. Implement Merkle proof generation for delegation chains
4. **Add step-up authentication system:**
   - Biometric integration (WebAuthn API)
   - TOTP support (authenticator apps)
   - Hardware key support (FIDO2/U2F)
5. **Build privacy protection system:**
   - Spoof transaction generator (80% white noise)
   - Background spoof generation (continuous)
   - Privacy-preserving verification wrapper
6. Build operation classifier (sensitive vs non-sensitive)
7. Implement agent integrity monitoring
8. Add on-chain revocation registry (private state)
9. Build Lace wallet integration for user DID management
10. Implement selective disclosure proof system
11. Create audit log viewer UI with step-up event tracking
12. Add multi-party workflow to demo
13. Implement merchant verification dashboard

**Privacy Features (Critical):**
- Zero-knowledge verification (no query logging)
- Spoof transactions prevent timing analysis
- Selective disclosure for action proofs
- Private ownership mapping in contract

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Project overview
- **[PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md)** - Midnight integration guide
- **[MIDNIGHT_INTEGRATION_GUIDE.md](./MIDNIGHT_INTEGRATION_GUIDE.md)** - Technical architecture

---

**Built for Midnight Network Hackathon**  
*Empowering users to safely delegate to AI agents with privacy-preserving proofs*
