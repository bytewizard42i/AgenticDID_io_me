# Debug Questions for Manny (Midnight Kapa.AI - CompactC Expert)

**Date**: October 28, 2025  
**Project**: AgenticDID.io  
**Compiler**: compactc v0.26.0  
**Language**: Compact v0.18  

---

## 🐛 Critical Bug: "unbound identifier Address" in Later Circuits

### Error Details

```
Exception: AgenticDIDRegistry.compact line 303 char 11:
unbound identifier Address
```

**Line 303**:
```compact
export circuit revokeAgent(
  caller: Address,  // ← Error reported here: "unbound identifier Address"
  agentDID: Bytes<32>
): [] {
```

---

## 📋 Questions for Manny

### **Question 1: Import Scope Issue?**

The file has `import CompactStandardLibrary;` at the top (line 16), and `Address` works perfectly in earlier parts:

**Working examples in same file:**
- Line 26: `ledger contractOwner: Address;` ✅ Works
- Line 62: `constructor(caller: Address) {` ✅ Works  
- Line 86: `export circuit registerAgent(caller: Address, ...)` ✅ Works
- Line 189: `export circuit createDelegation(caller: Address, ...)` ✅ Works
- Line 271: `export circuit revokeDelegation(caller: Address, ...)` ✅ Works

**Failing example:**
- Line 303: `export circuit revokeAgent(caller: Address, ...)` ❌ **"unbound identifier Address"**

**Question**: Why does `Address` become "unbound" specifically at line 303 when it works fine in earlier circuits? Is there an import scope limitation or maximum file size where CompactStandardLibrary types lose scope?

---

### **Question 2: Circuit Count Limit?**

The file has **15 exported circuits** before the failing line:
1. `registerAgent` (line 85)
2. `verifyAgent` (line 132)
3. `getAgentPublicKey` (line 168)
4. `createDelegation` (line 188)
5. `checkDelegation` (line 232)
6. `revokeDelegation` (line 270)
7. `revokeAgent` (line 302) ← **FAILS HERE**

Plus **9 helper circuits** (non-exported).

**Question**: Is there a maximum number of circuits per file where type resolution breaks down? Does the compiler have a limit on symbol table size or circuit count?

---

### **Question 3: File Size Impact?**

**Contract size**: 471 lines  
**Before line 303**: ~300 lines of code  
**Line where it fails**: Approximately 65% through the file

**Question**: Is there a file size limit (in lines or bytes) where the Compact parser loses track of imported types? Should large contracts be split into multiple files?

---

### **Question 4: Parsing State Bug?**

**Observation**: When we comment out earlier circuits, the error **shifts to different lines**:
- All circuits present: Error at line 303
- Some circuits commented: Error shifts to line 271
- More circuits commented: Error shifts again

This suggests the compiler's parsing state becomes corrupted after processing a certain number of circuits.

**Question**: Is this a known issue with the parser's symbol table management between circuit definitions? Are there any workarounds for this state corruption bug?

---

### **Question 5: Contract Composition Pattern?**

The failing circuit appears right after a section with:
1. Delegation management circuits (lines 188-292)
2. Multiple struct updates with field destructuring
3. Complex return types and assertions

**Code context around line 303:**
```compact
// Previous circuit (lines 270-292) - WORKS
export circuit revokeDelegation(
  caller: Address,  // ← This Address works fine
  delegationId: Bytes<32>
): [] {
  // ... struct destructuring and updates ...
}

// ============================================================================
// AGENT REVOCATION  
// ============================================================================

// Next circuit (lines 302-330) - FAILS
export circuit revokeAgent(
  caller: Address,  // ← This Address fails: "unbound identifier"
  agentDID: Bytes<32>
): [] {
```

**Question**: Does struct destructuring or complex updates in the previous circuit affect type resolution in subsequent circuits? Should there be spacing or different patterns between circuits?

---

### **Question 6: Workarounds?**

We've tried:
- ❌ Re-importing CompactStandardLibrary before the failing circuit
- ❌ Checking all semicolons
- ❌ Verifying brace balance
- ❌ Fixing indentation
- ❌ Commenting out other circuits (error just shifts)
- ❌ Removing `const` local variables
- ❌ Simplifying circuit logic

**Question**: What are the known workarounds for this "unbound identifier" bug? Should we:
1. Split into multiple contract files?
2. Reorder circuits differently?
3. Use a different compiler flag?
4. Upgrade/downgrade compiler version?
5. Avoid certain Compact patterns?

---

### **Question 7: Minimal Reproduction**

Here's the minimal reproduction from our testing:

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
# Exception: test_minimal.compact line 14 char 31:
# unbound identifier Address
```

**Question**: Can you reproduce this? Is it a confirmed bug in compactc v0.26.0? Should we file a GitHub issue?

---

### **Question 8: Inter-Contract Calls Impact?**

Our contract uses **sealed ledger** for contract composition:

```compact
// Line 24
sealed ledger registryContract: AgenticDIDRegistry;

