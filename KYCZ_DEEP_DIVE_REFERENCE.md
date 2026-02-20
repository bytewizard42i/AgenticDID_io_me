# 🧠 KYCz Deep Dive Reference

**Date**: February 20, 2026  
**Full Docs**: [KYCz Repo](https://github.com/bytewizard42i/KYCz_us_app/tree/main/docs)

## Key Updates from Alice 🌟

- **Dual binding**: Biometric (human ↔ proof) + Cryptographic (device key ↔ proof)
- **Private Identity Anchor**: All KYC data + biometric commitment + device key in Midnight private state
- **3-step protocol**: Enrollment → Issuance → Presentation
- **Pairwise keys**: `pk_v = HKDF(master, verifier_domain)` — no cross-site tracking
- **Assurance levels**: A (dual binding), B (key + step-up), C (key only)
- **Assertion schema**: Predicate catalog (`kyc_passed`, `age_gte(N)`, `sanctions_clear`, etc.)
- **Threat model**: Replay, deepfake, stolen device, credential rental, sybil — all addressed

→ [Full Deep Dive](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BINDING_MODEL_DEEP_DIVE.md)  
→ [Assertion Schema](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_ASSERTION_SCHEMA.md)

*Alice 🌟 + Penny 🎀 + John*
