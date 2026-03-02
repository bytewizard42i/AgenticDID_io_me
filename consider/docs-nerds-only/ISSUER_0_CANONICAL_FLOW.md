# Issuer_0 Canonical Flow

**"One perfect issuer, then replicate." - TD Bank Philosophy Applied**

---

## 🎯 Purpose

This document defines THE canonical issuer pattern for AgenticDID.

**Everything in this flow is PROTOCOL LAW:**
- If a future issuer doesn't follow this pattern → it's wrong
- If a feature breaks this flow → we fix the feature, not the flow
- If we're confused → we come back to this document

This is our **single source of truth** for how issuers work.

---

## 👥 The Four Roles

### 1. **trusted_issuer_0** (The Issuer)
- **ID**: `trusted_issuer_0`
- **DID**: `did:agentic:trusted_issuer_0`
- **Entity**: AgenticDID Foundation
- **Category**: `CORPORATION`
- **Verification Level**: `REGULATED_ENTITY`
- **Purpose**: Root/canonical trusted issuer for the protocol

### 2. **agent_0** (The Issuer Agent)
- **ID**: `agent_0`
- **DID**: `did:agentic:agent_0`
- **Role**: Issuer-side agent for trusted_issuer_0
- **Purpose**: Handles KYC, issues credentials, manages revocation
- **Template**: All future issuer agents pattern-match this

### 3. **canonical_agent_101** (The Local Agent - Comet)
- **ID**: `canonical_agent_101`
- **DID**: `did:agentic:canonical_agent_101`
- **Role**: User's personal AI assistant and local agent
- **Purpose**: Manages user's credentials, generates proofs, delegates to task agents
- **Template**: All future local agents pattern-match this

### 4. **John** (The User / Subject)
- **DID**: `did:agentic:user:john` (or similar)
- **Role**: First real user of the system
- **Purpose**: Dogfooding - validates the flow works for real humans

---

## 📋 The Complete Flow (A → B → C → D)

### **Step A: Onboard trusted_issuer_0**

**On Midnight Network, via AgenticDIDRegistry contract:**

```typescript
// Register trusted_issuer_0 in genesis/deployment
await AgenticDIDRegistry.registerIssuer({
  issuerDid: 'did:agentic:trusted_issuer_0',
  category: 'CORPORATION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'AgenticDID Foundation',
  claimedBrandName: 'AgenticDID',
  jurisdiction: 'US-DE',
  metadataHash: 'ipfs://...',  // Foundation docs, audit reports
  registeredBy: 'did:agentic:protocol:admin',
  stakeAmount: 100000,  // 100k tDUST
  isRevoked: false,
  allowedCredentialTypes: ['KYC_LEVEL_1', 'AGE_OVER_18'],
});
```

**Result:**
- ✅ trusted_issuer_0 now exists on-chain
- ✅ Can issue KYC_LEVEL_1 and AGE_OVER_18 credentials
- ✅ Staked 100k tDUST as good faith bond
- ✅ Fraud detection enabled (category + verification level checks)

---

### **Step B: Deploy agent_0 (Issuer Agent)**

**Canonical Issuer Agent Implementation:**

```typescript
// agent_0 configuration
const AGENT_0_CONFIG = {
  agentId: 'agent_0',
  agentDid: 'did:agentic:agent_0',
  role: 'ISSUER_AGENT',
  parentIssuerDid: 'did:agentic:trusted_issuer_0',
  allowedCredentialTypes: ['KYC_LEVEL_1', 'AGE_OVER_18'],
};

// agent_0 knows how to:
// 1. Receive KYC requests from local agents (Comet)
// 2. Guide users through KYC workflow
// 3. Verify identity documents (or mock for demo)
// 4. Issue credentials bound to user DIDs
// 5. Write revocation handles to Midnight
// 6. Return signed credential blob to Comet
```

**agent_0 Workflow (The Golden Template):**

