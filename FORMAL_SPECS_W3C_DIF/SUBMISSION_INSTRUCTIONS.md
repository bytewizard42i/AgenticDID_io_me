# Submission Instructions — AgenticDID

Procedures verified against primary sources July 27, 2026 (W3C Community
and Business Group Process, W3C Community CLA, CCG charter, DIF working
group pages, DIF Labs charter). Re-verify before acting. The full
generic playbook lives in
`didz-kernel/FORMAL_SPECS_W3C_DIF/SUBMISSION_INSTRUCTIONS.md`; this file
covers only what is AgenticDID-specific.

## Step 0 — Provenance first

1. AgenticDID's repo (`bytewizard42i/AgenticDID_io_me`) must be PUBLIC
   for the timestamp to count (John's call).
2. Git tag + GitHub Release (e.g. `agenticdid-spec-v0.1`).
3. Internet Archive snapshot of the released spec; optionally Zenodo DOI.

## Step 0.5 — IP gate

Same as the kernel: W3C CLA = royalty-free copyright + patent
commitments on contributions; DIF outputs are open-source/royalty-free.
If any AgenticDID mechanism (e.g., budget-conserving attenuation,
cascade revocation over committed graphs) is ever to be patented, file
the provisional BEFORE contributing. John's decision only.

## Step 1 — DIF (PRIMARY venue)

The **Trusted AI Agents Working Group** is chartered for exactly this
space, and the existing `docs/DIF_STANDARDIZATION_PLAN.md` already maps
the three proposal artifacts (reference implementation, spec, killer
demo). Path:

1. Join DIF (membership required for substantive WG contributions).
2. Send `letters/LETTER_DIF.md` to the TAAWG list; request a
   presentation slot for the proof-of-authority demo.
3. Propose as a Pre-Draft work item (DIF lifecycle: Pre-Draft →
   PROPOSED → REFINING → STABLE). John listed as editor.
4. **Submit jointly with the DIDz Protocol** so DIF sees one stack:
   kernel + delegation profile. Do not let them be evaluated as two
   unrelated proposals.

## Step 2 — W3C CCG (secondary, parallel or after)

1. Free W3C account → join the Credentials Community Group (CLA).
2. Send `letters/LETTER_W3C.md` to `public-credentials@w3.org` with
   subject `[agenticdid] Introduction: privacy-preserving delegated
   authority for autonomous agents`.
3. Present on a weekly CCG call; propose as a CCG work item if there is
   appetite (the CCG and DIF routinely co-incubate).

## Step 3 — Aftercare

Create `SUBMISSION_LOG.md` here on first submission (date, venue, URL,
archive link, per event). Keep the spec header's Status line current.
