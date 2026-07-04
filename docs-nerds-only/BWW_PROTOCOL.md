# BWW Protocol Specification
## Blind Wealth Witness - Privacy-Preserving Accredited Investor Verification

> *"Proving qualification without revealing quantification."*

---

## Overview

The **BWW (Blind Wealth Witness) Protocol** is a zero-knowledge attestation framework for verifying accredited investor status without exposing underlying financial data. Built on the Midnight Network, BWW enables compliant access to private securities, VC deals, and regulated investment opportunities while maintaining complete privacy of personal financial information.

This protocol implements **Tier 4** of the AgenticDID progressive trust system.

---

## The Problem

Current accredited investor verification requires exposing sensitive data:
- Tax returns (income verification)
- Bank statements (net worth verification)
- Brokerage statements (asset verification)
- CPA/attorney letters (third-party attestation)

This creates:
- **Privacy risks** - Documents shared with multiple parties
- **Honeypot vulnerabilities** - Centralized storage of wealth data
- **Friction** - Manual verification for each investment opportunity
- **Exclusion** - High barriers discourage legitimate investors

---

## The BWW Solution

Zero-knowledge proofs that attest to qualification thresholds without revealing actual values:

```
Traditional:  "My income is $247,832/year" → Verify → Access
BWW:          "My income exceeds $200,000" → ZK Proof → Access
              (Actual amount never revealed)
```

### What BWW Proves (Revealed)
- ✅ Income OR net worth exceeds SEC thresholds
- ✅ Credential issued by licensed verifier
- ✅ Attestation is current and not revoked
- ✅ Holder controls the credential

### What BWW Hides (Private)
- 🔒 Exact income amount
- 🔒 Exact net worth
- 🔒 Asset breakdown
- 🔒 Bank/brokerage identities
- 🔒 Tax return details

---

## SEC Accredited Investor Thresholds

| Qualification Path | Threshold | BWW Proof |
|-------------------|-----------|-----------|
| Income (Individual) | $200,000+ for 2 years | `income_exceeds_200k_individual` |
| Income (Joint) | $300,000+ for 2 years | `income_exceeds_300k_joint` |
| Net Worth | $1,000,000+ (excl. primary residence) | `net_worth_exceeds_1m` |
| Professional | Licensed Series 7, 65, or 82 | `holds_professional_license` |
| Entity | $5,000,000+ in assets | `entity_assets_exceed_5m` |

---

## Technical Architecture

### Credential Issuance Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Investor   │────▶│  Trusted Issuer │────▶│ Midnight Network │
│  (User DIDz) │     │  (CPA/Attorney) │     │  (ZK Registry)   │
└──────────────┘     └─────────────────┘     └──────────────────┘
       │                      │                       │
       │ 1. Submit docs       │                       │
       │    (off-chain)       │                       │
       │◀─────────────────────│                       │
       │                      │                       │
       │ 2. Verify & attest   │                       │
       │    (ZK commitment)   │                       │
       │                      │──────────────────────▶│
       │                      │ 3. Issue credential   │
       │                      │    (on-chain)         │
       │◀─────────────────────────────────────────────│
       │ 4. Receive BWW       │                       │
       │    credential        │                       │
```

### Verification Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Investor   │────▶│  Investment     │────▶│ Midnight Network │
│  (via Comet) │     │  Platform (RA)  │     │  (ZK Verify)     │
└──────────────┘     └─────────────────┘     └──────────────────┘
       │                      │                       │
       │ 1. Request access    │                       │
       │    to private deal   │                       │
       │◀─────────────────────│                       │
       │ 2. Challenge issued  │                       │
       │                      │                       │
       │ 3. Present BWW proof │                       │
       │    (ZK attestation)  │──────────────────────▶│
       │                      │ 4. Verify on-chain    │
       │                      │◀──────────────────────│
       │◀─────────────────────│ 5. Access granted     │
       │ 6. Invest in deal    │    (no data exposed)  │
```

---

## Compact Contract Interface

