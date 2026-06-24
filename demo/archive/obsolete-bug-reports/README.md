# Obsolete Bug Reports - Archived

**Archived Date**: October 28, 2025  
**Reason**: Incorrect diagnosis - was user error, not compiler bug

---

## What Happened

These files documented what we believed was a compiler bug in compactc v0.26.0. We were wrong.

### The Diagnosis (Incorrect)
We thought the compiler had a bug where it couldn't resolve the `Address` type in later circuits.

### The Reality (Correct)
Kevin Millikin (Compact creator) revealed that `Address` doesn't exist in the Compact standard library. We should have used `ContractAddress` instead.

---

## Files Archived

1. **COMPILER_BUG_REPORT.md** - Detailed bug report prepared for GitHub
2. **COMPILER_BUG_CONFIRMED.md** - Our confirmation of the "bug" (incorrect)
3. **GITHUB_BUG_SUBMISSION.md** - Draft submission (never sent - thankfully!)

---

## The Actual Fix

See `/ADDRESS_TYPE_BUG_RESOLVED.md` in project root for complete resolution.

**TL;DR**: Replace all `Address` with `ContractAddress` (32 occurrences across 4 files)

---

## Why Keep These?

Learning opportunity - shows the debugging process and how misleading compiler errors can be.

**Lesson**: Always verify types against standard library documentation before assuming compiler bug.

---

## Reference

- Standard Library: https://docs.midnight.network/develop/reference/compact/compact-std-library/exports
- Kevin's explanation: "There is no type Address exported by the standard library. Perhaps you meant ContractAddress."

---

*These files are preserved for historical reference only.*
