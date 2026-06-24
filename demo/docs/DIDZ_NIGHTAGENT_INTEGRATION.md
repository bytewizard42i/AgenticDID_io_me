# 🏥 DIDz Suite × NightAgent Integration
**Privacy-Preserving Clinical Trial Recruitment**

**Created**: October 29, 2025  
**Purpose**: Technical specification for integrating DIDz protocol suite with NightAgent MCP server  
**Use Case**: HIPAA-compliant clinical trial recruitment using zero-knowledge proofs

---

## Overview

### The Problem

**Clinical Trial Recruitment** wastes **$1.4 billion annually** due to:
- Manual EHR review (time-intensive, error-prone)
- Privacy concerns (direct patient contact violates HIPAA comfort zone)
- Low participation rates (patients distrust data sharing)
- Delayed enrollment (30-40% participation boost possible with privacy controls)

### The Solution

**NightAgent + DIDz Protocol Suite** = Privacy-preserving recruitment:

1. **Anonymous Eligibility Matching** - ZK proofs prove eligibility WITHOUT revealing medical records
2. **IRB-Approved Messaging** - Template-locked notifications ensure compliance
3. **Patient-Controlled Disclosure** - Opt-in reveal, anonymous decline
4. **Immutable Audit Trail** - Provable HIPAA compliance for regulators

---

## Architecture Integration

```
┌────────────────────────────────────────────────────────────────────┐
│                         NightAgent MCP Server                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  LLM Agent (Claude/GPT-4)                                     │  │
│  │  - Natural language queries                                   │  │
│  │  - Trial matching logic                                       │  │
│  │  - TTS for accessibility                                      │  │
│  └────────────────┬───────────────────────────────────────────────┘  │
│                   │ MCP Protocol                                    │
│  ┌────────────────▼───────────────────────────────────────────────┐  │
│  │  MCP Tools Layer                                              │  │
│  │  - sendTrialInvitation()                                       │  │
│  │  - checkEligibility()                                          │  │
│  │  - recordConsent()                                             │  │
│  │  - generateAuditReport()                                       │  │
│  └────────────────┬───────────────────────────────────────────────┘  │
│                   │                                                 │
└───────────────────┼─────────────────────────────────────────────────┘
                    │
                    ↓ DIDz Protocol Calls
┌────────────────────────────────────────────────────────────────────┐
│                    DIDz Protocol Suite (Midnight)                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   PolicyZ    │  │    NotiZ     │  │    VCz       │            │
│  │  (Templates) │──│  (Messaging) │──│  (Credentials)│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         │                  │                  │                    │
│         └──────────────────┴──────────────────┘                    │
│                            │                                        │
│                  ┌─────────▼─────────┐                             │
│                  │   AuditZ (Logs)   │                             │
│                  └───────────────────┘                             │
└────────────────────────────────────────────────────────────────────┘
                    │
                    ↓ Storage & Retrieval
┌────────────────────────────────────────────────────────────────────┐
│                 EHR System (HIPAA Boundary)                         │
│  - Patient records (off-chain, encrypted)                           │
│  - Eligibility computation (local, no data export)                  │
│  - Commitment generation (Merkle tree roots only published)         │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Integration

### 1. NightAgent MCP Server

**Location**: `/home/js/utils_Midnight/utils_NightAgent/NightAgent-London/NA-MCP-main/`

**Key Components**:

```typescript
// src/tools/clinical-trial-recruitment.ts
import { PolicyZContract } from '@didz/contracts/PolicyZ';
import { NotiZContract } from '@didz/contracts/NotiZ';
import { VCzContract } from '@didz/contracts/VCz';
import { AuditZContract } from '@didz/contracts/AuditZ';

/**
 * MCP Tool: Send clinical trial invitation
 * 
 * Workflow:
 * 1. Compute eligibility off-chain (HIPAA-protected)
 * 2. Generate Merkle tree of eligible patient commitments
 * 3. Publish root via NotiZ (no patient data)
 * 4. Send anonymous notifications with template proofs
 * 5. Log audit trail via AuditZ
 */
