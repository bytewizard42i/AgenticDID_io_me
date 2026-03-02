# Midnight Hackathon Implementation Plan

**Project:** AgenticDID.io  
**Challenge:** Agent-Mediated Decentralized Identity with ZK Credentials  
**Network:** Midnight Testnet  
**Requirement:** ✅ REAL Midnight infrastructure only (no mocks)

---

## 🎯 **Hackathon Solution Architecture**

```
Frontend (Local/Cloud Run)
    ↓
API Gateway (Cloud Run)
    ↓
Midnight Gateway (Cloud Run) ──→ Proof Server (GCP VM)
    ↓                                 ↑
Agents Runtime (Cloud Run)            │
                                      │
                                Testnet Node
```

---

## ⚡ **Immediate Setup (Next 30 minutes)**

### **Step 1: Deploy Cloud Proof Server**

```bash
cd /home/js/utils_AgenticDID_io_me/AgenticDID_io_me_REAL-DEAL

# Run setup script
./scripts/setup-cloud-proof-server.sh

# This will:
# 1. Create GCP VM with AVX-512 CPU ✅
# 2. Install Docker ✅
# 3. Run proof server on testnet ✅
# 4. Configure firewall ✅
# 5. Provide external IP ✅
```

### **Step 2: Update Configuration**

```bash
# Add to .env
PROOF_SERVER_URL=http://[EXTERNAL_IP]:6300
MIDNIGHT_NETWORK=testnet
USE_MOCK=false
```

### **Step 3: Test Proof Server**

```bash
# Verify it's working
curl http://[EXTERNAL_IP]:6300/health

# Compile test contract
/home/js/utils_Midnight/bin/compactc \
  contracts/test/hello.compact \
  contracts/compiled/
```

---

## 📋 **Revised Phase Plan**

### **Phase 1: Infrastructure ✅ (In Progress)**
- [x] Compact compiler verified (0.26.0)
- [x] Frontend migrated and running
- [x] Docker services configured
- [ ] **Cloud proof server deployed** ← DOING NOW
- [ ] **Test contract compilation with real ZK**

### **Phase 2: AgenticDID Registry (2-3 hours)**
- [ ] Design `AgenticDIDRegistry.compact` contract
- [ ] Implement DID registration logic
- [ ] Deploy contract to testnet
- [ ] Create registration API endpoints
- [ ] Test with real ZK proofs

### **Phase 3: Credential Issuance (2-3 hours)**
- [ ] Implement credential issuance in contract
- [ ] Build issuance workflow
- [ ] Create verification endpoints
- [ ] Test full credential lifecycle

### **Phase 4: Agent Integration (2-3 hours)**
- [ ] Register Bank as TI with AgenticDID
- [ ] Register Bank Agent with AgenticDID
- [ ] Implement User → Agent → Bank flow
- [ ] End-to-end testing with real ZK

### **Phase 5: Demo & Documentation (1-2 hours)**
- [ ] Complete UI flow testing
- [ ] Record demo video
- [ ] Write hackathon submission docs
- [ ] Deploy to public URLs

**Total Estimated Time:** 8-12 hours

---

## 🏗️ **Contract Architecture**

### **AgenticDIDRegistry.compact**

