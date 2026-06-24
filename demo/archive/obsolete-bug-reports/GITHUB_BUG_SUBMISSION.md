# GitHub Bug Submission Package

## 📍 Where to Submit

**Repository**: https://github.com/midnightntwrk/compactc/issues

**Click**: "New Issue" button (green button on the right side)

---

## 🎯 Step-by-Step Instructions for Newbies

### Step 1: Navigate to Issues Page
1. Go to: https://github.com/midnightntwrk/compactc/issues
2. You'll see a list of existing issues (if any)

### Step 2: Create New Issue
1. Click the green **"New issue"** button (top right)
2. GitHub will show issue templates (if available)
3. Choose **"Bug report"** template if available
4. Or choose **"Open a blank issue"** if no templates

### Step 3: Fill in the Issue
1. **Title**: Copy the title below
2. **Description**: Copy the bug report below
3. Click **"Submit new issue"** (green button at bottom)

### Step 4: Monitor Your Issue
1. GitHub will assign it a number (e.g., #1234)
2. You'll get email notifications when team responds
3. They may ask follow-up questions in comments

---

## 📋 COPY THIS - ISSUE TITLE

```
[BUG] "unbound identifier Address" after multiple circuit definitions in single file (compactc v0.26.0)
```

---

## 📋 COPY THIS - ISSUE BODY

```markdown
## Bug Description

The Compact compiler reports `"unbound identifier Address"` on circuit parameters after processing several circuits in a single file, despite:
- `import CompactStandardLibrary;` being present at file top
- `Address` type working correctly in earlier parts of the same file
- All syntax being valid per Compact v0.18 specification

The error **shifts to different line numbers** when circuits are commented out, suggesting a compiler parsing state issue rather than code error.

## Environment

- **Compiler Version**: `compactc v0.26.0`
- **Language Version**: `0.18`
- **Compiler Binary**: `compactc_v0.26.0_x86_64-unknown-linux-musl`
- **OS**: Linux x86_64
- **Compilation Command**: `compactc --skip-zk <source.compact> <output-dir>/`

## Minimal Reproduction

This **14-line example** reproduces the bug identically:

```compact
pragma language_version 0.18;
import CompactStandardLibrary;

ledger owner: Address;

constructor(addr: Address) {
  owner = addr;
}

export circuit circuitOne(param: Address): [] {
  owner = param;
}

export circuit circuitTwo(param: Address): [] {
  owner = param;  // ← Error: "unbound identifier Address"
}
```

**Compilation**:
```bash
compactc --skip-zk test_minimal.compact ./build/
```

**Error Output**:
```
Exception: test_minimal.compact line 14 char 31:
unbound identifier Address
```

## What Works vs What Fails

In the same file:

✅ **Works**: `Address` in ledger declarations (line 4)  
✅ **Works**: `Address` in constructor (line 6)  
✅ **Works**: `Address` in first circuit (line 10)  
❌ **Fails**: `Address` in second circuit (line 14)

## Error Behavior

1. **Single circuit**: Compiles successfully
2. **Two circuits**: Error on second circuit's `Address` parameter
3. **Comment out first circuit**: Second circuit now compiles (error disappears)
4. **In larger file (471 lines)**: Error at line 303, but shifts when circuits are commented out

This pattern strongly indicates a **compiler parsing state bug** where the symbol table becomes corrupted after processing certain amounts of code.

## Real-World Impact

This blocks compilation of valid contracts that need multiple circuits. Our production contract (`AgenticDIDRegistry.compact`, 471 lines) uses `Address` successfully 6 times before failing on the 7th occurrence.

**Working occurrences**:
- Line 26: `ledger contractOwner: Address;`
- Line 62: `constructor(caller: Address)`
- Line 86: `export circuit registerAgent(caller: Address, ...)`
- Line 189: `export circuit createDelegation(caller: Address, ...)`
- Line 271: `export circuit revokeDelegation(caller: Address, ...)`

**Failing occurrence**:
- Line 303: `export circuit revokeAgent(caller: Address, ...)` ← **Error here**

## Workarounds Attempted

All failed:
- ❌ Re-importing `CompactStandardLibrary` before problematic circuit
- ❌ Reordering circuit definitions
- ❌ Removing local `const` variables
- ❌ Simplifying circuit logic
- ❌ Adjusting indentation/formatting
- ❌ Verifying all braces/semicolons balanced

## Expected Behavior

Per [Compact documentation](https://docs.midnight.network/develop/reference/compact/lang-ref):
- Types imported from `CompactStandardLibrary` should remain available throughout the file
- Type resolution should not depend on circuit position or count
- Errors should be reported at actual point of issue, not on subsequent valid code

## Actual Behavior

`Address` becomes "unbound" in later circuits despite correct import and earlier successful usage in the same file.

## Additional Context

This was confirmed by Manny (Midnight Kapa.AI trained on CompactC) as:
- ✅ Code usage is correct
- ✅ Import pattern is correct  
- ❌ Not a documented issue
- ❌ No known workaround
- **Conclusion**: Appears to be compiler bug

## Request

Please investigate this parsing/type resolution issue in compactc v0.26.0. The error pattern and minimal reproduction suggest a bug in the compiler's symbol table management between circuit definitions.

## Files Available

Can provide upon request:
1. `test_minimal.compact` - 14-line minimal reproduction (above)
2. `AgenticDIDRegistry.compact` - Full 471-line contract exhibiting the bug
3. Full compilation output and debug logs

## Project Context

- **Project**: AgenticDID.io (Agentic Identity for AI Agents)
- **Phase**: Midnight Network Integration (Phase 2)
- **Hackathon**: Google Cloud Run + Midnight Network
- **Status**: Blocked on this compiler issue

Thank you for your attention to this issue! Happy to provide any additional information needed.
```

---

## ✅ After Submitting

1. **Save the issue URL** (e.g., https://github.com/midnightntwrk/compactc/issues/XXX)
2. **Add to your docs**: Save the link in `COMPILER_BUG_REPORT.md`
3. **Monitor for responses**: Check GitHub notifications
4. **Be ready to provide files**: Have `AgenticDIDRegistry.compact` ready if they ask

---

## 💡 Tips

- **Be patient**: Response may take 1-7 days
- **Be helpful**: Answer any follow-up questions promptly
- **Be concise**: The report above is already detailed enough
- **Check back**: Sometimes they fix it without commenting

---

## 🔗 Useful Links

- **Issue tracker**: https://github.com/midnightntwrk/compactc/issues
- **Midnight Discord**: https://discord.gg/midnight (for faster questions)
- **Documentation**: https://docs.midnight.network
- **Compact reference**: https://docs.midnight.network/develop/reference/compact/lang-ref

---

**Good luck!** Your minimal reproduction is perfect and will help the Midnight team fix this quickly. 🚀