export async function sendTrialInvitation(args: {
  trialId: string;
  inclusionCriteria: EligibilityCriteria;
  exclusionCriteria: EligibilityCriteria;
  irbApprovedMessage: string;
  contactInfo: string;
}) {
  // Step 1: Compute eligibility (OFF-CHAIN)
  const eligiblePatients = await computeEligibility(
    args.inclusionCriteria,
    args.exclusionCriteria
  );
  
  console.log(`✓ Found ${eligiblePatients.length} eligible patients`);
  
  // Step 2: Generate commitments (PRIVACY-PRESERVING)
  const commitments = eligiblePatients.map(p => ({
    commitment: hash(p.patientId, p.dob, SALT),
    didz: p.didz,  // Anonymous handle
    merkleProof: null  // Will be filled after tree construction
  }));
  
  const merkleTree = buildMerkleTree(commitments.map(c => c.commitment));
  
  // Fill in Merkle proofs
  commitments.forEach(c => {
    c.merkleProof = merkleTree.getProof(c.commitment);
  });
  
  // Step 3: Register IRB-approved template (if not already registered)
  const templateHash = hash(args.irbApprovedMessage);
  
  await policyZ.registerTemplate({
    templateHash,
    templateContent: args.irbApprovedMessage,
    jurisdictionPack: HIPAA_COMPLIANT,
    approvedBy: IRB_SIGNATURE,
    approvedAt: Date.now()
  });
  
  console.log(`✓ Template registered: ${templateHash.slice(0, 16)}...`);
  
  // Step 4: Publish eligibility root (ON-CHAIN)
  await notiZ.publishEligibilityRoot({
    trialId: args.trialId,
    merkleRoot: merkleTree.root,
    templateHash,
    count: eligiblePatients.length,  // Only count, no IDs
    publishedAt: Date.now()
  });
  
  console.log(`✓ Eligibility root published: ${merkleTree.root.slice(0, 16)}...`);
  
  // Step 5: Send notifications (ANONYMOUS)
  for (const patient of commitments) {
    await notiZ.sendMessage({
      recipient: patient.didz,  // Anonymous handle
      templateHash,
      dataCommitments: {
        trialId: hash(args.trialId),
        eligibilityProof: patient.merkleProof,
        contactEncrypted: encrypt(args.contactInfo, patient.didz.publicKey)
      },
      proofOfConformance: generateTemplateConformanceProof(
        templateHash,
        args.irbApprovedMessage
      ),
      ttl: 30 * 24 * 60 * 60  // 30 days
    });
  }
  
  console.log(`✓ Sent ${commitments.length} anonymous notifications`);
  
  // Step 6: Audit trail (IMMUTABLE)
  const auditRecord = await auditZ.logRecruitmentCampaign({
    trialId: args.trialId,
    templateHash,
    merkleRoot: merkleTree.root,
    notificationCount: commitments.length,
    irbApproval: IRB_SIGNATURE,
    timestamp: Date.now()
  });
  
  console.log(`✓ Audit record created: ${auditRecord.id}`);
  
  return {
    success: true,
    trialId: args.trialId,
    notificationsSent: commitments.length,
    merkleRoot: merkleTree.root,
    auditRecordId: auditRecord.id
  };
}

/**
 * MCP Tool: Check patient eligibility (PRIVACY-PRESERVING)
 */
export async function checkEligibility(args: {
  patientDidz: string;
  trialId: string;
}) {
  // Patient queries their own eligibility
  // Returns true/false WITHOUT revealing why or medical details
  
  const eligibilityRoot = await notiZ.getEligibilityRoot(args.trialId);
  
  // Patient must provide their commitment + proof
  // (Generated from their own records, client-side)
  const { commitment, proof } = await generatePatientCommitment(args.patientDidz);
  
  const isEligible = verifyMerkleProof(
    commitment,
    proof,
    eligibilityRoot.merkleRoot
  );
  
  return {
    eligible: isEligible,
    trialId: args.trialId,
    canOptIn: isEligible
  };
}

/**
 * MCP Tool: Record patient consent (OPT-IN)
 */
