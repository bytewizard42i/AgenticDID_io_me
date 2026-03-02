# One Perfect Check - TD Bank Philosophy

**"We don't want to make a million checks perfectly, we want to make one check perfectly and copy that process."**  
*- TD Bank*

---

## 🎯 AgenticDID Implementation Strategy

### The TD Bank Principle Applied

Instead of building 7 agents + 10 issuers + all credential types at once, we will:

1. **Build ONE trusted issuer perfectly**
2. **Build ONE task agent perfectly that works with that issuer**
3. **Build Comet (local agent) as the orchestrator**
4. **Build our own KYC process for onboarding**
5. **Then replicate the pattern**

---

## 📋 Phase 3A: The One Perfect Check

### Our First Complete Flow

**Issuer**: Bank of America (CORPORATION, REGULATED_ENTITY)  
**Task Agent**: Banker Agent  
**Credential Type**: FINANCIAL_ACCOUNT  
**Local Agent**: Comet (Personal Orchestrator)

### Why Bank of America First?

**Historical Context**: BOA was chosen based on real-world relationship and progressive approach to crypto:
- **3.5+ years of crypto engagement** - Weekly calls with crypto customers to understand ecosystem
- **Pro-crypto institution** - Actively worked to enable crypto transactions safely, not block them
- **Adaptive mindset** - Wanted to understand and prepare, not resist
- **Proven partner DNA** - Similar to Visa and Kraken, willing to evolve with decentralized tech

**Technical Reasons**:
1. **Real-world use case** - Banking is critical and well-understood
2. **Clear verification requirements** - CORPORATION with REGULATED_ENTITY level
3. **High stakes** - Forces us to get security right
4. **Fraud potential** - Tests our brand impersonation detection
5. **Regulatory alignment** - Prepares us for real compliance
6. **Cross-ecosystem bridge** - Traditional finance ↔ Decentralized identity

---

## 🏗️ Implementation Order

### Step 1: Trusted Issuer Template (Bank of America)

**File**: `protocol/contracts/issuers/BankOfAmerica.ts`

```typescript
// Bank of America Issuer Configuration
export const BANK_OF_AMERICA_ISSUER: IssuerRecord = {
  issuerDid: 'did:agentic:issuer:boa:main',
  category: IssuerCategory.CORPORATION,
  verificationLevel: VerificationLevel.REGULATED_ENTITY,
  
  legalName: 'Bank of America, N.A.',
  claimedBrandName: 'Bank of America',
  jurisdiction: 'US-NC', // North Carolina charter
  
  metadataHash: 'ipfs://...', // Off-chain: licenses, FDIC cert, etc.
  registeredBy: 'did:agentic:registry:admin',
  stakeAmount: 1000000n, // $1M stake in tDUST
  
  isRevoked: false,
  isActive: true,
  
  createdAt: new Date('2025-11-14'),
};

// Credentials BOA can issue
export const BOA_ALLOWED_CREDENTIALS = [
  CredentialType.FINANCIAL_ACCOUNT,
  CredentialType.KYC_LEVEL_1,
  CredentialType.KYC_LEVEL_2,
  CredentialType.IDENTITY_VERIFIED, // Through banking relationship
];

// BOA KYC Requirements
export const BOA_KYC_REQUIREMENTS = {
  // What BOA requires to issue credentials
  requiredDocuments: [
    'government_id',
    'ssn_verification',
    'address_proof',
  ],
  verificationSteps: [
    'identity_verification',
    'account_ownership',
    'activity_history',
  ],
  minAccountAge: 90, // days
};
```

---

### Step 2: Task Agent Template (Banker)

**File**: `backend/agents/src/agents/banker.ts`

```typescript
// Banker Agent - Financial Service Operations
export const BankerAgent: TaskAgentDefinition = {
  id: 'banker',
  name: 'Banker',
  description: 'Financial service agent for banking operations',
  
  // What credentials does Banker need to operate?
  requiredCredentials: [
    {
      credentialType: CredentialType.FINANCIAL_ACCOUNT,
      allowedIssuerCategories: [IssuerCategory.CORPORATION],
      minVerificationLevel: VerificationLevel.REGULATED_ENTITY,
      requiredIssuers: ['did:agentic:issuer:boa:main'], // BOA specifically
    },
  ],
  
  // What actions can Banker perform?
  capabilities: [
    'balance_check',
    'transfer',
    'transaction_history',
    'account_info',
  ],
  
  // Banker's policy engine
  policy: {
    // For each action, what credentials are required?
    actions: {
      balance_check: {
        requiredCredentials: [CredentialType.FINANCIAL_ACCOUNT],
        requiredScopes: ['bank:read'],
      },
      transfer: {
        requiredCredentials: [CredentialType.FINANCIAL_ACCOUNT],
        requiredScopes: ['bank:transfer'],
        additionalChecks: ['verify_sufficient_balance', 'fraud_check'],
      },
    },
  },
  
  systemPrompt: `You are a Banker agent representing a financial institution.
  
