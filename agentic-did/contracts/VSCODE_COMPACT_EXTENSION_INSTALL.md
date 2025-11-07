# 📝 VSCode Compact Extension Installation Guide

**Created by**: Penny  
**For**: John Santi  
**Date**: November 7, 2025  

---

## 🎯 What is the Compact Extension?

The **Midnight Compact VSCode Extension** provides:
- ✅ **Syntax highlighting** for `.compact` files
- ✅ **Live dynamic checking** (like TypeScript checking)
- ✅ **Error detection** while you code
- ✅ **Auto-completion** for Compact keywords
- ✅ **Inline compiler errors** with `--vscode` flag integration

---

## 📦 Download Location

**Official Release Site**: https://releases.midnight.network/

The VSCode extension is available in the `vscode` directory of the Midnight releases repository.

**Documentation**:
- [Compact VSCode Extension Docs](https://docs.midnight.network/develop/tutorial/building/prereqs#optional-visual-studio-code-vscode-extension-for-compact)
- [Midnight Releases Repository](https://github.com/midnight-ntwrk/releases)

---

## 🔧 Installation Methods

### Method 1: Direct Download (Recommended)

1. **Visit the releases page**:
   ```bash
   # Open in browser:
   https://releases.midnight.network/vscode/
   ```

2. **Download the latest `.vsix` file**:
   - Look for `compact-X.X.X.vsix` (where X.X.X is the version)
   - Download to your local machine

3. **Install in VSCode**:
   
   **Option A - Via VSCode UI**:
   - Open VSCode
   - Go to Extensions panel (`Ctrl+Shift+X`)
   - Click the `...` (three dots) menu at the top
   - Select **"Install from VSIX..."**
   - Browse to the downloaded `.vsix` file
   - Click "Install"

   **Option B - Via Command Line**:
   ```bash
   code --install-extension /path/to/compact-X.X.X.vsix
   ```

---

### Method 2: Manual Installation (WSL/Remote)

Since you're using VSCode with WSL (Windsurf on laptop), you may need to install for the remote server:

1. **Download the extension**:
   ```bash
   cd ~/Downloads
   wget https://releases.midnight.network/vscode/compact-latest.vsix
   # OR find the specific version URL
   ```

2. **Install for VSCode Server**:
   ```bash
   # If using VSCode Remote/WSL
   ~/.vscode-server/bin/<vscode-commit-id>/bin/code-server --install-extension compact-latest.vsix
   
   # OR for regular VSCode
   code --install-extension compact-latest.vsix
   ```

3. **Restart VSCode/Windsurf**

---

### Method 3: GitHub Clone (For Latest Dev Version)

```bash
# Clone the releases repository
git clone https://github.com/midnight-ntwrk/releases.git
cd releases
git checkout gh-pages

# Find the VSCode extension
cd vscode
ls -lh *.vsix

# Install the extension
code --install-extension ./compact-*.vsix
```

---

## ✅ Verify Installation

After installation, verify it's working:

1. **Check installed extensions**:
   ```bash
   code --list-extensions | grep -i compact
   # Should show: midnight-ntwrk.compact (or similar)
   ```

2. **Open a `.compact` file**:
   - Navigate to `/home/js/AgenticDID_CloudRun/agentic-did/contracts/`
   - Open `AgenticDIDRegistry.compact`
   - You should see:
     - ✅ Syntax highlighting
     - ✅ Proper indentation
     - ✅ Keyword coloring

3. **Test compiler integration**:
   - Make a syntax error in a `.compact` file
   - You should see red squiggly underlines
   - Hover over errors for details

---

## 🎨 Extension Features

Once installed, you get:

### 1. **Syntax Highlighting**
```compact
// Keywords highlighted
export circuit registerAgent(
  caller: ContractAddress,  // Types highlighted
  did: Bytes<32>            // Primitive types too
): [] {
  assert(condition, "Error");  // Built-ins highlighted
}
```

### 2. **Live Error Checking**
The extension runs the compiler in the background with `--vscode` flag:
```compact
// This will show errors immediately:
export circuit badFunction(x: Address) {  // Error: Address not defined
  let y: Int = "string";  // Error: Type mismatch
}
```

### 3. **Inline Documentation**
Hover over Compact keywords for documentation:
- `ledger` - Persistent storage
- `circuit` - Zero-knowledge circuit
- `disclose` - Make witness data public
- etc.

---

## 🔧 Compiler Integration

The extension integrates with the Compact compiler:

### VSCode-Specific Compiler Flag

When compiling from command line with VSCode open:
```bash
~/.compact/versions/0.26.0/x86_64-unknown-linux-musl/compactc \
  --vscode \
  --skip-zk \
  AgenticDIDRegistry.compact \
  build/
```

The `--vscode` flag formats errors for VSCode:
```
AgenticDIDRegistry.compact:318:11: unbound identifier Address
```

Instead of multi-line errors, making them clickable in VSCode!

---

## 🐛 Troubleshooting

### Extension Not Loading

**Check if installed**:
```bash
code --list-extensions
```

**Reinstall**:
```bash
code --uninstall-extension midnight-ntwrk.compact
code --install-extension /path/to/compact.vsix
```

### No Syntax Highlighting

1. **Check file association**:
   - Bottom-right of VSCode should show "Compact" as language
   - If not, click language selector and choose "Compact"

2. **Manually set language**:
   - `Ctrl+Shift+P` → "Change Language Mode"
   - Select "Compact"

3. **Check extension is enabled**:
   - Extensions panel → Search "Compact"
   - Should be enabled (not disabled)

### Extension Not Working in WSL

For WSL/Remote environments:
```bash
# Install in WSL specifically
cd ~/Downloads
# Download the .vsix file first
code --install-extension compact.vsix

# Restart VSCode
# In VSCode: Ctrl+Shift+P → "Developer: Reload Window"
```

---

## 📚 Additional Configuration

### VSCode Settings for Compact

Add to your `.vscode/settings.json`:

```json
{
  "files.associations": {
    "*.compact": "compact"
  },
  "editor.formatOnSave": false,
  "[compact]": {
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.formatOnSave": false
  },
  "compact.compilerPath": "~/.compact/bin/compactc"
}
```

### Workspace Recommendations

Create `.vscode/extensions.json` in your project:

```json
{
  "recommendations": [
    "midnight-ntwrk.compact"
  ]
}
```

This will prompt teammates to install the Compact extension!

---

## 🌟 Alternative: Manual Syntax Highlighting

If you can't get the extension, you can get basic syntax highlighting:

### Create Custom Language Definition

1. **Create `.vscode/compact.tmLanguage.json`**:
```json
{
  "scopeName": "source.compact",
  "name": "Compact",
  "fileTypes": ["compact"],
  "patterns": [
    {
      "name": "keyword.control.compact",
      "match": "\\b(export|circuit|ledger|struct|const|let|if|else|for|while|return|assert|disclose|witness)\\b"
    },
    {
      "name": "storage.type.compact",
      "match": "\\b(Bytes|Uint|Boolean|ContractAddress|Map)\\b"
    },
    {
      "name": "string.quoted.double.compact",
      "begin": "\"",
      "end": "\""
    },
    {
      "name": "comment.line.double-slash.compact",
      "match": "//.*$"
    }
  ]
}
```

2. **Add to settings.json**:
```json
{
  "files.associations": {
    "*.compact": "typescript"  // Use TypeScript highlighting as fallback
  }
}
```

---

## 🎯 Quick Start After Installation

Once the extension is installed:

1. **Open your project**:
   ```bash
   cd /home/js/AgenticDID_CloudRun/agentic-did
   windsurf .
   # OR
   code .
   ```

2. **Open a contract**:
   - `contracts/AgenticDIDRegistry.compact`

3. **You should see**:
   - Pretty syntax colors ✅
   - Keyword highlighting ✅
   - Type colors ✅

4. **Test error detection**:
   - Add a line: `let x: Address = disclose(caller);`
   - Should show error: "unbound identifier Address"
   - Change to: `let x: ContractAddress = disclose(caller);`
   - Error disappears! ✅

---

## 📋 Summary

**To install the Compact VSCode extension**:

1. Visit https://releases.midnight.network/vscode/
2. Download the latest `.vsix` file
3. Install via VSCode: Extensions → `...` → Install from VSIX
4. Restart VSCode
5. Open a `.compact` file
6. Enjoy syntax highlighting and live error checking!

---

## 🔗 Useful Links

- **Midnight Docs**: https://docs.midnight.network
- **Releases**: https://releases.midnight.network
- **Compact Reference**: https://docs.midnight.network/develop/reference/compact
- **GitHub Releases Repo**: https://github.com/midnight-ntwrk/releases

---

**Happy Compact coding, John!** 🌙✨

**Note**: If you have trouble accessing the download, let me know and I can help you find alternative methods or create a custom syntax highlighter!

---

**Created by**: Penny 💜  
**Status**: Ready to Install 📦  
**Benefit**: Better IDE Support for Compact Development 🚀