```typescript
async function handleKycRequest(request: KycRequest): Promise<KycResult> {
  // Step 1: Validate request
  if (!request.subjectDid || !request.credentialType) {
    throw new Error('Invalid KYC request');
  }
  
  // Step 2: Check if agent_0 can issue this credential type
  if (!AGENT_0_CONFIG.allowedCredentialTypes.includes(request.credentialType)) {
    throw new Error('agent_0 not authorized for this credential type');
  }
  
  // Step 3: Guide user through KYC workflow
  const kycWorkflow = await runKycWorkflow({
    subjectDid: request.subjectDid,
    credentialType: request.credentialType,
    requiredDocuments: ['email', 'government_id'],
  });
  
  // Step 4: Verify documents (can be mocked for first pass)
  const verification = await verifyDocuments(kycWorkflow.documents);
  
  if (!verification.approved) {
    return { success: false, reason: verification.reason };
  }
  
  // Step 5: Issue credential
  const credential = await issueCredential({
    issuerDid: AGENT_0_CONFIG.parentIssuerDid,
    subjectDid: request.subjectDid,
    credentialType: request.credentialType,
    claims: {
      kyc_level: 'KYC_LEVEL_1',
      verified_at: new Date().toISOString(),
      jurisdiction: 'US',
      email_hash: hashEmail(request.email),
    },
  });
  
  // Step 6: Write revocation handle to Midnight
  await writeRevocationHandle({
    credentialId: credential.id,
    issuerDid: AGENT_0_CONFIG.parentIssuerDid,
    subjectDid: request.subjectDid,
  });
  
  // Step 7: Return credential to Comet
  return {
    success: true,
    credential: credential,
    revocationHandle: credential.id,
  };
}
```

**Result:**
- ✅ agent_0 deployed and functional
- ✅ Can process KYC requests
- ✅ Can issue KYC_LEVEL_1 credentials
- ✅ Template for all future issuer agents

---

### **Step C: Comet as Canonical Local Agent**

**IMPORTANT**: John's DID is self-sovereign (DIDz, z=private).  
No KYC required to create it. KYC is optional credential that increases trust.

**Comet's Capabilities for This Flow:**

```typescript
// Comet configuration
const COMET_CONFIG = {
  agentId: 'canonical_agent_101',
  agentDid: 'did:agentic:canonical_agent_101',
  role: 'LOCAL_AGENT',
  userDid: 'did:agentic:user:abc123z',  // John's SELF-SOVEREIGN DIDz (z=private)
};

// Comet can:
// 1. Create self-sovereign DID for user (NO KYC required)
// 2. Optionally initiate KYC with trusted_issuer_0 via agent_0
// 3. Store returned credentials securely
// 4. Generate ZK proofs when task agents need them
// 5. Talk to Midnight Gateway for proof verification
// 6. Explain everything to John in natural language
```

**Comet's DID Creation (Self-Sovereign):**

```typescript
async function createSelfSovereignDID(): Promise<string> {
  // John tells Comet: "Create my DID"
  
  this.narrator.speak(
    "Creating your self-sovereign DID... " +
    "This is your digital identity that YOU control."
  );
  
  // Generate keypair
  const keypair = await generateKeypair();
  
  // Create DIDz (z=private, self-sovereign)
  const identifier = hashPublicKey(keypair.publicKey);
  const did = `did:agentic:user:${identifier}z`;
  
  // Store DID document
  await this.storeDIDDocument({
    id: did,
    controller: did,
    publicKey: keypair.publicKey,
    privateKey: keypair.privateKey,  // Stored securely locally
  });
  
  this.narrator.speak(
    `✅ Your DID is ready: ${did}\n` +
    "You can now browse and explore AgenticDID.\n" +
    "Want to unlock more features? Complete KYC anytime."
  );
  
  return did;
}
```

**Comet's KYC Initiation (OPTIONAL):**

```typescript
async function initiateKyc(tier: number): Promise<void> {
  // John tells Comet: "I want to complete KYC"
  
  this.narrator.speak(
    "Great! KYC will unlock more capabilities.\n" +
    `Tier ${tier} verification will allow you to: ${describeTierCapabilities(tier)}\n` +
    "This is optional - your DID works without it."
  );
  
  // Step 1: Connect to agent_0
  const agent0 = await this.connectToAgent('agent_0');
  
  this.narrator.speak("Connected to AgenticDID Issuer Agent...");
  
  // Step 2: Send KYC request
  const kycRequest = {
    subjectDid: this.userDid,  // John's self-sovereign DIDz
    credentialType: `KYC_TIER_${tier}`,
    requestedBy: COMET_CONFIG.agentDid,
  };
  
  this.narrator.speak("Starting KYC workflow...");
  
  // Step 3: agent_0 guides through workflow
  const result = await agent0.processKyc(kycRequest);
  
  if (!result.success) {
    this.narrator.speak(
      `KYC failed: ${result.reason}\n` +
      "Don't worry - you can still use your DID without KYC."
    );
    return;
  }
  
  // Step 4: Store credential locally (separate from DID)
  await this.storeCredential(result.credential);
  
  this.narrator.speak(
    `✅ Tier ${tier} KYC complete!\n` +
    "Your credential is stored securely.\n" +
    `You can now: ${describeTierCapabilities(tier)}`
  );
}
```