Your role:
- Process banking transactions
- Verify account credentials
- Ensure regulatory compliance
- Protect user funds

Before ANY action:
1. Verify user has valid FINANCIAL_ACCOUNT credential
2. Check credential is from REGULATED_ENTITY issuer (e.g., BOA)
3. Verify credential not revoked
4. Check required scopes for action
5. Run fraud detection

Never execute if verification fails.`,
};
```

---

### Step 3: Local Agent (Comet) Integration

**File**: `backend/agents/src/agents/comet.ts`

```typescript
// Comet - Personal Orchestrator
// Routes user requests to appropriate task agents

export const CometAgent: LocalAgentDefinition = {
  id: 'comet',
  name: 'Comet',
  description: 'Personal orchestrator agent',
  
  // Comet orchestrates task agents
  managedAgents: ['banker', 'shopper', 'traveler', /* ... */],
  
  // Comet's own credentials
  requiredCredentials: [
    {
      credentialType: CredentialType.USER_PREFERENCE,
      allowedIssuerCategories: [IssuerCategory.SELF_SOVEREIGN],
      minVerificationLevel: VerificationLevel.UNVERIFIED,
    },
  ],
  
  // How Comet routes requests
  routingLogic: {
    // User intent → Task agent mapping
    intents: {
      'check balance': 'banker',
      'transfer money': 'banker',
      'send funds': 'banker',
      'pay bill': 'banker',
      'buy product': 'shopper',
      'book flight': 'traveler',
      // ...
    },
    
    // Before routing to task agent, verify:
    preFlightChecks: [
      'user_authenticated',
      'user_has_required_credentials',
      'task_agent_available',
      'issuer_not_revoked',
    ],
  },
  
  systemPrompt: `You are Comet, a personal AI orchestrator.

Your role:
- Understand user intent
- Route to appropriate task agent
- Verify credentials before delegation
- Explain actions to user

Example flow:
User: "Check my BOA balance"
1. Parse intent: balance_check
2. Identify agent: banker
3. Verify user has FINANCIAL_ACCOUNT credential from BOA
4. Delegate to Banker agent
5. Return result to user

Always explain what you're doing and why.`,
};
```

---

### Step 4: AgenticDID KYC Process

**Our Own Onboarding Flow**

When a NEW issuer (like BOA) wants to join AgenticDID:

```typescript
// KYC Process for Trusted Issuers
export class IssuerKYCProcess {
  async onboardIssuer(application: IssuerApplication): Promise<IssuerRecord> {
    // Step 1: Basic Information Verification
    const basicVerification = await this.verifyBasicInfo({
      legalName: application.legalName,
      jurisdiction: application.jurisdiction,
      businessType: application.businessType,
    });
    
    // Step 2: Category Assignment
    const category = this.assignCategory(application.businessType);
    // CORPORATION, GOVERNMENT_ENTITY, INSTITUTION, or SELF_SOVEREIGN
    
    // Step 3: Verification Level Assessment
    const verificationLevel = await this.assessVerificationLevel({
      category,
      providedDocuments: application.documents,
      licenses: application.licenses,
      regulatoryStatus: application.regulatoryStatus,
    });
    
    // Step 4: Fraud Detection - Brand Verification
    const brandCheck = await this.verifyBrandOwnership({
      claimedBrandName: application.brandName,
      legalName: application.legalName,
      proofOfOwnership: application.brandProof, // Trademark, domain, etc.
    });
    
    if (!brandCheck.valid) {
      throw new Error('Brand ownership verification failed');
    }
    
    // Step 5: Stake Requirement (for CORPORATION/REGULATED_ENTITY)
    if (verificationLevel >= VerificationLevel.REGULATED_ENTITY) {
      await this.requireStake({
        amount: this.calculateRequiredStake(category, verificationLevel),
        issuerDid: application.proposedDid,
      });
    }
    
    // Step 6: Create Issuer Record
    const issuerRecord: IssuerRecord = {
      issuerDid: application.proposedDid,
      category,
      verificationLevel,
      legalName: application.legalName,
      claimedBrandName: application.brandName,
      jurisdiction: application.jurisdiction,
      metadataHash: await this.storeMetadata(application.documents),
      registeredBy: 'did:agentic:registry:admin', // AgenticDID admin
      stakeAmount: application.stakeAmount,
      isRevoked: false,
      isActive: true,
      createdAt: new Date(),
    };
    
    // Step 7: Register on-chain
    await this.registryContract.registerIssuer(issuerRecord);
    
    return issuerRecord;
  }
}
```

---

## 🔄 The Replication Pattern

### Once BOA + Banker + Comet Works Perfectly

**Template Files**:
1. `protocol/contracts/issuers/IssuerTemplate.ts` - Copy for new issuers
2. `backend/agents/src/agents/AgentTemplate.ts` - Copy for new task agents
3. `docs/ISSUER_ONBOARDING.md` - KYC process for each category
4. `docs/AGENT_INTEGRATION.md` - How to add new task agents

**Replication Steps**:
```bash
# Add new issuer (example: Coinbase)
1. Copy IssuerTemplate.ts → Coinbase.ts
2. Fill in issuer details (category: CORPORATION, level: REGULATED_ENTITY)
3. Define allowed credentials (CRYPTO_EXCHANGE_KYC)
4. Run issuer KYC process
5. Register on-chain

