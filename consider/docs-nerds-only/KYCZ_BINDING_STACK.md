# 🔗 KYCz Binding Stack — Proving KYC Ownership Without DID

**How do we prove that KYC data in Midnight's private state belongs to the person claiming it?**

**Date**: February 20, 2026  
**Related**: [KYCz App Repo](https://github.com/bytewizard42i/KYCz_us_app) | [Full Binding Stack Doc](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BINDING_STACK.md) | [KYCz Biometric Verification](./KYCZ_BIOMETRIC_VERIFICATION.md)

---

## The Binding Problem

Three things must be **bound together**:
1. **A real human** (proved by biometric liveness)
2. **KYC data** (stored in Midnight private state)
3. **Proof that #2 belongs to #1** ← THE GAP

## How It Connects to AgenticDID

Agents act on behalf of humans. The identity chain must be unbroken:

```
Human → DL Barcode + Face Match → BINDING → Midnight Private State → zk-Proof → Agent Credential
```

If the human can't prove the KYC is theirs, the agent's credentials are meaningless. The Binding Stack solves this.

---

## The KYCz Binding Stack (6 Layers)

```
┌─────────────────────────────────────────────────────────┐
│                   KYCz BINDING STACK                     │
├─────────────────────────────────────────────────────────┤
│  Layer 1: DOCUMENT POSSESSION                           │
│  ├── Scan DL barcode (PDF417) → structured KYC data     │
│  └── OR Passport NFC chip → cryptographically signed    │
│                                                         │
│  Layer 2: PHOTO-TO-FACE BINDING                         │
│  ├── Extract photo from front of DL / passport          │
│  └── Face match against live person (face-api.js)       │
│                                                         │
│  Layer 3: BIOMETRIC LIVENESS (8-factor)                 │
│  ├── Proves a real human is present NOW                 │
│  └── Not a photo, deepfake, or replay                   │
│                                                         │
│  Layer 4: OPTIONAL REINFORCEMENT                        │
│  ├── Bank account binding (Plaid)                       │
│  ├── Phone carrier verification                         │
│  └── KBA challenge questions                            │
│                                                         │
│  Layer 5: MIDNIGHT COMMITMENT                           │
│  ├── All verified data → private state                  │
│  ├── Face embedding hash → private state (for re-match) │
│  └── Binding proof → on-chain                           │
│                                                         │
│  Layer 6: RE-VERIFICATION                               │
│  ├── Returning user → biometric liveness                │
│  └── Face match against stored hash → same person       │
└─────────────────────────────────────────────────────────┘
```

---

## Binding Options (3 Tiers)

### 🏆 Tier 1 — Strongest, Minimal Barriers
| Option | Method | Trusted Issuer |
|--------|--------|----------------|
| **A: DL Barcode + Face Match** ⭐ | PDF417 scan + face-api.js comparison | DMV (via physical document) |
| **B: Passport NFC Chip** | Cryptographically signed data from chip | Issuing government (ICAO PKD) |
| **C: Bank Account (Plaid)** | Micro-deposit verification + name match | Bank (existing KYC) |

### 🥈 Tier 2 — Good, Some Friction
| Option | Method | Trusted Issuer |
|--------|--------|----------------|
| **D: Phone Carrier** | SIM verification APIs | Telecom carrier |
| **E: Credit Bureau KBA** | Challenge questions | Experian/Equifax/TransUnion |
| **F: IRS Transcript** | Income verification API | IRS (government) |

### 🥉 Tier 3 — Creative, Niche
| Option | Method | Trusted Issuer |
|--------|--------|----------------|
| **G: Notary Hash** | In-person notarized attestation | Notary public |
| **H: Multi-Source Convergence** | 5+ weak signals combined | Statistical convergence |

---

## The Recommended Flow

```
Scan DL back (PDF417) → Extract KYC data
        │
Scan DL front → Extract photo
        │
8-factor biometric liveness → Prove human
        │
Face match (DL photo vs live) → BINDING
        │
All data → Midnight private state
        │
zk-proofs → Agent carries verified credentials
```

---

## Why No DID Needed

| Component | Role |
|-----------|------|
| **DL barcode** | Trusted issuer attestation (DMV) |
| **Face match** | Binding (your face = government doc face) |
| **Biometric liveness** | Proof of human |
| **Midnight private state** | Privacy layer |
| **zk-proofs** | Agent credentials + ongoing provability |

---

For full technical details, see [complete Binding Stack doc in KYCz repo](https://github.com/bytewizard42i/KYCz_us_app/blob/main/docs/KYCZ_BINDING_STACK.md).

**Author**: John (bytewizard42i) + Penny 🎀  
**Last Updated**: February 20, 2026
