# FORMAL_SPECS_W3C_DIF — AgenticDID

This folder is the standard formal-specification package for this project
(the house convention for every original concept: spec + letters +
submission instructions, all in a folder named `FORMAL_SPECS_W3C_DIF`).
It contains the formal specification for **AgenticDID: Privacy-Preserving
Delegated Authority for Autonomous Agents**.

| File | What it is |
|---|---|
| [`AGENTICDID_SPEC.md`](AGENTICDID_SPEC.md) | The specification. RFC 2119 normative text; the ZK delegated-authority profile of the agentic identity stack. |
| [`letters/LETTER_W3C.md`](letters/LETTER_W3C.md) | Introduction letter to the W3C Credentials Community Group. |
| [`letters/LETTER_DIF.md`](letters/LETTER_DIF.md) | Introduction letter to the DIF Trusted AI Agents Working Group (the primary target venue). |
| [`SUBMISSION_INSTRUCTIONS.md`](SUBMISSION_INSTRUCTIONS.md) | Provenance + submission playbook (procedures verified against w3.org / identity.foundation July 27, 2026). |

## How AgenticDID relates to the DIDz Protocol

AgenticDID is the **authority pillar** of the DIDz Protocol
(`didz-kernel/FORMAL_SPECS_W3C_DIF/didz-protocol-v0.1.md`). The kernel
spec defines the five-seam model (identity, authority, objects, data,
enforcement); this spec defines the authority seam in normative depth:
scoped grants, attenuation-only delegation, cascade revocation, and
one-bit zero-knowledge proofs of authority.

**Submit the two together** as one coherent stack. DIF should see: DIDz
Protocol (the trust kernel) + AgenticDID (the ZK delegation profile).

## Evidence status

The normative reference implementation is
`midnight-modules/modules/scoped-grant/` (Compact, compiles clean with
full ZK key generation — `REALDEAL_TEST` on preprod is the next gate).
A deterministic demoLand walkthrough lives in
`../demo-proof-of-authority/` (`MOCK`).

## Rules for editing

1. The spec targets DIF KYA-OS conformance vocabulary — keep the
   conformance-class structure (§4) intact.
2. Normative changes bump the version and get a dated changelog entry.
3. Every implementation claim carries an evidence label
   (`MOCK` / `REALDEAL_TEST` / `REALDEAL` / `PLANNED`).
