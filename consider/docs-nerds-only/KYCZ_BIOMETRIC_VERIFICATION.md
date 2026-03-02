# 🧬 KYCz — Zero-Knowledge KYC with Biometric Liveness

**The Human Identity Verification Layer for the AgenticDID Ecosystem**

**Date**: February 20, 2026  
**Related**: [KYCz App Repo](https://github.com/bytewizard42i/KYCz_us_app) | [DIDz DApp System](https://github.com/bytewizard42i/didz-dapp-system) | [PP DIDz Ecosystem Vision](https://github.com/bytewizard42i/didz-dapp-system/blob/main/docs/PP_DIDZ_ECOSYSTEM_VISION.md)

---

## What Is KYCz?

**KYC + zkProofs = KYCz** — Privacy-preserving identity verification powered by the Midnight blockchain.

KYCz takes traditional Know Your Customer (KYC) data, stores it in Midnight's **private state**, and uses **zero-knowledge proofs** to make assertions about that data — **without ever revealing the underlying information**.

Identity is verified through **multi-factor biometric liveness detection**, ensuring a real human is behind every verification — not a deepfake, bot, or synthetic identity.

---

## How KYCz Fits into AgenticDID

AgenticDID enables AI agents to have verifiable digital identities. But agents act on behalf of **humans** — and those humans need to be verified first. KYCz is the **human verification backbone** that:

1. **Verifies the human** behind an agent via 8-factor biometric liveness
2. **Stores KYC data** in Midnight's private state (not a centralized DB)
3. **Issues zk-proofs** that the agent can carry as verifiable credentials
4. **Enables re-verification** — biometrics confirm the same human returns

```
┌──────────────────┐     ┌────────────────────┐     ┌──────────────────────┐
│  KYCz Biometric   │────▶│  KYC Data → Midnight │────▶│  AgenticDID          │
│  Liveness Check   │     │  Private State       │     │  Credential Issuance │
└──────────────────┘     └────────────────────┘     └──────────────────────┘
         │                                                      │
         │                                                      ▼
         │                                          ┌──────────────────────┐
         │                                          │  Agent carries        │
         │                                          │  zk-Proof credentials │
         └──────────────────────────────────────────│  (Verifiers get       │
                                                    │   Yes/No, not data)   │
                                                    └──────────────────────┘
```

### Mapping to AgenticDID / DIDz Components

| Component | KYCz Role |
|-----------|----------|
| **KYC Oracles** | KYCz IS the KYC oracle — biometric verification + zk-proof storage |
| **Trust Triangle — Trusted Issuers** | KYCz verifies the human, then feeds into credential issuance |
| **Biometric proof without data exposure** | KYCz's 8-factor liveness detection provides this |
| **Progressive Disclosure** | KYCz private state enables selective reveal over time |
| **Credential Issuance** | KYCz-verified data becomes the source for DIDz credentials |
| **Agent Authorization** | Agents inherit verified human identity via zk-proof chain |

---

## Biometric Liveness Detection Approach

Gleaned from the BlockSign Verify reference deck ([PDF in KYCz repo](https://github.com/bytewizard42i/KYCz_us_app/tree/main/docs)), adapted for our Midnight-based architecture.

### 8-Factor Weighted Liveness Score

| Factor | Weight | Technique |
|--------|--------|----------|
| **3D Parallax** | 17% | Depth variation detection — defeats flat screen/photo spoofs |
| **Eye Blink Rate** | 15% | Eye Aspect Ratio (EAR) via 68-point facial landmarks |
| **Face Micro-Movements** | 15% | Involuntary movement signatures, frame-to-frame landmark drift |
| **Face Movement Challenge** | 15% | Random head-turn/nod/blink-on-command prompts |
| **BPM Detection** | 10% | Remote photoplethysmography (rPPG) from skin color changes |
| **Signal Quality** | 10% | rPPG signal reliability monitoring |
| **Prominence** | 10% | Frequency peak strength in cardiac signal |
| **Consistency** | 8% | BPM stability across time windows |

**Behavioral factors** (blink, parallax, micro-movement, challenge) account for **62%** of the total score — making spoofing extremely difficult.

### Voice & Speech Liveness (Additional Layer)

- 5 random words displayed in sequence, must be spoken in order
- Real-time speech recognition via Web Speech API
- Audio volume monitoring with visual feedback
- Cross-validation with lip movement on video feed
- Defeats pre-recorded audio, memorized scripts, and synthetic audio playback

### Document Verification

- ID card, passport, driver license scanning (front/back)
- OCR extraction via Tesseract / AI
- Auto-detection of document type
- Cross-referencing extracted data with live chatbot responses

---

## KYCz vs Other Approaches

| Traditional KYC | BlockSign-style (Privacy-first) | **KYCz (Ours)** |
|-----------------|-------------------------------|------------------|
| Data stored in centralized DBs | Zero storage — ephemeral only | Data in Midnight private state |
| Honeypot for hackers | Can't prove anything later | zk-proofs for ongoing assertions |
| Full data exposed to verifiers | Privacy-preserving but one-shot | Privacy-preserving AND provable |
| Regulatory burden on data holders | Limited audit trail | On-chain audit trail, no data exposure |
| Re-verification required each time | Must re-do entire flow | Biometric re-check confirms same person |

### The KYCz Differentiator

BlockSign's approach is **privacy-first but ephemeral** — they verify and discard everything. They can't prove anything after the fact.

KYCz stores verified KYC data in Midnight's **private (shielded) state**, enabling:
- **Ongoing zk-proof assertions** without re-exposing data
- **Selective disclosure** aligned with DIDz progressive disclosure model
- **Biometric re-verification** to confirm the same human returns
- **Audit trail** without data exposure

---

## Zero-Knowledge Proof Assertions

Example assertions KYCz can make via Midnight Compact contracts:

| Assertion | Proves | Hides |
|-----------|--------|-------|
| "Is this person over 18?" | Yes/No | Date of birth |
| "Is this person a resident of [country]?" | Yes/No | Full address |
| "Has this person passed KYC?" | Yes/No | All PII |
| "Is this the same person who originally verified?" | Yes/No | Biometric data |
| "Is this person's ID document valid?" | Yes/No | Document details |
| "Does this person meet income threshold?" | Yes/No | Exact income |

---

## The Verification Flow

### 5-Step KYCz Workflow

1. **System Check** — Camera access, video quality, face detection, lighting, FPS validation
2. **ID Document Scan** — Front/back capture, OCR extraction, AI field validation
3. **Biometric Liveness Detection** — All 8 factors + voice/speech run simultaneously
4. **Chat Verification** — AI chatbot cross-references document data with live responses
5. **Midnight Commitment** — Verified KYC data committed to Midnight private state, credential issued

### Re-Verification (Returning Users)

```
Returning User → Biometric Liveness Check → Match against stored proof → Assertion issued
```

No need to re-submit documents. Biometrics confirm it's the same person.

---

## Tech Stack (Planned)

- **Blockchain**: Midnight Network (private state + zk-proofs)
- **Smart Contracts**: Compact (Midnight's contract language)
- **Biometrics**: face-api.js (68-point landmarks), Web Speech API, rPPG analysis
- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + WebSocket
- **Architecture**: Ephemeral session data, WebSocket streaming, no biometric storage

---

## References

- **BlockSign Verify pitch deck** — [PDF in KYCz repo docs](https://github.com/bytewizard42i/KYCz_us_app/tree/main/docs)
- **KYCz App Repo** — [bytewizard42i/KYCz_us_app](https://github.com/bytewizard42i/KYCz_us_app)
- **DIDz DApp System** — [bytewizard42i/didz-dapp-system](https://github.com/bytewizard42i/didz-dapp-system)
- **Fi Standards** — [docs-nerds-only/Fi_Standards](https://github.com/bytewizard42i/AgenticDID_io_me_MAIN/tree/main/docs-nerds-only/Fi%20_Standards-AKA-FIST)
- **Midnight Documentation** — [docs.midnight.network](https://docs.midnight.network)

---

**Status**: 🚧 Early concept phase — Architecture and biometric approach being defined.

**Last Updated**: February 20, 2026  
**Author**: John (bytewizard42i)
