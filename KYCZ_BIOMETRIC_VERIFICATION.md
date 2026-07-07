# 🧬 KYCz, Zero-Knowledge KYC with Biometric Liveness

**The Human Identity Verification Layer for AgenticDID**

**Date**: February 20, 2026  
**Related**: [KYCz App Repo](https://github.com/bytewizard42i/KYCz_us_app) | [AgenticDID MAIN](https://github.com/bytewizard42i/AgenticDID_io_me_MAIN) | [DIDz DApp System](https://github.com/bytewizard42i/didz-dapp-system)

---

## What Is KYCz?

**KYC + zkProofs = KYCz**, Privacy-preserving identity verification powered by the Midnight blockchain.

KYCz takes traditional Know Your Customer (KYC) data, stores it in Midnight's **private state**, and uses **zero-knowledge proofs** to make assertions about that data, **without ever revealing the underlying information**.

Identity is verified through **multi-factor biometric liveness detection**, ensuring a real human is behind every verification, not a deepfake, bot, or synthetic identity.

---

## How KYCz Fits into AgenticDID

AgenticDID enables AI agents to have verifiable digital identities. KYCz is the **human verification backbone**:

1. **Verifies the human** behind an agent via 8-factor biometric liveness
2. **Stores KYC data** in Midnight's private state (not a centralized DB)
3. **Issues zk-proofs** that the agent can carry as verifiable credentials
4. **Enables re-verification**, biometrics confirm the same human returns

```
Human → KYCz Biometric Liveness → Midnight Private State → zk-Proof Credentials → Agent Identity
```

---

## 8-Factor Weighted Liveness Score

| Factor | Weight | Technique |
|--------|--------|----------|
| **3D Parallax** | 17% | Depth variation detection, defeats flat screen/photo spoofs |
| **Eye Blink Rate** | 15% | Eye Aspect Ratio (EAR) via 68-point facial landmarks |
| **Face Micro-Movements** | 15% | Involuntary movement signatures, frame-to-frame landmark drift |
| **Face Movement Challenge** | 15% | Random head-turn/nod/blink-on-command prompts |
| **BPM Detection** | 10% | Remote photoplethysmography (rPPG) from skin color changes |
| **Signal Quality** | 10% | rPPG signal reliability monitoring |
| **Prominence** | 10% | Frequency peak strength in cardiac signal |
| **Consistency** | 8% | BPM stability across time windows |

**Behavioral factors** (blink, parallax, micro-movement, challenge) = **62%** of score.

### Additional Layers
- **Voice/Speech Liveness**, 5 random words + lip-sync cross-validation
- **Document OCR**, ID/passport/license scanning with AI validation
- **Chat Cross-Reference**, AI chatbot verifies document data against live responses

---

## KYCz vs Other Approaches

| Traditional KYC | BlockSign-style | **KYCz (Ours)** |
|-----------------|-----------------|------------------|
| Centralized DBs | Zero storage / ephemeral | Midnight private state |
| Honeypot for hackers | Can't prove later | zk-proofs for ongoing assertions |
| Full data exposed | Privacy-first but one-shot | Privacy-preserving AND provable |
| Re-verify each time | Must redo flow | Biometric re-check confirms same person |

---

## Zero-Knowledge Proof Assertions

| Assertion | Proves | Hides |
|-----------|--------|-------|
| "Is this person over 18?" | Yes/No | Date of birth |
| "Has this person passed KYC?" | Yes/No | All PII |
| "Is this the same person?" | Yes/No | Biometric data |
| "Is their ID valid?" | Yes/No | Document details |
| "Meets income threshold?" | Yes/No | Exact income |

---

## 5-Step KYCz Workflow

1. **System Check**, Camera, video quality, face detection, lighting, FPS
2. **ID Document Scan**, Front/back capture, OCR, AI field validation
3. **Biometric Liveness**, All 8 factors + voice/speech simultaneously
4. **Chat Verification**, Cross-reference document data with live responses
5. **Midnight Commitment**, KYC data → private state, credential issued

---

## References

- [KYCz App Repo](https://github.com/bytewizard42i/KYCz_us_app)
- [BlockSign Verify Reference PDF](https://github.com/bytewizard42i/KYCz_us_app/tree/main/docs)
- [AgenticDID MAIN](https://github.com/bytewizard42i/AgenticDID_io_me_MAIN)
- [DIDz DApp System](https://github.com/bytewizard42i/didz-dapp-system)
- [Midnight Docs](https://docs.midnight.network)

---

**Status**: 🚧 Early concept phase  
**Last Updated**: February 20, 2026  
**Author**: John (bytewizard42i)