**Result:**
- ✅ Comet can initiate KYC
- ✅ Comet stores credentials
- ✅ Comet explains process to John
- ✅ Template for all local agents

---

### **Step D: Proof & Verification Flow**

**The End-to-End Verification Pattern:**

```typescript
// SCENARIO: John wants to use Banker Agent (requires KYC)

// 1. John → Comet
John: "Check my balance"

// 2. Comet recognizes this needs Banker agent
Comet.narrator.speak("Let me help you check your balance.");

// 3. Comet queries Banker's requirements
const requirements = await BankerAgent.getRequirements('balance_check');
// Returns: { requiredCredentials: ['KYC_LEVEL_1'], minIssuerCategory: 'CORPORATION' }

// 4. Comet verifies John has required credential
const credential = await Comet.findCredential({
  type: 'KYC_LEVEL_1',
  issuerCategory: 'CORPORATION',
});

if (!credential) {
  Comet.narrator.speak("You need to complete KYC first. Would you like to do that now?");
  return;
}

// 5. Comet generates ZK proof
Comet.narrator.speak(
  "Verifying your credentials... " +
  "Creating zero-knowledge proof..."
);

const proofBundle = await Comet.generateProof({
  credential: credential,
  challenge: requirements.challenge,  // From Banker
  selectiveDisclosure: {
    reveal: ['has_kyc', 'issuer_category', 'not_expired'],
    hide: ['email_hash', 'verified_at', 'jurisdiction'],
  },
});

// 6. Comet sends proof to Midnight Gateway for verification
const verificationRequest = {
  credentialType: 'KYC_LEVEL_1',
  issuerDid: credential.issuerDid,  // 'did:agentic:trusted_issuer_0'
  proof: proofBundle.proof,
  challenge: requirements.challenge,
};

const verificationResult = await MidnightGateway.verify(verificationRequest);
```

**Midnight Gateway Verification Process:**

```typescript
// POST /verify handler

async function verifyCredential(request: VerificationRequest): Promise<VerificationResponse> {
  // Step 1: Fetch issuer from AgenticDIDRegistry
  const issuer = await AgenticDIDRegistry.getIssuer(request.issuerDid);
  
  if (!issuer) {
    return { valid: false, error: 'Issuer not found' };
  }
  
  // Step 2: Run fraud detection
  const fraudCheck = FraudDetector.assessIssuerRisk(issuer, request.credentialType);
  
  if (fraudCheck.riskScore === 'CRITICAL') {
    return {
      valid: false,
      error: 'Fraud detected',
      riskScore: 'CRITICAL',
      riskFlags: fraudCheck.flags,
    };
  }
  
  // Step 3: Verify ZK proof cryptographically
  const proofValid = await ZKVerifier.verifyProof({
    proof: request.proof,
    publicInputs: {
      credentialType: request.credentialType,
      issuerDid: request.issuerDid,
      challenge: request.challenge,
    },
  });
  
  if (!proofValid) {
    return { valid: false, error: 'Invalid proof' };
  }
  
  // Step 4: Check credential status (revocation, expiration)
  const status = await checkCredentialStatus(request.proof);
  
  if (status !== 'VALID') {
    return { valid: false, error: `Credential ${status}` };
  }
  
  // Step 5: Success!
  return {
    valid: true,
    issuerDid: request.issuerDid,
    issuerCategory: issuer.category,
    verificationLevel: issuer.verificationLevel,
    credentialType: request.credentialType,
    riskScore: 'LOW',
  };
}
```

**Completion:**

```typescript
// 7. Midnight Gateway returns success
// verificationResult = { valid: true, ... }

Comet.narrator.speak("✅ Credentials verified!");

// 8. Comet delegates to Banker
const bankerResult = await BankerAgent.checkBalance({
  userDid: John.did,
  verifiedCredential: verificationResult,
});

// 9. Banker executes action
// (Banker calls BOA API or simulates for demo)

// 10. Comet speaks result to John
Comet.narrator.speak(`Your balance is $${bankerResult.balance}.`);
```

---

## 📊 Success Criteria

**The ONE Perfect Flow works when:**

✅ **Issuer Onboarding**
- trusted_issuer_0 registered on-chain
- Category and verification level set correctly
- Allowed credential types defined
- Fraud detection recognizes issuer

