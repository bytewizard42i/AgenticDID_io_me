# Variable Naming Review - AgenticDID Contracts

**Purpose**: Review all variable names for clarity and consistency  
**Date**: October 24, 2025  
**Status**: Ready for your review and modifications

---

## 🎯 **AgenticDIDRegistry.compact**

### **State Variables (Ledger)**

| Variable Name | Type | Purpose | Intuitive? | Suggestions |
|--------------|------|---------|------------|-------------|
| `agentCredentials` | `Map<Bytes<32>, AgentCredential>` | Stores all agent credentials indexed by DID | ✅ Clear | Could be `agentsByDID` or `registeredAgents` |
| `delegations` | `Map<Bytes<32>, Delegation>` | Stores user→agent delegation relationships | ✅ Clear | Could be `userDelegations` or `delegationRecords` |
| `totalAgents` | `Uint<64>` | Counter for total registered agents | ✅ Clear | Good as-is |
| `totalDelegations` | `Uint<64>` | Counter for total delegations created | ✅ Clear | Good as-is |
| `contractOwner` | `Address` | Owner address (for admin functions) | ✅ Clear | Could be `adminAddress` or `ownerAddress` |
| `revocationBitmap` | `Uint<256>` | Bitmap tracking revoked agents (max 256) | ⚠️ Technical | Could be `revokedAgentsBitmap` or `agentRevocationMap` |

### **Struct: AgentCredential**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `did` | `Bytes<32>` | Agent's decentralized identifier | ✅ Clear | Industry standard term |
| `publicKey` | `Bytes<64>` | Agent's public key for verification | ✅ Clear | Could be `verificationKey` |
| `role` | `Bytes<32>` | Agent's role hash (e.g., "admin", "operator") | ✅ Clear | Could be `roleHash` to be explicit |
| `scopes` | `Bytes<32>` | Permission scopes hash | ⚠️ Generic | Could be `permissionScopes` or `accessScopes` |
| `issuedAt` | `Uint<64>` | Timestamp when credential was issued | ✅ Clear | Good as-is |
| `expiresAt` | `Uint<64>` | Timestamp when credential expires | ✅ Clear | Good as-is |
| `issuer` | `Address` | Who issued this credential | ✅ Clear | Could be `issuedBy` or `issuerAddress` |
| `isActive` | `Bool` | Whether credential is currently active | ✅ Clear | Good as-is |

### **Struct: Delegation**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `delegationId` | `Bytes<32>` | Unique ID for this delegation | ✅ Clear | Good as-is |
| `userDID` | `Bytes<32>` | User who granted delegation | ✅ Clear | Could be `granterDID` or `ownerDID` |
| `agentDID` | `Bytes<32>` | Agent who received delegation | ✅ Clear | Could be `delegatedAgentDID` |
| `scopes` | `Bytes<32>` | What agent can do on behalf of user | ⚠️ Generic | Could be `delegatedScopes` or `permissions` |
| `issuedAt` | `Uint<64>` | When delegation was created | ✅ Clear | Could be `createdAt` or `grantedAt` |
| `expiresAt` | `Uint<64>` | When delegation expires | ✅ Clear | Good as-is |
| `isActive` | `Bool` | Whether delegation is still valid | ✅ Clear | Good as-is |

### **Function Parameters (Common)**

| Parameter Name | Type | Purpose | Intuitive? | Suggestions |
|---------------|------|---------|------------|-------------|
| `caller` | `Address` | Who called this function | ✅ Clear | Could be `callerAddress` or `sender` |
| `currentTime` | `Uint<64>` | Current timestamp (passed explicitly) | ✅ Clear | Could be `timestamp` or `blockTime` |
| `zkProof` | `Bytes<>` | Zero-knowledge proof data | ⚠️ Technical | Could be `proofData` or `zeroKnowledgeProof` |

---

## 🔐 **CredentialVerifier.compact**

### **State Variables (Ledger)**

