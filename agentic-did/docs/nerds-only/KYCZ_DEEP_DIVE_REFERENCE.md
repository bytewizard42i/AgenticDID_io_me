# 🧠 KYCz Deep Dive Reference, Dual Binding Model & Assertion Schema

**Date**: February 20, 2026  
**Contributors**: Alice 🌟 (The Architect) + Penny 🎀 + John  
**Full Docs**: [KYCz Repo](https://github.com/bytewizard42i/KYCz_us_app/tree/main/docs)

---

## What's New

Alice contributed a major architecture upgrade, the **dual binding model** (biometric + cryptographic).

### The Two Bindings

| Binding | Proves | When Used |
|---------|--------|-----------|
| **Biometric** (human ↔ proof) | Same face/body as original KYC subject | Enrollment + re-checks + step-up |
| **Cryptographic** (device ↔ proof) | Controller of this key = KYC subject | Day-to-day transactions |

### How This Connects to AgenticDID

The agent identity chain requires an unbroken trust path:

```
Human → Biometric + Key Binding → KYCz Anchor → zk-Proof → Agent Credential
```

With the dual binding model:
- **Key binding** lets agents transact quickly on behalf of the human (fast path)
- **Biometric step-up** provides highest assurance when agents need elevated permissions
- **Pairwise keys** (`pk_v = HKDF(master, verifier_domain)`) prevent agents from being tracked across services
- **Assurance levels** (A/B/C) let different agent actions require different verification strength

### Private Identity Anchor → Agent Credentials

```
KYCz Anchor (Midnight private state)
  ├── Human's biometric commitment
  ├── Human's device key commitment
  ├── KYC attributes (private)
  │
  └──→ Agent derives scoped credentials via ZK
       ├── Per-service pairwise key (anti-correlation)
       ├── Assertion: "human behind this agent passed KYC-B"
       └── Revocable if human revokes agent authorization
```

### Assurance Levels for Agent Actions
| Agent Action | Required Level | Binding |
|-------------|---------------|----------|
| Read-only queries | C | Key |
| Standard transactions | B | Key |
| High-value transactions | A | Key + biometric step-up |
| Agent permission changes | A | Dual (key + live liveness) |

---

### Full Architecture Docs
- [🧠 Binding Model Deep Dive](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BINDING_MODEL_DEEP_DIVE.md)
- [📋 Assertion Schema](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_ASSERTION_SCHEMA.md)
- [🔗 Binding Stack](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BINDING_STACK.md)
- [🫀 Biometric Verification](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BIOMETRIC_VERIFICATION.md)

*Alice 🌟 + Penny 🎀 + John (bytewizard42i)*