✅ **Issuer Agent**
- agent_0 can receive KYC requests
- agent_0 can issue KYC_LEVEL_1 credentials
- agent_0 writes revocation handles
- agent_0 returns credentials to Comet

✅ **Local Agent (Comet)**
- Comet can initiate KYC with agent_0
- Comet stores credentials securely
- Comet can generate ZK proofs
- Comet can verify proofs via Midnight Gateway
- Comet explains everything to John

✅ **Verification Flow**
- Task agent requests credential
- Comet finds matching credential
- ZK proof generated
- Midnight Gateway verifies proof
- Fraud detection passes
- Credential status valid
- Task agent proceeds with action

✅ **End-to-End**
- John completes KYC
- John gets credential
- John uses credential with Banker/Crypto/etc.
- Everything "just works"

---

## 🔄 Replication Pattern

**Once this ONE flow works perfectly, we replicate for:**

### **trusted_issuer_1 (Bank of America)**
```typescript
const TRUSTED_ISSUER_1_CONFIG = {
  issuerDid: 'did:agentic:trusted_issuer_1',
  category: 'CORPORATION',
  verificationLevel: 'REGULATED_ENTITY',
  legalName: 'Bank of America, N.A.',
  claimedBrandName: 'Bank of America',
  allowedCredentialTypes: ['FINANCIAL_ACCOUNT', 'KYC_LEVEL_2'],
  // Everything else follows trusted_issuer_0 pattern
};
```

### **agent_1 (BOA Issuer Agent)**
- Copy agent_0 code
- Change config to point to trusted_issuer_1
- Customize KYC workflow for banking (account verification, etc.)
- Same structure, different details

### **Future Issuers**
- Kraken → trusted_issuer_2 + agent_2
- Visa → trusted_issuer_3 + agent_3
- DMV → trusted_issuer_4 + agent_4
- Hospital → trusted_issuer_5 + agent_5

**Every. Single. One. Follows. This. Pattern.** 🎯

---

## 📝 JSON Examples

### KYC Request (Comet → agent_0)

```json
{
  "requestId": "kyc_req_12345",
  "subjectDid": "did:agentic:user:john",
  "credentialType": "KYC_LEVEL_1",
  "requestedBy": "did:agentic:canonical_agent_101",
  "email": "john@example.com",
  "timestamp": "2025-11-14T18:00:00Z"
}
```

### Issued Credential (agent_0 → Comet)

```json
{
  "credentialId": "cred_abc123",
  "issuerDid": "did:agentic:trusted_issuer_0",
  "subjectDid": "did:agentic:user:john",
  "credentialType": "KYC_LEVEL_1",
  "issuedAt": "2025-11-14T18:05:00Z",
  "expiresAt": "2026-11-14T18:05:00Z",
  "claims": {
    "public": {
      "issuer": "did:agentic:trusted_issuer_0",
      "credentialType": "KYC_LEVEL_1"
    },
    "private": {
      "email_hash": "sha256:abc...",
      "verified_at": "2025-11-14T18:05:00Z",
      "jurisdiction": "US"
    }
  },
  "revocationHandle": "rev_handle_xyz789",
  "signature": "base64_signature..."
}
```

### Proof Bundle (Comet → Midnight Gateway)

```json
{
  "proof": "zk_proof_base64...",
  "publicInputs": {
    "credentialType": "KYC_LEVEL_1",
    "issuerDid": "did:agentic:trusted_issuer_0",
    "challenge": "nonce_from_banker_123"
  },
  "selectiveDisclosure": {
    "revealed": ["has_kyc", "issuer_category"],
    "hidden": ["email_hash", "verified_at"]
  }
}
```

### Verification Response (Midnight Gateway → Comet)

```json
{
  "valid": true,
  "issuerDid": "did:agentic:trusted_issuer_0",
  "issuerCategory": "CORPORATION",
  "verificationLevel": "REGULATED_ENTITY",
  "credentialType": "KYC_LEVEL_1",
  "riskScore": "LOW",
  "timestamp": "2025-11-14T18:10:00Z"
}
```

---

## 🎯 The TD Bank Mantra

> **"We don't want to make a million checks perfectly.  
> We want to make ONE check perfectly and copy that process."**

This document IS that one perfect check.

When in doubt, come back here. 💙

---

**Status**: 🚧 In Development  
**Owner**: John + Cassie  
**Version**: 1.0  
**Last Updated**: 2025-11-14