| Variable Name | Type | Purpose | Intuitive? | Suggestions |
|--------------|------|---------|------------|-------------|
| `registryContract` | `AgenticDIDRegistry` | **SEALED** - Reference to Registry contract | ✅ Clear | Could be `agentRegistry` or `didRegistry` |
| `verificationLog` | `Map<Bytes<32>, VerificationRecord>` | History of all verifications | ✅ Clear | Could be `verificationHistory` |
| `usedNonces` | `Map<Bytes<32>, Bool>` | Prevents replay attacks | ✅ Clear | Could be `nonceRegistry` or `consumedNonces` |
| `spoofTransactions` | `Map<Bytes<32>, SpoofRecord>` | Fake transactions for privacy | ⚠️ Technical | Could be `privacyTransactions` or `decoyRecords` |
| `totalVerifications` | `Uint<64>` | Counter for real verifications | ✅ Clear | Good as-is |
| `totalSpoofQueries` | `Uint<64>` | Counter for fake verifications | ⚠️ Technical | Could be `totalDecoyQueries` or `privacyTransactionCount` |
| `contractOwner` | `Address` | Owner address | ✅ Clear | Same as Registry |
| `spoofRatio` | `Uint<8>` | Percentage of fake transactions (default 80) | ⚠️ Technical | Could be `privacyRatio` or `decoyRatio` |

### **Struct: VerificationRecord**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `recordId` | `Bytes<32>` | Unique ID for this verification | ✅ Clear | Could be `verificationId` |
| `agentDID` | `Bytes<32>` | Agent being verified | ✅ Clear | Good as-is |
| `verifierDID` | `Bytes<32>` | Who requested verification | ✅ Clear | Could be `requestedBy` |
| `timestamp` | `Uint<64>` | When verification occurred | ✅ Clear | Could be `verifiedAt` |
| `wasSuccessful` | `Bool` | Verification result | ✅ Clear | Could be `isValid` or `passed` |
| `proofHash` | `Bytes<32>` | Hash of ZK proof | ✅ Clear | Good as-is |
| `nonce` | `Bytes<32>` | Anti-replay nonce | ✅ Clear | Could be `uniqueNonce` |

### **Struct: SpoofRecord**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `spoofId` | `Bytes<32>` | Unique ID for fake transaction | ⚠️ Technical | Could be `decoyId` or `privacyTransactionId` |
| `timestamp` | `Uint<64>` | When spoof was generated | ✅ Clear | Could be `generatedAt` |
| `targetDID` | `Bytes<32>` | Fake target (to confuse analysis) | ⚠️ Unclear | Could be `fakeAgentDID` or `decoyTarget` |

### **Struct: VerificationRequest**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `agentDID` | `Bytes<32>` | Agent to verify | ✅ Clear | Good as-is |
| `proofHash` | `Bytes<32>` | ZKP hash | ✅ Clear | Good as-is |
| `nonce` | `Bytes<32>` | Unique nonce | ✅ Clear | Good as-is |
| `timestamp` | `Uint<64>` | Request timestamp | ✅ Clear | Could be `requestedAt` |
| `requiredRole` | `Bytes<32>` | Required role hash | ✅ Clear | Good as-is |
| `requiredScopes` | `Bytes<32>` | Required scope hash | ✅ Clear | Could be `requiredPermissions` |

---

## 📦 **ProofStorage.compact**

### **State Variables (Ledger)**

| Variable Name | Type | Purpose | Intuitive? | Suggestions |
|--------------|------|---------|------------|-------------|
| `proofRecords` | `Map<Bytes<32>, ProofRecord>` | Stores cryptographic proofs | ✅ Clear | Could be `storedProofs` |
| `agentActions` | `Map<Bytes<32>, ActionLog>` | Audit trail of agent actions | ✅ Clear | Could be `actionHistory` or `auditLog` |
| `totalProofs` | `Uint<64>` | Counter for stored proofs | ✅ Clear | Good as-is |
| `totalActions` | `Uint<64>` | Counter for logged actions | ✅ Clear | Good as-is |
| `currentMerkleRoot` | `Bytes<32>` | Current Merkle tree root | ✅ Clear | Good as-is |
| `contractOwner` | `Address` | Owner address | ✅ Clear | Same as other contracts |

### **Struct: ProofRecord**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `proofId` | `Bytes<32>` | Unique proof ID | ✅ Clear | Good as-is |
| `proofType` | `Bytes<32>` | Type hash (e.g., "agent_verification") | ✅ Clear | Could be `proofCategory` |
| `agentDID` | `Bytes<32>` | Agent involved | ✅ Clear | Good as-is |
| `timestamp` | `Uint<64>` | When proof was created | ✅ Clear | Could be `createdAt` |
| `proofData` | `Bytes<>` | Actual ZK proof | ✅ Clear | Good as-is |
| `metadata` | `ProofMetadata` | Additional info | ✅ Clear | Good as-is |
| `merkleProof` | `Bytes<>` | Merkle proof for verification | ✅ Clear | Good as-is |