export async function recordConsent(args: {
  patientDidz: string;
  trialId: string;
  selectiveDisclosure: string[];  // Which attributes to reveal
}) {
  // Patient opts in and selectively discloses
  
  // Step 1: Verify patient is in eligible set
  const { commitment, proof } = await generatePatientCommitment(args.patientDidz);
  
  await vcz.verifyEligibilityMembership({
    commitment,
    proof,
    trialId: args.trialId
  });
  
  // Step 2: Generate selective disclosure proof
  const disclosureProof = await vcz.generateSelectiveDisclosure({
    patientDidz: args.patientDidz,
    attributes: args.selectiveDisclosure,  // e.g., ["age", "diagnosis"]
    // Does NOT reveal: medical history, medications, etc.
  });
  
  // Step 3: Record consent
  const consentRecord = await policyZ.recordConsent({
    userDID: args.patientDidz,
    dataDomain: `clinical_trial:${args.trialId}`,
    purpose: `Enrollment in trial ${args.trialId}`,
    disclosedAttributes: args.selectiveDisclosure,
    duration: 365 * 24 * 60 * 60,  // 1 year
    timestamp: Date.now()
  });
  
  // Step 4: Audit trail
  await auditZ.logConsentEvent({
    patientDidz: args.patientDidz,
    trialId: args.trialId,
    consentId: consentRecord.id,
    selectiveDisclosure: args.selectiveDisclosure,
    timestamp: Date.now()
  });
  
  return {
    success: true,
    consentId: consentRecord.id,
    disclosedAttributes: args.selectiveDisclosure
  };
}

/**
 * MCP Tool: Generate IRB audit report
 */
export async function generateAuditReport(args: {
  trialId: string;
  startDate: number;
  endDate: number;
}) {
  // Generate provable audit report for IRB
  
  const campaign = await auditZ.getRecruitmentCampaign(args.trialId);
  const consents = await auditZ.getConsentEvents({
    trialId: args.trialId,
    startDate: args.startDate,
    endDate: args.endDate
  });
  
  return {
    trialId: args.trialId,
    summary: {
      notificationsSent: campaign.notificationCount,
      patientsConsented: consents.length,
      conversionRate: (consents.length / campaign.notificationCount) * 100,
      templateUsed: campaign.templateHash,
      irbApproval: campaign.irbApproval,
      privacyCompliance: "HIPAA-compliant (ZK proofs, no PHI exposed)"
    },
    auditTrail: {
      campaignId: campaign.id,
      merkleRoot: campaign.merkleRoot,
      proofOfConformance: campaign.proofOfConformance,
      immutableLedger: "Midnight blockchain"
    },
    consents: consents.map(c => ({
      consentId: c.id,
      timestamp: c.timestamp,
      selectiveDisclosure: c.selectiveDisclosure,
      proof: c.proof
    }))
  };
}
```

---

### 2. DIDz Contract Integration

#### PolicyZ Contract

```compact
// contracts/PolicyZ.compact
pragma language_version >= 0.17.0;
import CompactStandardLibrary;

ledger templates: Map<Bytes<32>, Template>;
ledger consents: Map<Bytes<32>, Consent>;

struct Template {
  templateHash: Bytes<32>;
  templateContent: Bytes<512>;
  jurisdictionPack: Bytes<32>;  // HIPAA, GDPR, etc.
  approvedBy: Bytes<256>;       // IRB signature
  approvedAt: Uint<64>;
}

struct Consent {
  consentId: Bytes<32>;
  userDID: Bytes<32>;
  dataDomain: Bytes<32>;
  purpose: Bytes<256>;
  disclosedAttributes: Bytes<256>;
  grantedAt: Uint<64>;
  expiresAt: Uint<64>;
  revoked: Boolean;
}

export circuit registerTemplate(
  caller: ContractAddress,
  templateHash: Bytes<32>,
  templateContent: Bytes<512>,
  jurisdictionPack: Bytes<32>,
  approvedBy: Bytes<256>,
  currentTime: Uint<64>
): [] {
  assert(!templates.member(disclose(templateHash)), "Template exists");
  
  const template = Template {
    templateHash: templateHash,
    templateContent: templateContent,
    jurisdictionPack: jurisdictionPack,
    approvedBy: approvedBy,
    approvedAt: currentTime
  };
  
  templates.insert(disclose(templateHash), disclose(template));
}

