# DID and KYC Architecture

**Self-Sovereign DIDs with Optional KYC Trust Tiers**

---

## 🎯 Core Principle

**DID Creation ≠ KYC Requirement**

- **DIDz (z=private)**: Self-sovereign, user-controlled, created without permission
- **KYC**: Optional credential that increases trust level of the DID
- **No KYC? No problem**: You can still use the system with limited trust

---

## 📋 DID Structure

### **DIDz Format**

```
did:agentic:user:<unique_identifier>z

Where:
- did:agentic - Method identifier
- user - Entity type
- <unique_identifier> - Hash or public key derived identifier
- z - PRIVATE marker (indicates self-sovereign, user-controlled)
```

**Examples:**
```
did:agentic:user:abc123z        # John's self-sovereign DID
did:agentic:user:def456z        # Alice's self-sovereign DID
did:agentic:trusted_issuer_0    # AgenticDID Foundation (not self-sovereign)
did:agentic:agent_0             # System agent (not self-sovereign)
```

### **DID Creation (Self-Sovereign)**

```typescript
// User creates their DID - NO KYC required
async function createSelfSovereignDID(userPublicKey: string): Promise<string> {
  // Generate DID from public key
  const identifier = hashPublicKey(userPublicKey);
  const did = `did:agentic:user:${identifier}z`;
  
  // Store DID document (can be local or on-chain)
  await storeDIDDocument({
    id: did,
    publicKey: userPublicKey,
    controller: did,  // User controls their own DID
    created: new Date(),
  });
  
  return did;
}
```

**No permission needed. No KYC required. Fully self-sovereign.** ✅

---

## 🏆 KYC Trust Tiers

KYC is a **credential issued TO the DID**, not a requirement FOR the DID.

### **Tier 0: No KYC (Default)**

**Trust Level**: UNVERIFIED  
**Capabilities**: Limited  
**Can Access**:
- Read-only services
- Public information
- Low-risk operations

**Cannot Access**:
- Financial services
- Voting
- Healthcare
- Any regulated operation

**Example**:
```
John creates: did:agentic:user:abc123z
No KYC → Tier 0 by default
Can browse, read, explore
Cannot transfer money or vote
```

### **Tier 1: Email + Basic Verification**

**Trust Level**: BASIC_VERIFICATION  
**Required From**: Any issuer (can be self-sovereign or institution)  
**Verification**:
- Email verification
- Phone number (optional)
- Basic profile info

**Capabilities**:
- Small transactions (< $100)
- Basic shopping
- Low-risk agent interactions

**Example**:
```
John → trusted_issuer_0: "Verify my email"
trusted_issuer_0 → John: KYC_TIER_1 credential
John's DID trust level: BASIC_VERIFICATION
Can now shop online with limits
```

### **Tier 2: Government ID Verification**