### **Struct: ProofMetadata**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `issuer` | `Address` | Who created the proof | ✅ Clear | Could be `createdBy` |
| `verifier` | `Address` | Who can verify | ✅ Clear | Could be `authorizedVerifier` |
| `expiresAt` | `Uint<64>` | Proof expiration | ✅ Clear | Good as-is |
| `isRevoked` | `Bool` | Revocation status | ✅ Clear | Good as-is |

### **Struct: ActionLog**

| Field Name | Type | Purpose | Intuitive? | Suggestions |
|-----------|------|---------|------------|-------------|
| `actionId` | `Bytes<32>` | Unique action ID | ✅ Clear | Good as-is |
| `agentDID` | `Bytes<32>` | Agent that performed action | ✅ Clear | Could be `performedBy` |
| `actionType` | `Bytes<32>` | Action type hash | ✅ Clear | Good as-is |
| `timestamp` | `Uint<64>` | When action occurred | ✅ Clear | Could be `performedAt` |
| `wasSuccessful` | `Bool` | Action result | ✅ Clear | Could be `succeeded` |
| `proofId` | `Bytes<32>` | Associated proof | ✅ Clear | Could be `relatedProofId` |
| `contextHash` | `Bytes<32>` | Context/parameters hash | ⚠️ Generic | Could be `parametersHash` or `contextData` |

---

## 🎨 **Naming Patterns Observed**

### **✅ Good Patterns (Keep These)**
- Use of "DID" for decentralized identifiers
- Consistent "At" suffix for timestamps (`issuedAt`, `expiresAt`)
- Clear boolean prefixes (`is`, `was`)
- Descriptive map names (`agentCredentials`, `verificationLog`)

### **⚠️ Potential Improvements**

1. **"Spoof" terminology**
   - Current: `spoofTransactions`, `spoofRatio`, `spoofId`
   - Alternative: Use "decoy", "privacy", or "cover" terminology
   - Rationale: "Spoof" might sound suspicious to non-technical users

2. **"Scopes" clarification**
   - Current: `scopes`
   - Suggestion: `permissionScopes` or `accessScopes`
   - Rationale: More explicit about what they control

3. **Technical terms**
   - `revocationBitmap` - Could add "Agents" → `revokedAgentsBitmap`
   - `zkProof` - Could expand → `zeroKnowledgeProof` or `privacyProof`
   - `nonce` - Industry standard, but could add `uniqueNonce` for clarity

4. **Consistency across contracts**
   - All use `contractOwner` - ✅ Good
   - All use `timestamp` in structs - ✅ Good
   - Consider standardizing on `createdAt` vs `issuedAt`

---

## 🔧 **Recommended Changes (Optional)**

### **High Priority (Clarity Improvements)**

```compact
// CredentialVerifier.compact
spoofTransactions → privacyTransactions or decoyRecords
spoofRatio → privacyRatio or decoyRatio
spoofId → decoyId or privacyTransactionId
totalSpoofQueries → totalPrivacyQueries

// AgenticDIDRegistry.compact
revocationBitmap → revokedAgentsBitmap
scopes → permissionScopes (in both structs)

// ProofStorage.compact
contextHash → parametersHash or actionContext
```

### **Medium Priority (Explicitness)**

```compact
// All contracts
caller → callerAddress (more explicit)
publicKey → verificationKey (clarifies purpose)

// CredentialVerifier.compact
targetDID → fakeAgentDID (clearer that it's fake)
verifierDID → requestedByDID

// ProofStorage.compact
issuer → createdBy (more intuitive)
verifier → authorizedVerifier
```

### **Low Priority (Consistency)**

```compact
// Standardize timestamp field names
issuedAt → createdAt (make consistent across contracts)
OR keep issuedAt everywhere (also fine)

// Consider adding "Hash" suffix where applicable
role → roleHash
proofHash → (already clear)
```

---

## 📋 **Action Items**

1. **Review this list** and mark which changes you want
2. **Prioritize changes** - High priority first
3. **I'll apply** the changes you approve
4. **Test compilation** after changes

---

## 💡 **Notes**

- **"Spoof" vs "Privacy/Decoy"**: This is your key innovation! The term should sound professional, not suspicious.
- **Current names are mostly good**: Many variables are already clear and intuitive.
- **Consistency is key**: Whatever terminology you choose, use it consistently across all contracts.

**Let me know which changes you'd like me to make!** 🎯