export circuit recordConsent(
  caller: ContractAddress,
  userDID: Bytes<32>,
  dataDomain: Bytes<32>,
  purpose: Bytes<256>,
  disclosedAttributes: Bytes<256>,
  duration: Uint<64>,
  currentTime: Uint<64>
): Bytes<32> {
  const consentId = hashConsent(userDID, dataDomain, currentTime);
  
  const consent = Consent {
    consentId: consentId,
    userDID: userDID,
    dataDomain: dataDomain,
    purpose: purpose,
    disclosedAttributes: disclosedAttributes,
    grantedAt: currentTime,
    expiresAt: currentTime + duration,
    revoked: false
  };
  
  consents.insert(disclose(consentId), disclose(consent));
  
  return disclose(consentId);
}
```

#### NotiZ Contract

```compact
// contracts/NotiZ.compact
pragma language_version >= 0.17.0;
import CompactStandardLibrary;

ledger eligibilityRoots: Map<Bytes<32>, EligibilityRoot>;
ledger messages: Map<Bytes<32>, Message>;
ledger inboxes: Map<Bytes<32>, Inbox>;

struct EligibilityRoot {
  trialId: Bytes<32>;
  merkleRoot: Bytes<32>;
  templateHash: Bytes<32>;
  count: Uint<64>;
  publishedAt: Uint<64>;
}

struct Message {
  messageId: Bytes<32>;
  recipient: Bytes<32>;  // Patient DIDz (anonymous)
  templateHash: Bytes<32>;
  dataCommitments: Bytes<256>;
  proofOfConformance: Bytes<256>;
  sentAt: Uint<64>;
  expiresAt: Uint<64>;
  viewed: Boolean;
  responded: Boolean;
}

export circuit publishEligibilityRoot(
  caller: ContractAddress,
  trialId: Bytes<32>,
  merkleRoot: Bytes<32>,
  templateHash: Bytes<32>,
  count: Uint<64>,
  currentTime: Uint<64>
): [] {
  const root = EligibilityRoot {
    trialId: trialId,
    merkleRoot: merkleRoot,
    templateHash: templateHash,
    count: count,
    publishedAt: currentTime
  };
  
  eligibilityRoots.insert(disclose(trialId), disclose(root));
}

