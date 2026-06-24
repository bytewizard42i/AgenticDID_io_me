# Compiler Bug Report: "unbound identifier Address" in Later Circuits

**Date**: October 24, 2025  
**Reporter**: ByteWizard42i (Johnny/Manny Midnight)  
**Compiler**: compactc_v0.26.0_x86_64-unknown-linux-musl  
**Language Version**: 0.18  

---

## 🐛 **Bug Description:**

The Compact compiler reports "unbound identifier Address" on circuit parameters in later circuits, even though:
1. `import CompactStandardLibrary;` is present
2. `Address` works correctly in earlier parts of the file
3. All syntax is valid per documentation
4. Error shifts to different lines when circuits are commented out

---

## 🔬 **Minimal Reproducible Example:**

```compact
pragma language_version 0.18;
import CompactStandardLibrary;

ledger owner: Address;

constructor(addr: Address) {
  owner = addr;
}

export circuit testOne(param: Address): [] {
  owner = param;
}

export circuit testTwo(param: Address): [] {
  owner = param;
}
```

**Compilation Command**:
```bash
compactc --skip-zk test_minimal.compact ./build/test
```

**Error Output**:
```
Exception: test_minimal.compact line 14 char 31:
  unbound identifier Address
```

**Line 14**: `export circuit testTwo(param: Address): [] {`

---

## ✅ **What Works:**

1. `Address` in ledger declarations (line 4)
2. `Address` in constructor parameters (line 6)
3. `Address` in first circuit parameters (line 10)

## ❌ **What Fails:**

1. `Address` in second circuit parameters (line 14) ← **ERROR HERE**
2. Error disappears if first circuit is removed
3. Error shifts to different lines when other circuits are commented out

---

## 🔍 **Additional Observations:**

### **Test 1: Single Circuit (WORKS)**
```compact
pragma language_version 0.18;
import CompactStandardLibrary;

ledger owner: Address;

constructor(addr: Address) {
  owner = addr;
}

export circuit testOne(param: Address): [] {
  owner = param;
}
```
**Result**: ✅ Compiles successfully

### **Test 2: Two Circuits (FAILS)**
Add second circuit:
```compact
export circuit testTwo(param: Address): [] {
  owner = param;
}
```
**Result**: ❌ Error on line 14: "unbound identifier Address"

### **Test 3: Error Shifting**
In larger file (AgenticDIDRegistry.compact):
- With all circuits: Error at line 303
- Comment out circuits 295-331: Error shifts to line 271
- Pattern suggests **parsing state issue**

---

## 📊 **Environment Details:**

**System**:
- OS: Linux (x86_64)
- Compiler: compactc_v0.26.0_x86_64-unknown-linux-musl
- Language Version: 0.18.0

**Compiler Check**:
```bash
$ compactc --version
0.26.0

$ compactc --language-version
0.18.0
```

---

## 📝 **Expected Behavior:**

According to [Compact documentation](https://docs.midnight.network/develop/reference/compact/lang-ref):

1. Types imported from `CompactStandardLibrary` should be available throughout the file
2. There should be no difference in type resolution based on circuit position
3. Errors should be reported at the actual point of issue, not on subsequent circuits

**Actual Behavior**: `Address` becomes "unbound" in later circuits despite correct import

---

## 💡 **Workarounds Attempted:**

1. ❌ Re-importing CompactStandardLibrary before problematic circuit
2. ❌ Verifying all semicolons on `const` bindings
3. ❌ Checking brace balance (all balanced)
4. ❌ Fixing indentation
5. ❌ Commenting out circuits (error just shifts)

**No workaround found.**

---

## 🎯 **Impact:**

**Severity**: HIGH  
**Reason**: Blocks compilation of valid contracts

This bug prevents compilation of correct Compact code, making it impossible to deploy contracts that use `Address` type in multiple circuit parameters.

---

## 📎 **Attachments:**

1. **test_minimal.compact** - Minimal reproducible example
2. **AgenticDIDRegistry.compact** - Full contract exhibiting the bug
3. **Compilation output** - Full error messages

---

## 🙏 **Request:**

Please investigate this parsing/type resolution issue in the Compact compiler v0.26.0. The error pattern suggests a bug in the compiler's symbol table management or parsing state between circuit definitions.

**Verified by**: Midnight Documentation AI (confirmed behavior is undocumented and unexpected)

---

## 📧 **Contact:**

**GitHub**: bytewizard42i  
**Project**: AgenticDID.io  
**Discord**: Available on Midnight Discord

---

**Thank you for your attention to this issue!** 🙏