**Trust Level**: IDENTITY_VERIFIED  
**Required From**: CORPORATION or GOVERNMENT_ENTITY issuer  
**Verification**:
- Government-issued ID (driver's license, passport)
- Address verification
- Age verification
- Identity document authenticity check

**Capabilities**:
- Medium transactions (< $10,000)
- Financial account creation
- Crypto exchange access
- Healthcare access (non-prescription)

**Example**:
```
John → trusted_issuer_0: "Full KYC with ID"
trusted_issuer_0 verifies government ID
trusted_issuer_0 → John: KYC_TIER_2 credential
John's DID trust level: IDENTITY_VERIFIED
Can now create bank account, buy crypto
```

### **Tier 3: Full KYC (AML/CFT Compliant)**

**Trust Level**: FULL_KYC  
**Required From**: REGULATED_ENTITY issuer  
**Verification**:
- All Tier 2 requirements
- Background check
- AML/CFT screening
- Source of funds verification
- Enhanced due diligence

**Capabilities**:
- Unlimited transactions
- Institutional finance
- Cross-border transfers
- Voting (with additional voting credential)
- Medical prescriptions

**Example**:
```
John → Bank of America: "Full KYC for banking"
BOA performs full compliance checks
BOA → John: KYC_TIER_3 credential
John's DID trust level: FULL_KYC
Can now access all financial services
```

### **Tier 4: Accredited Investor / Special Status**

**Trust Level**: ACCREDITED  
**Required From**: REGULATED_ENTITY with special authorization  
**Verification**:
- All Tier 3 requirements
- Income verification ($200k+/year or $1M+ net worth)
- Investment sophistication assessment
- Tax documentation

**Capabilities**:
- Private securities
- Venture capital
- Hedge funds
- Restricted investments

**Example**:
```
John → Wealth Manager: "Accredited investor verification"
Wealth Manager verifies income, assets
Wealth Manager → John: ACCREDITED_INVESTOR credential
John's DID trust level: ACCREDITED
Can now invest in private deals
```

---

## 🔄 The Complete User Journey

### **Day 1: DID Creation (No KYC)**

```
John: "I want to try AgenticDID"

Comet: "Great! Let me create your DID..."
  → Generates keypair
  → Creates did:agentic:user:abc123z
  → Stores locally

Comet: "✅ Your DID is ready: did:agentic:user:abc123z
       You can browse and explore.
       Want to unlock more features? Complete KYC anytime."
```

**Result**: John has a DID, no KYC, Tier 0

---

### **Day 7: Basic Verification (Tier 1)**

```
John: "I want to buy something online"

Comet: "That requires basic verification. 
       I'll need to verify your email address.
       This takes about 2 minutes."

John: "OK, my email is john@example.com"

Comet → trusted_issuer_0 (agent_0):
  "KYC request for Tier 1 (email verification)"

agent_0: 
  → Sends verification email
  → John clicks link
  → Email verified

agent_0 → Comet:
  KYC_TIER_1 credential issued

Comet: "✅ Email verified! You can now shop online."
```

**Result**: John has KYC_TIER_1 credential, limited shopping access

---

### **Day 30: Full Identity Verification (Tier 2)**

```
John: "I want to create a bank account"

Comet: "That requires identity verification.
       I'll need to see your government ID.
       This takes about 10 minutes."

John: "Here's my driver's license"

Comet → trusted_issuer_0 (agent_0):
  "KYC request for Tier 2 (government ID)"

agent_0:
  → Scans driver's license
  → Verifies authenticity (OCR, database check)
  → Confirms address
  → Runs fraud checks

agent_0 → Comet:
  KYC_TIER_2 credential issued

Comet: "✅ Identity verified! You can now:
       - Create bank accounts
       - Buy crypto
       - Access healthcare services"
```

**Result**: John has KYC_TIER_2 credential, most services unlocked

---

### **Day 90: Banking Compliance (Tier 3)**

```
John: "I want to transfer $50,000"

Banker Agent: "That requires full KYC compliance.
              Need additional verification from your bank."

John → Bank of America:
  "I need full KYC for large transfers"

BOA (trusted_issuer_1):
  → Full background check
  → AML/CFT screening
  → Source of funds verification
  → Enhanced due diligence

BOA → John:
  KYC_TIER_3 credential issued

Comet: "✅ Full KYC complete! No transaction limits."
```

**Result**: John has KYC_TIER_3 from BOA, full access

---

## 🏗️ Technical Implementation

### **DID Document (No KYC)**

```json
{
  "id": "did:agentic:user:abc123z",
  "controller": "did:agentic:user:abc123z",
  "created": "2025-11-14T18:00:00Z",
  "publicKey": [{
    "id": "did:agentic:user:abc123z#key-1",
    "type": "Ed25519VerificationKey2020",
    "publicKeyBase58": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
  }],
  "authentication": ["did:agentic:user:abc123z#key-1"],
  "service": []
}
```

**No KYC credentials attached. User can still use the DID.**

---

### **DID with KYC Credentials**

```json
{
  "id": "did:agentic:user:abc123z",
  "controller": "did:agentic:user:abc123z",
  "created": "2025-11-14T18:00:00Z",
  "publicKey": [{ ... }],
  "authentication": ["did:agentic:user:abc123z#key-1"],
  
  // KYC credentials (stored separately, referenced here)
  "credentials": [
    {
      "id": "credential:kyc_tier_1_abc",
      "type": "KYC_TIER_1",
      "issuer": "did:agentic:trusted_issuer_0",
      "issuedAt": "2025-11-15T12:00:00Z",
      "expiresAt": "2026-11-15T12:00:00Z"
    },
    {
      "id": "credential:kyc_tier_2_def",
      "type": "KYC_TIER_2",
      "issuer": "did:agentic:trusted_issuer_0",
      "issuedAt": "2025-11-20T14:00:00Z",
      "expiresAt": "2026-11-20T14:00:00Z"
    }
  ]
}
```

**Credentials are separate from DID. User controls which to present.**

---

### **Trust Level Calculation**

```typescript
function calculateTrustLevel(did: string, credentials: Credential[]): TrustLevel {
  if (credentials.length === 0) {
    return TrustLevel.UNVERIFIED;  // Tier 0 - no KYC
  }
  
  // Find highest tier KYC credential
  const kycCredentials = credentials.filter(c => c.type.startsWith('KYC_TIER'));
  
  if (kycCredentials.some(c => c.type === 'KYC_TIER_3')) {
    return TrustLevel.FULL_KYC;  // Tier 3
  }
  
  if (kycCredentials.some(c => c.type === 'KYC_TIER_2')) {
    return TrustLevel.IDENTITY_VERIFIED;  // Tier 2
  }
  
  if (kycCredentials.some(c => c.type === 'KYC_TIER_1')) {
    return TrustLevel.BASIC_VERIFICATION;  // Tier 1
  }
  
  return TrustLevel.UNVERIFIED;  // Tier 0
}
```

---

### **Service Authorization**

```typescript
// Banker Agent checks trust level before allowing action
async function authorizeAction(
  userDid: string,
  action: string,
  amount?: number
): Promise<boolean> {
  // Get user's credentials
  const credentials = await getCredentialsForDid(userDid);
  
  // Calculate trust level
  const trustLevel = calculateTrustLevel(userDid, credentials);
  
  // Check if action is allowed for this trust level
  if (action === 'transfer') {
    if (amount && amount > 10000 && trustLevel < TrustLevel.FULL_KYC) {
      return false;  // Large transfer requires Tier 3
    }
    
    if (amount && amount > 100 && trustLevel < TrustLevel.IDENTITY_VERIFIED) {
      return false;  // Medium transfer requires Tier 2
    }
    
    if (trustLevel < TrustLevel.BASIC_VERIFICATION) {
      return false;  // Any transfer requires Tier 1
    }
  }
  
  return true;
}
```

---

## 📊 Trust Tier Matrix

| Service | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|--------|--------|--------|--------|--------|
| **Browse/Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Shop (< $100)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Shop (> $100)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Transfer (< $1k)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Transfer (> $10k)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Crypto Trading** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Healthcare Access** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Voting** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Private Investments** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 Privacy Preservation

**Key principle**: User controls which credentials to reveal.

```typescript
// User can choose to reveal only what's needed

// Example: Shopping agent needs Tier 1
Comet: "Shopping agent needs basic verification.
       I'll prove you have KYC_TIER_1 without revealing:
       - Your email address
       - Your real name
       - Your other credentials"

// ZK proof reveals ONLY:
// ✅ "This DID has KYC_TIER_1 credential"
// ✅ "Issued by trusted_issuer_0"
// ✅ "Not expired"
// ✅ "Not revoked"

// Hidden:
// 🔒 Actual email address
// 🔒 When KYC was performed
// 🔒 What other KYC tiers user has
// 🔒 Other credentials user holds
```

---

## 🚀 Implementation Checklist

### **Phase 1: Self-Sovereign DID Creation** ✅
- [x] Document DIDz format (z=private marker)
- [x] Define trust tier system
- [ ] Implement DID creation (no KYC)
- [ ] Store DID documents
- [ ] Basic DID resolution

### **Phase 2: KYC Tier System**
- [ ] Define KYC_TIER_1 credential schema
- [ ] Define KYC_TIER_2 credential schema
- [ ] Define KYC_TIER_3 credential schema
- [ ] Implement tier calculation logic
- [ ] Build agent_0 KYC workflows

### **Phase 3: Service Authorization**
- [ ] Implement trust level checks
- [ ] Add tier requirements to task agents
- [ ] Build authorization middleware
- [ ] Add clear error messages for insufficient KYC

---

## 💡 Key Insights

**Self-Sovereignty First:**
- Every user starts with a self-sovereign DID
- No permission needed to join the network
- No centralized authority controls DIDs

**Progressive Trust:**
- Users unlock capabilities as they complete KYC
- Clear tier system shows what's possible at each level
- No surprises - always know what you need

**Privacy by Design:**
- KYC credentials are separate from DID
- Selective disclosure - reveal only what's needed
- ZK proofs protect sensitive information

**Inclusive Access:**
- Tier 0: Everyone can participate
- Tier 1-4: Progressive access based on needs
- No all-or-nothing KYC barrier

---

**This is the AgenticDID way**: Self-sovereign foundation, optional trust upgrades, privacy preserved. 💙