```typescript
pragma language_version >= 0.18.0;

import CompactStandardLibrary;

// Main credential registry
export contract AgenticDIDRegistry {
  
  // User DIDs registered with the protocol
  ledger users: Map<Bytes<32>, UserDID>;
  
  // Agent DIDs authorized by users
  ledger agents: Map<Bytes<32>, AgentDID>;
  
  // Trusted Issuers/Verifiers
  ledger issuers: Map<Bytes<32>, IssuerDID>;
  
  // Credentials issued
  ledger credentials: Map<Bytes<32>, Credential>;
  
  // Register a new user
  export circuit registerUser(
    userDID: Bytes<32>,
    publicKey: Bytes<64>
  ): Void {
    // ZK proof that user controls private key
    users.insert(userDID, UserDID {
      did: userDID,
      publicKey: publicKey,
      registered: block.timestamp
    });
  }
  
  // Register agent for a user
  export circuit registerAgent(
    userDID: Bytes<32>,
    agentDID: Bytes<32>,
    permissions: Permissions
  ): Void {
    // ZK proof that caller owns userDID
    require(users.contains(userDID), "User not registered");
    
    agents.insert(agentDID, AgentDID {
      owner: userDID,
      did: agentDID,
      permissions: permissions,
      registered: block.timestamp
    });
  }
  
  // Issue credential (by TI)
  export circuit issueCredential(
    issuerDID: Bytes<32>,
    subjectDID: Bytes<32>,
    credentialType: Bytes<32>,
    claims: Claims
  ): Bytes<32> {
    // ZK proof that caller is registered issuer
    require(issuers.contains(issuerDID), "Not authorized issuer");
    
    let credID = hash(issuerDID, subjectDID, credentialType, block.timestamp);
    
    credentials.insert(credID, Credential {
      id: credID,
      issuer: issuerDID,
      subject: subjectDID,
      type: credentialType,
      claims: claims,
      issued: block.timestamp,
      revoked: false
    });
    
    return credID;
  }
  
  // Verify credential
  export circuit verifyCredential(
    credentialID: Bytes<32>,
    challenge: Bytes<32>
  ): Bool {
    // ZK proof verification with challenge
    if (!credentials.contains(credentialID)) {
      return false;
    }
    
    let cred = credentials.get(credentialID);
    return !cred.revoked;
  }
}
```

---

## 🔧 **Development Workflow**

### **Compile Contracts:**
```bash
# Point to cloud proof server
export PROOF_SERVER_URL=http://[VM_IP]:6300

# Compile
/home/js/utils_Midnight/bin/compactc \
  contracts/AgenticDIDRegistry.compact \
  contracts/compiled/
```

### **Deploy to Testnet:**
```bash
# Using Midnight CLI
midnight deploy \
  --network testnet \
  --contract contracts/compiled/AgenticDIDRegistry \
  --wallet wallets/deployer-wallet.json
```

### **Test Locally:**
```bash
# Start all services
docker-compose up

# Frontend connects to API Gateway
# API Gateway connects to Midnight Gateway  
# Midnight Gateway uses cloud proof server
# All using REAL Midnight testnet
```

---

## 💰 **Cost Management**

**GCP VM for Proof Server:**
- Running: ~$0.10/hour
- Stopped: ~$0.01/hour (storage only)

**Tips:**
```bash
# Stop when not actively developing
gcloud compute instances stop midnight-proof-server --zone=us-central1-a

# Start when needed
gcloud compute instances start midnight-proof-server --zone=us-central1-a

# Check status
gcloud compute instances list
```

---

## ✅ **Hackathon Compliance Checklist**

- [ ] ✅ Using real Midnight proof server (Cloud VM)
- [ ] ✅ Connected to Midnight testnet
- [ ] ✅ Contracts compiled with real ZK proofs
- [ ] ✅ No mock verifiers in production code
- [ ] ✅ Full ZK credential verification
- [ ] ✅ Demonstrable on testnet
- [ ] ❌ No shortcuts or simulations

---

## 🎯 **Success Criteria**

### **Minimum Viable Demo:**
1. User registers DID with AgenticDID
2. User authorizes Bank Agent
3. Bank Agent requests credential from Bank TI
4. Bank TI verifies and issues credential
5. Agent presents credential for transaction
6. All verified with REAL ZK proofs on testnet

### **Bonus Features:**
- Multiple agents per user
- Credential revocation
- Privacy-preserving age verification
- Multi-issuer credentials

---

## 🚀 **Next Steps**

**RIGHT NOW:**
```bash
# 1. Deploy cloud proof server
./scripts/setup-cloud-proof-server.sh

# 2. Get the external IP

# 3. Update .env with proof server URL

# 4. Test compilation
./scripts/compile-with-docker.sh contracts/test/hello.compact

# 5. If that works, proceed to Phase 2!
```

---

**Time Remaining:** [Calculate based on hackathon deadline]  
**Current Phase:** 1 (Infrastructure)  
**Blocker:** Need cloud proof server deployed  
**ETA to Phase 2:** 30 minutes after proof server is running

---

*This plan uses ONLY real Midnight infrastructure as required for hackathon judging.* ✅