export circuit sendMessage(
  caller: ContractAddress,
  recipient: Bytes<32>,
  templateHash: Bytes<32>,
  dataCommitments: Bytes<256>,
  proofOfConformance: Bytes<256>,
  ttl: Uint<64>,
  currentTime: Uint<64>
): Bytes<32> {
  // Verify template exists in PolicyZ
  // (Cross-contract call would go here)
  
  const messageId = hashMessage(recipient, templateHash, currentTime);
  
  const message = Message {
    messageId: messageId,
    recipient: recipient,
    templateHash: templateHash,
    dataCommitments: dataCommitments,
    proofOfConformance: proofOfConformance,
    sentAt: currentTime,
    expiresAt: currentTime + ttl,
    viewed: false,
    responded: false
  };
  
  messages.insert(disclose(messageId), disclose(message));
  
  // Add to recipient's inbox
  if (!inboxes.member(disclose(recipient))) {
    createInbox(recipient);
  }
  
  return disclose(messageId);
}
```

---

## Data Flow Example

### Complete Clinical Trial Recruitment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Eligibility Computation (OFF-CHAIN, HIPAA-Protected)  │
└─────────────────────────────────────────────────────────────────┘

EHR System:
  SELECT patient_id, dob, diagnosis, medications, age
  FROM patients
  WHERE age BETWEEN 40 AND 60
    AND diagnosis = 'Sleep Apnea'
    AND medications NOT IN (excluded_list)

Result: 247 eligible patients

For each patient:
  commitment = hash(patient_id || dob || SALT)
  
Merkle Tree: Build tree from 247 commitments
  root = 0x4a7b2f...

┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Template Registration (ON-CHAIN, PolicyZ)             │
└─────────────────────────────────────────────────────────────────┘

IRB Approval:
  Message: "You may be eligible for a sleep apnea clinical trial (NCT12345). 
            This study involves a new CPAP device. Respond to learn more."
  
  IRB Signature: 0x8f3c4d...
  
PolicyZ.registerTemplate(
  templateHash: 0x2b5e8f...,
  templateContent: <message above>,
  jurisdictionPack: HIPAA_COMPLIANT,
  approvedBy: 0x8f3c4d...
)

┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Publish Eligibility Root (ON-CHAIN, NotiZ)            │
└─────────────────────────────────────────────────────────────────┘

NotiZ.publishEligibilityRoot(
  trialId: "NCT12345",
  merkleRoot: 0x4a7b2f...,
  templateHash: 0x2b5e8f...,
  count: 247  // Only count, no patient IDs
)

┌─────────────────────────────────────────────────────────────────┐
│ Phase 4: Send Notifications (247 messages, ANONYMOUS)          │
└─────────────────────────────────────────────────────────────────┘

For each of 247 patients:
  NotiZ.sendMessage(
    recipient: patient.didz,  // e.g., did:dz:midnight:patient:anonymous_7a4f
    templateHash: 0x2b5e8f...,
    dataCommitments: {
      trialId: hash("NCT12345"),
      eligibilityProof: patient.merkleProof,
      contactEncrypted: encrypt("Dr. Smith, 555-1234", patient.publicKey)
    },
    proofOfConformance: <ZK proof message matches template>,
    ttl: 30 days
  )

Result: 247 messages in 247 anonymous inboxes

┌─────────────────────────────────────────────────────────────────┐
│ Phase 5: Patient Responses (OPT-IN or IGNORE)                  │
└─────────────────────────────────────────────────────────────────┘

Patient A (Interested):
  1. Views message in inbox (viewed = true)
  2. Clicks "Learn More"
  3. Proves eligibility: Merkle proof verification
  4. Selectively discloses: [age, diagnosis]
     DOES NOT disclose: [medications, medical history, SSN]
  5. VCz.presentCredential(selectiveDisclosure)
  6. PolicyZ.recordConsent(trialId, selectiveDisclosure)
  7. Identity revealed to clinic: "Patient ID 12345 consented"

Patient B (Not Interested):
  - Ignores message
  - Message expires after 30 days
  - Patient stays anonymous
  - No trace of patient identity

┌─────────────────────────────────────────────────────────────────┐
│ Phase 6: Audit Report (FOR IRB)                                │
└─────────────────────────────────────────────────────────────────┘

NightAgent.generateAuditReport("NCT12345")

Returns:
  {
    trialId: "NCT12345",
    notificationsSent: 247,
    patientsConsented: 73,  // 29.5% conversion rate!
    conversionRate: 29.5,
    templateUsed: 0x2b5e8f...,
    irbApproval: 0x8f3c4d...,
    privacyCompliance: "HIPAA-compliant",
    proofs: {
      merkleRoot: 0x4a7b2f...,
      templateConformance: <ZK proofs>,
      immutableLedger: "Midnight blockchain"
    }
  }

IRB can verify:
  ✓ All 247 messages used approved template
  ✓ All 73 consents have valid proofs
  ✓ No PHI exposed before patient consent
  ✓ Audit trail is immutable
```

---

## Implementation Checklist

### NightAgent MCP Server

- [ ] Install DIDz SDK: `npm install @didz/contracts @didz/client`
- [ ] Implement MCP tools (4 functions above)
- [ ] Add Merkle tree utilities
- [ ] Add encryption/decryption helpers
- [ ] Test with mock EHR data
- [ ] TTS integration for accessibility

### DIDz Contracts

- [ ] PolicyZ.compact - Template registry + consent ledger
- [ ] NotiZ.compact - Messaging + eligibility roots
- [ ] Update VCz.compact - Selective disclosure for healthcare
- [ ] Update AuditZ.compact - IRB reporting format

### Infrastructure

- [ ] Deploy contracts to Midnight testnet
- [ ] Set up NightAgent → Midnight RPC connection
- [ ] Configure HIPAA-compliant logging (no PHI in logs)
- [ ] Set up monitoring (privacy-safe telemetry)

### Testing

- [ ] Unit tests for each MCP tool
- [ ] Integration test: End-to-end recruitment flow
- [ ] Privacy test: Verify no PHI leaks
- [ ] Audit test: Generate IRB report

---

## Timeline

**Phase 1 (Nov 2025)**: Hackathon MVP with mocks  
**Phase 2 (Dec 2025 - Feb 2026)**: PolicyZ + NotiZ implementation  
**Phase 3 (Mar 2026)**: Production pilot with real clinic

---

**Last Updated**: October 29, 2025  
**Status**: Architecture complete, ready for implementation  
**Next Step**: Build PolicyZ v0.1 + NotiZ v0.1