// Constructor (line 72)
constructor(
  owner: Address,
  initialSpoofRatio: Uint<8>,
  registry: AgenticDIDRegistry
) {
  registryContract = registry;  // Initialize sealed ledger
}
```

**Question**: Does using `sealed ledger` for inter-contract calls affect type resolution? Could the sealed ledger initialization interfere with CompactStandardLibrary type availability?

---

### **Question 9: Language Version Mismatch?**

**File header**:
```compact
pragma language_version 0.18;
```

**Compiler version**: 0.26.0  
**Language version**: 0.18

**Question**: Is there a known incompatibility between compiler v0.26.0 and language v0.18 that causes this type resolution issue? Should we use a different language version pragma?

---

### **Question 10: Alternative Type Declaration?**

Instead of relying on imported `Address`, should we declare it locally?

**Current**:
```compact
import CompactStandardLibrary;

export circuit myCircuit(caller: Address): [] {
```

**Alternative 1** (explicit import):
```compact
import CompactStandardLibrary;
import { Address } from CompactStandardLibrary;  // Explicit?

export circuit myCircuit(caller: Address): [] {
```

**Alternative 2** (type alias):
```compact
import CompactStandardLibrary;

type Addr = Address;  // Alias before circuits?

export circuit myCircuit(caller: Addr): [] {
```

**Question**: Are there alternative patterns for using Address type that avoid this compiler bug?

---

### **Question 11: Build Tool Recommendation?**

We're compiling with raw `compactc` directly:
```bash
compactc --skip-zk AgenticDIDRegistry.compact ./compiled/
```

**Question**: Should we be using a different build tool or workflow? Does using:
- `npx run-compactc`
- Midnight SDK build tools
- Project builder patterns
...avoid this issue?

---

### **Question 12: Compiler Flags?**

We're using `--skip-zk` flag. 

**Question**: Are there other compiler flags that affect type resolution?
```bash
# What we're using:
compactc --skip-zk source.compact output/

# Should we try:
compactc --debug source.compact output/
compactc --verbose source.compact output/
compactc <other-flags?> source.compact output/
```

---

### **Question 13: Contract Structure Best Practices?**

Our structure:
```
1. File header (pragma, imports)
2. State variables (ledger declarations)
3. Data structures (structs)
4. Constructor
5. Exported circuits (15 total)
6. Helper circuits (9 total)
```

**Question**: Is there a recommended contract structure or organization pattern that avoids this compiler bug? Should circuits be ordered differently? Should we separate into modules?

---

## 📊 Full Context

### Complete Error Output
```
$ compactc --skip-zk AgenticDIDRegistry.compact ./compiled/
Exception: AgenticDIDRegistry.compact line 303 char 11:
unbound identifier Address
```

### File Structure
- **Total lines**: 471
- **Imports**: CompactStandardLibrary (line 16)
- **Ledger variables**: 7 total (lines 22-32)
- **Structs**: 3 (AgentCredential, Delegation, VerificationRecord)
- **Constructor**: 1 (line 62)
- **Exported circuits**: 15+ 
- **Helper circuits**: 9+
- **Language version**: 0.18
- **Compiler version**: 0.26.0

### What's Been Verified
- ✅ All braces balanced
- ✅ All semicolons present
- ✅ Indentation consistent
- ✅ No syntax errors (syntax fixes already applied)
- ✅ Import statement correct
- ✅ Address works in earlier circuits
- ✅ Minimal reproduction confirms it's a compiler issue

---

## 🎯 What We Need

### Primary Questions
1. **Root cause**: Why does Address become "unbound" after certain circuits?
2. **Workaround**: How can we compile this contract successfully?
3. **Confirmed bug?**: Is this a known issue in compactc v0.26.0?

### Secondary Questions
4. Best practices for large contracts?
5. Should we upgrade/downgrade compiler?
6. Alternative patterns to avoid the bug?

---

## 📎 Attachments Available

1. **AgenticDIDRegistry.compact** - Full contract (471 lines)
2. **CredentialVerifier.compact** - Second contract with sealed ledger (407 lines)
3. **ProofStorage.compact** - Third contract (468 lines)
4. **test_minimal.compact** - Minimal reproduction (14 lines)
5. **COMPILER_BUG_REPORT.md** - Detailed bug documentation

---

## 🙏 Request to Manny

Please help us understand:
1. Is this a known bug in compactc v0.26.0?
2. What's the recommended workaround?
3. Should we file a GitHub issue?
4. Are there compiler flags or patterns that avoid this?

We've spent significant time debugging and our contracts are blocked from deployment due to this compiler issue.

**Thank you for your expertise!** 🙏

---

## 📧 Contact

**Project**: AgenticDID.io (Agentic Identity for AI Agents)  
**Phase**: Midnight Network Integration (Phase 2)  
**Timeline**: Blocked on this compiler issue  
**Hackathon**: Google Cloud Run + Midnight Network

---

**Prepared by**: Cascade AI + Johnny (ByteWizard42i)  
**Date**: October 28, 2025  
**Session**: Contract debugging and compilation testing