```typescript
pragma language_version >= 0.18.0;

export contract BWWProtocol {
  // Credential types for accredited investor verification
  ledger bwwCredentials: Map<Bytes<32>, BWWCredential>;
  ledger trustedVerifiers: Set<Bytes<32>>;
  
  witness bwwProof: BWWProofData;
  
  // Issue BWW credential (Trusted Issuer only)
  export circuit issueBWWCredential(
    holderDID: Bytes<32>,
    qualificationType: Field,  // 1=income, 2=net_worth, 3=professional, 4=entity
    expirationTimestamp: Field
  ): Bytes<32> {
    // Verify caller is trusted issuer
    assert trustedVerifiers.member(context.caller);
    
    // Generate credential ID
    let credentialId = hash(holderDID, qualificationType, block.timestamp);
    
    // Store credential commitment (not the actual values)
    bwwCredentials.insert(credentialId, BWWCredential {
      holder: holderDID,
      qualificationType: qualificationType,
      issuedAt: block.timestamp,
      expiresAt: expirationTimestamp,
      revoked: false
    });
    
    return credentialId;
  }
  
  // Verify BWW credential with ZK proof
  export circuit verifyAccreditedStatus(
    credentialId: Bytes<32>,
    challenge: Bytes<32>
  ): Bool {
    let cred = bwwCredentials.lookup(credentialId);
    
    // Verify credential is valid
    assert !cred.revoked;
    assert cred.expiresAt > block.timestamp;
    
    // Verify ZK proof of qualification (details hidden)
    assert verifyProof(bwwProof, challenge, cred.holder);
    
    return true;
  }
  
  // Revoke credential (issuer or holder)
  export circuit revokeBWWCredential(
    credentialId: Bytes<32>
  ): Void {
    let cred = bwwCredentials.lookup(credentialId);
    
    // Only issuer or holder can revoke
    assert context.caller == cred.issuer || context.caller == cred.holder;
    
    bwwCredentials.insert(credentialId, BWWCredential {
      ...cred,
      revoked: true
    });
  }
}
```

---

## Integration with AgenticDID

BWW is accessed through the AgenticDID tier system:

| Tier | Name | BWW Access |
|------|------|------------|
| 0 | Anonymous | ❌ None |
| 1 | Email Verified | ❌ None |
| 2 | Government ID | ❌ None |
| 3 | Full KYC/AML | ❌ None |
| **4** | **Accredited Investor** | ✅ **BWW Protocol** |

### Agent Authorization for BWW

```typescript
// User authorizes Comet to use BWW credential
{
  "delegation": {
    "from": "did:agentic:user:john123z",
    "to": "did:agentic:agent:comet",
    "permissions": ["bww:present", "bww:verify"],
    "constraints": {
      "max_investments_per_day": 3,
      "max_investment_amount": 100000,
      "allowed_platforms": ["republic.co", "angellist.com"]
    }
  }
}
```

---

## Compliance Considerations

### SEC Rule 506(c) Compatibility
BWW is designed to satisfy "reasonable steps to verify" requirements:
- Credential issued by licensed professional (CPA, attorney, broker-dealer)
- Verification performed within required timeframe
- Cryptographic proof of verification audit trail
- Revocation capability for changed circumstances

### GDPR/Privacy Compliance
- No personal financial data stored on-chain
- User controls credential presentation
- Right to revocation honored
- Data minimization by design

---

## Roadmap

| Phase | Milestone | Target |
|-------|-----------|--------|
| 1 | Protocol specification | ✅ Complete |
| 2 | Compact contract implementation | Q1 2026 |
| 3 | Trusted Issuer onboarding | Q2 2026 |
| 4 | Platform integrations | Q3 2026 |
| 5 | Production launch | Q4 2026 |

---

## Why "Blind Wealth Witness"?

The name captures the three core principles:

- **Blind**: The verifier never sees the underlying financial data - it remains cryptographically hidden through zero-knowledge proofs

- **Wealth**: The protocol specifically addresses wealth-based qualifications for accredited investor status under SEC regulations

- **Witness**: The credential serves as a cryptographic witness - an attestation that qualification was verified by a trusted party

> *Some said zero-knowledge proofs would never be used for accredited investor verification. This protocol proves otherwise.*

---

## References

- [SEC Rule 501 - Accredited Investor Definition](https://www.sec.gov/education/capitalraising/building-blocks/accredited-investor)
- [Midnight Network Documentation](https://docs.midnight.network/)
- [AgenticDID Protocol Specification](./DID_AND_KYC_ARCHITECTURE.md)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

---

*BWW Protocol - Part of the AgenticDID.io Identity Layer*

**Built with 🔮 by the AgenticDID Team**