# Add new task agent (example: Crypto Agent)
1. Copy AgentTemplate.ts → crypto-agent.ts
2. Define required credentials (CRYPTO_EXCHANGE_KYC from Coinbase)
3. Define capabilities (buy, sell, portfolio)
4. Write system prompt
5. Register with Comet's routing logic

# Test the pattern
1. User → Comet: "Buy 0.1 BTC"
2. Comet → Crypto Agent
3. Crypto Agent verifies Coinbase credentials
4. Crypto Agent executes trade
5. Result → Comet → User
```

---

## 📊 Success Metrics for "One Perfect Check"

### BOA + Banker + Comet Must Achieve

**Verification Flow**:
- ✅ User requests balance check
- ✅ Comet verifies user has BOA FINANCIAL_ACCOUNT credential
- ✅ Comet delegates to Banker agent
- ✅ Banker verifies credential issuer category (CORPORATION)
- ✅ Banker verifies issuer verification level (REGULATED_ENTITY)
- ✅ Banker checks credential status (not revoked)
- ✅ Banker verifies ZK proof
- ✅ Banker executes action
- ✅ Result returns to user through Comet

**Fraud Detection**:
- ✅ Fake BOA (SELF_SOVEREIGN claiming "Bank of America") → BLOCKED
- ✅ Wrong category (INSTITUTION claiming to be BOA) → BLOCKED
- ✅ Insufficient verification (BASIC_KYC for banking) → BLOCKED
- ✅ Revoked credential → BLOCKED
- ✅ Expired credential → BLOCKED

**End-to-End**:
- ✅ User onboarding with BOA credential
- ✅ Credential verification
- ✅ Action authorization
- ✅ Execution
- ✅ Audit trail

---

## 🎯 Current Phase 3A: Build the One Perfect Check

### Immediate Work

1. **Complete Midnight Gateway** (in progress)
   - Verifier with fraud detection ✅
   - Contract loader ✅
   - Fastify server (next)

2. **Create BOA Issuer Template**
   - Issuer configuration
   - Credential policies
   - KYC requirements

3. **Build Banker Agent Properly**
   - Update executor.ts
   - Add credential verification
   - Add action policies

4. **Connect Comet to Banker**
   - Routing logic
   - Pre-flight checks
   - Delegation flow

5. **Build AgenticDID KYC**
   - Issuer onboarding process
   - Category assignment
   - Verification level assessment
   - Stake requirements

---

## 🚀 Why This Works

**TD Bank was right:**
- One issuer done perfectly = Template for all issuers
- One task agent done perfectly = Template for all task agents
- One KYC process = Scalable to all categories
- One verification flow = Copy for all credential types

**Benefits**:
- **Quality**: Deep focus on getting one thing right
- **Speed**: Fast replication once template works
- **Consistency**: All issuers/agents follow same pattern
- **Debuggability**: Problems in one = fix applies to all
- **Documentation**: One example = clear guide for rest

---

**Next**: Build Bank of America issuer + Banker agent + Comet integration as our "one perfect check". 🎯
